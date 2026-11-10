import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  classifyCancellation,
  classifyChargeFailure,
  secretsMatch,
  verifyAbacateSignature,
} from './verify'

export const config = {
  api: {
    bodyParser: false,
  },
}

type WebhookData = {
  subscription?: {
    id?: string
    method?: string
    cancelledDueTo?: string | null
  }
  customer?: { email?: string }
  checkout?: { externalId?: string | null }
  payment?: { externalId?: string | null; status?: string; metadata?: Record<string, unknown> }
  installmentId?: string
  retryNumber?: number
  rejectCode?: string
  reason?: string
}

type WebhookBody = {
  id?: string
  event?: string
  devMode?: boolean
  data?: WebhookData
}

function readRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function header(req: VercelRequest, name: string): string {
  const value = req.headers[name.toLowerCase()]
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function queryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function leadIdFromExternal(externalId: string | null | undefined): string | null {
  if (!externalId) return null
  const match = /^lead-([0-9a-f-]{36})$/i.exec(externalId)
  return match?.[1] ?? null
}

async function findLeadId(supabase: SupabaseClient, data: WebhookData): Promise<string | null> {
  const fromExternal = leadIdFromExternal(data.checkout?.externalId ?? data.payment?.externalId)
  if (fromExternal) {
    const { data: lead } = await supabase.from('leads').select('id').eq('id', fromExternal).maybeSingle()
    if (lead?.id) return lead.id as string
  }

  const subscriptionId = data.subscription?.id
  if (subscriptionId) {
    const { data: row } = await supabase
      .from('assinaturas')
      .select('lead_id')
      .eq('abacate_subscription_id', subscriptionId)
      .maybeSingle()
    if (row?.lead_id) return row.lead_id as string
  }

  const email = data.customer?.email
  if (email) {
    const { data: lead } = await supabase.from('leads').select('id').eq('email', email).maybeSingle()
    if (lead?.id) return lead.id as string
  }

  return null
}

async function upsertAssinatura(
  supabase: SupabaseClient,
  input: {
    subscriptionId: string
    leadId: string | null
    method: string | null
    status: string
    motivo: string | null
    event: string
  },
): Promise<string | null> {
  const row: Record<string, unknown> = {
    abacate_subscription_id: input.subscriptionId,
    metodo: input.method,
    status: input.status,
    motivo: input.motivo,
    ultimo_evento: input.event,
    updated_at: new Date().toISOString(),
  }
  if (input.leadId) row.lead_id = input.leadId

  const { data, error } = await supabase
    .from('assinaturas')
    .upsert(row, { onConflict: 'abacate_subscription_id' })
    .select('id')
    .single()

  if (error) throw error
  return (data?.id as string | undefined) ?? null
}

async function recordPayment(
  supabase: SupabaseClient,
  input: {
    assinaturaId: string | null
    leadId: string | null
    eventoId: string
    installmentId: string | null
    status: string
    motivo: string | null
    tentativa: number | null
  },
) {
  const { error } = await supabase.from('pagamentos').insert({
    assinatura_id: input.assinaturaId,
    lead_id: input.leadId,
    evento_id: input.eventoId,
    abacate_installment_id: input.installmentId,
    status: input.status,
    motivo: input.motivo,
    tentativa: input.tentativa,
  })
  if (error && error.code !== '23505') throw error
}

async function setMembroStatus(
  supabase: SupabaseClient,
  leadId: string | null,
  status: string,
  onlyFrom?: string,
) {
  if (!leadId) return
  let query = supabase
    .from('membros')
    .update({ status })
    .eq('lead_id', leadId)
    .is('data_contemplacao', null)
    .not('status', 'in', '(contemplado,sorteado)')
  if (onlyFrom) query = query.eq('status', onlyFrom)
  const { error } = await query
  if (error) throw error
}

async function applyEvent(supabase: SupabaseClient, body: WebhookBody) {
  const event = body.event ?? ''
  const data = body.data ?? {}
  const leadId = await findLeadId(supabase, data)
  const subscriptionId = data.subscription?.id ?? null
  const method = data.subscription?.method ?? null

  if (event === 'checkout.completed' || event === 'transparent.completed') {
    return { ignored: 'checkout_avulso_desativado' }
  }

  if (event.startsWith('subscription.') && !subscriptionId) {
    return { ignored: 'assinatura_ausente' }
  }

  if (event === 'subscription.completed' && subscriptionId) {
    await upsertAssinatura(supabase, {
      subscriptionId,
      leadId,
      method,
      status: 'ativa',
      motivo: 'registrada_em_teste_sem_ativar_membro',
      event,
    })
    return { recorded: 'subscription.completed' }
  }

  if (event === 'subscription.renewed' && subscriptionId) {
    const assinaturaId = await upsertAssinatura(supabase, {
      subscriptionId,
      leadId,
      method,
      status: 'ativa',
      motivo: null,
      event,
    })
    await recordPayment(supabase, {
      assinaturaId,
      leadId,
      eventoId: body.id ?? subscriptionId,
      installmentId: data.installmentId ?? null,
      status: 'pago',
      motivo: null,
      tentativa: null,
    })
    await setMembroStatus(supabase, leadId, 'ativo', 'inadimplente')
    return { recorded: 'subscription.renewed' }
  }

  if (event === 'subscription.payment_failed' && subscriptionId) {
    const metaReason = typeof data.payment?.metadata?.reason === 'string' ? data.payment.metadata.reason : null
    const reason = [data.reason, metaReason, data.payment?.status].filter((part): part is string => Boolean(part)).join(' ')
    const kind = classifyChargeFailure({ rejectCode: data.rejectCode, reason })
    const motivo = [data.rejectCode, reason].filter(Boolean).join(' ') || kind
    const assinaturaId = await upsertAssinatura(supabase, {
      subscriptionId,
      leadId,
      method,
      status: kind === 'autorizacao_revogada' ? 'autorizacao_revogada' : 'inadimplente',
      motivo,
      event,
    })
    await recordPayment(supabase, {
      assinaturaId,
      leadId,
      eventoId: body.id ?? `${subscriptionId}-failed`,
      installmentId: data.installmentId ?? null,
      status: kind === 'falha_cobranca' ? 'falhou' : kind,
      motivo,
      tentativa: typeof data.retryNumber === 'number' ? data.retryNumber : null,
    })
    await setMembroStatus(
      supabase,
      leadId,
      kind === 'autorizacao_revogada' ? 'autorizacao_revogada' : 'inadimplente',
    )
    return { recorded: 'subscription.payment_failed', kind }
  }

  if (event === 'subscription.cancelled' && subscriptionId) {
    const kind = classifyCancellation({
      cancelledDueTo: data.subscription?.cancelledDueTo,
      method,
    })
    await upsertAssinatura(supabase, {
      subscriptionId,
      leadId,
      method,
      status: kind === 'autorizacao_revogada' ? 'autorizacao_revogada' : 'cancelada',
      motivo: data.subscription?.cancelledDueTo ?? kind,
      event,
    })
    await setMembroStatus(
      supabase,
      leadId,
      kind === 'autorizacao_revogada' ? 'autorizacao_revogada' : 'cancelado',
    )
    return { recorded: 'subscription.cancelled', kind }
  }

  return { ignored: event || 'evento_desconhecido' }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET || process.env.ABACATEPAY_WEBHOOK_TOKEN || ''
  const publicKey = process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY || ''
  if (!secretsMatch(queryValue(req.query.webhookSecret), secret)) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  const rawBody = await readRawBody(req)
  if (!verifyAbacateSignature(rawBody, header(req, 'x-webhook-signature'), publicKey)) {
    return res.status(401).json({ error: 'Assinatura inválida' })
  }

  let body: WebhookBody
  try {
    body = JSON.parse(rawBody) as WebhookBody
  } catch {
    return res.status(400).json({ error: 'JSON inválido' })
  }

  if (body.devMode !== true) {
    return res.status(403).json({ error: 'Apenas eventos de teste (devMode) são aceitos.' })
  }
  if (!body.id || !body.event) return res.status(400).json({ error: 'Evento sem id' })

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return res.status(500).json({ error: 'Servidor sem configuração' })

  const supabase = createClient(url, serviceKey)
  const { error: insertError } = await supabase.from('webhook_events').insert({
    id: body.id,
    event_type: body.event,
    dev_mode: true,
  })

  if (insertError?.code === '23505') return res.status(200).json({ ok: true, duplicate: true })
  if (insertError) {
    console.error('[webhook] falha ao registrar evento', insertError.code)
    return res.status(500).json({ error: 'Falha ao registrar evento' })
  }

  try {
    const result = await applyEvent(supabase, body)
    return res.status(200).json({ ok: true, ...result })
  } catch {
    console.error('[webhook] falha ao processar', body.event)
    await supabase.from('webhook_events').delete().eq('id', body.id)
    return res.status(500).json({ error: 'Falha ao processar evento' })
  }
}
