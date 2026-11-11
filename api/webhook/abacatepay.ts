import type { VercelRequest, VercelResponse } from '@vercel/node'
import { assinarCorpo, assinaturaConfere, compararSegredo } from '../_lib/signature'
import { clienteServico } from '../_lib/supabase-admin'
import { efeitoNoMembro, interpretarEvento } from '../_lib/webhook-eventos'

export const config = { api: { bodyParser: false } }

async function corpoBruto(req: VercelRequest): Promise<Buffer> {
  const bruto = (req as VercelRequest & { rawBody?: Buffer | string }).rawBody
  if (Buffer.isBuffer(bruto)) return bruto
  if (typeof bruto === 'string') return Buffer.from(bruto)
  const pedacos: Buffer[] = []
  for await (const pedaco of req) {
    pedacos.push(Buffer.isBuffer(pedaco) ? pedaco : Buffer.from(pedaco))
  }
  return Buffer.concat(pedacos)
}

function segredoRecebido(req: VercelRequest): string {
  const header = req.headers['x-webhook-secret']
  const doHeader = Array.isArray(header) ? header[0] : header
  const query = req.query.webhookSecret
  const daQuery = Array.isArray(query) ? query[0] : query
  return doHeader || (typeof daQuery === 'string' ? daQuery : '')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const esperado = process.env.ABACATEPAY_WEBHOOK_SECRET
  if (!esperado) return res.status(500).json({ erro: 'ABACATEPAY_WEBHOOK_SECRET ausente.' })

  const bruto = await corpoBruto(req)
  const assinatura = String(req.headers['x-webhook-signature'] ?? '')
  if (!compararSegredo(segredoRecebido(req), esperado) || !assinaturaConfere(bruto, assinatura)) {
    return res.status(401).json({ erro: 'Webhook recusado.' })
  }

  let payload: unknown
  try {
    payload = JSON.parse(bruto.toString('utf8'))
  } catch {
    return res.status(400).json({ erro: 'JSON inválido.' })
  }

  const acao = interpretarEvento(payload)
  if (acao.tipo === 'recusar') return res.status(acao.status).json({ erro: acao.motivo })

  const eventoId = (payload as { id: string }).id
  const eventoNome = (payload as { event?: string }).event ?? 'desconhecido'
  const admin = clienteServico()
  const reivindicacao = await admin.from('webhook_eventos').insert({
    id: eventoId,
    evento: eventoNome,
    dev_mode: true,
    payload,
    resultado: 'recebido',
  })

  if (reivindicacao.error?.code === '23505') {
    return res.status(200).json({ ok: true, duplicado: true })
  }
  if (reivindicacao.error) {
    return res.status(500).json({ erro: 'Não foi possível registrar o evento.' })
  }

  try {
    if (acao.tipo === 'ignorar') {
      await admin.from('webhook_eventos').update({ resultado: acao.motivo }).eq('id', eventoId)
      return res.status(200).json({ ok: true, ignorado: acao.motivo })
    }

    let assinatura = null
    if (acao.subscriptionId) {
      const busca = await admin.from('assinaturas').select('*').eq('subscription_id', acao.subscriptionId).maybeSingle()
      assinatura = busca.data
    }
    if (!assinatura && acao.checkoutId) {
      const busca = await admin.from('assinaturas').select('*').eq('checkout_id', acao.checkoutId).maybeSingle()
      assinatura = busca.data
    }
    if (!assinatura && acao.externalId) {
      const busca = await admin.from('assinaturas').select('*').eq('external_id', acao.externalId).maybeSingle()
      assinatura = busca.data
    }

    if (!assinatura) {
      await admin.from('webhook_eventos').update({ resultado: 'sem_assinatura' }).eq('id', eventoId)
      return res.status(200).json({ ok: true, aviso: 'sem_assinatura' })
    }

    const membroAtual = await admin.from('membros').select('id, status, em_dia, grupo_id').eq('id', assinatura.membro_id).single()
    if (!membroAtual.data) {
      await admin.from('webhook_eventos').update({ resultado: 'sem_membro' }).eq('id', eventoId)
      return res.status(200).json({ ok: true, aviso: 'sem_membro' })
    }

    const efeito = efeitoNoMembro(acao, { status: membroAtual.data.status, emDia: membroAtual.data.em_dia })
    if (!efeito) {
      await admin.from('webhook_eventos').update({ resultado: 'sem_efeito' }).eq('id', eventoId)
      return res.status(200).json({ ok: true })
    }

    await admin.from('membros').update({ status: efeito.status, em_dia: efeito.emDia }).eq('id', membroAtual.data.id)
    await admin.from('assinaturas').update({
      status: efeito.assinaturaStatus,
      subscription_id: acao.subscriptionId ?? assinatura.subscription_id,
      motivo: 'motivo' in acao ? acao.motivo : null,
      dev_mode: true,
      updated_at: new Date().toISOString(),
    }).eq('id', assinatura.id)

    if (efeito.pagamentoStatus) {
      await admin.from('pagamentos').insert({
        membro_id: membroAtual.data.id,
        assinatura_id: assinatura.id,
        grupo_id: membroAtual.data.grupo_id,
        competencia: new Date().toISOString().slice(0, 10),
        parcela: 'competenciaSugerida' in acao ? acao.competenciaSugerida : null,
        valor_centavos: 'valorCentavos' in acao ? acao.valorCentavos : null,
        status: efeito.pagamentoStatus,
        motivo: 'motivo' in acao ? acao.motivo : null,
        abacate_payment_id: 'paymentId' in acao ? acao.paymentId : null,
        evento_id: eventoId,
        dev_mode: true,
      })
    }

    await admin.from('webhook_eventos').update({ resultado: efeito.assinaturaStatus }).eq('id', eventoId)
    return res.status(200).json({ ok: true })
  } catch (error) {
    await admin.from('webhook_eventos').delete().eq('id', eventoId)
    console.error('[webhook]', error instanceof Error ? error.message : 'falha')
    return res.status(500).json({ erro: 'Falha ao processar o evento.' })
  }
}

export { assinarCorpo }
