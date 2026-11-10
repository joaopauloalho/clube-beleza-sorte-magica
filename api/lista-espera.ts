import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { REGULAMENTO_ACEITE, WHATSAPP_ACEITE } from '../src/lib/consent-text'
import { listaEsperaSchema } from '../src/lib/validations'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const parsed = listaEsperaSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Dados inválidos. Confira nome, WhatsApp, plano e o aceite do regulamento.',
    })
  }

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return res.status(500).json({ error: 'Lista de espera indisponível no momento.' })
  }

  const { nome, whatsapp, plano, optin_whatsapp } = parsed.data
  const supabase = createClient(url, serviceKey)

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      nome,
      whatsapp,
      email: null,
      plano_interesse: plano,
      status: 'lista_espera',
      checkout_id: null,
    })
    .select('id')
    .single()

  if (leadError || !lead) {
    if (leadError?.code === '23505') {
      return res.status(409).json({ error: 'Este WhatsApp já está na lista de espera.' })
    }
    console.error('[lista-espera] insert', leadError?.code)
    return res.status(500).json({ error: 'Não foi possível entrar na lista. Tente de novo.' })
  }

  const consentimentos = [
    { lead_id: lead.id, tipo: 'regulamento', texto_aceito: REGULAMENTO_ACEITE },
    ...(optin_whatsapp
      ? [{ lead_id: lead.id, tipo: 'whatsapp', texto_aceito: WHATSAPP_ACEITE }]
      : []),
  ]

  const { error: consentError } = await supabase.from('consentimentos').insert(consentimentos)
  if (consentError) {
    await supabase.from('leads').delete().eq('id', lead.id)
    console.error('[lista-espera] consentimento', consentError.code)
    return res.status(500).json({ error: 'Não foi possível registrar o aceite. Tente de novo.' })
  }

  return res.status(200).json({ ok: true })
}
