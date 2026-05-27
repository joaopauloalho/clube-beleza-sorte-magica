import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  whatsapp: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  plano: z.enum(['Beleza Essencial', 'Beleza Radiante', 'Beleza Suprema']),
})

const PLAN_PRICES: Record<string, { price: number; label: string }> = {
  'Beleza Essencial': { price: 4990, label: 'R$ 49,90' },
  'Beleza Radiante':  { price: 7490, label: 'R$ 74,90' },
  'Beleza Suprema':   { price: 9990, label: 'R$ 99,90' },
}

const ABACATE_BASE = 'https://api.abacatepay.com'

async function abacatePost(path: string, body: unknown) {
  return fetch(`${ABACATE_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() })
    }

    const { nome, email, whatsapp, cpf, plano } = parsed.data

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado. Entre em contato para verificar sua vaga.' })
    }

    // Insert lead with status pendente
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .insert({ nome, email, whatsapp, cpf, plano_interesse: plano, status: 'pendente' })
      .select('id')
      .single()

    if (leadErr) {
      console.error('[checkout] lead insert error:', leadErr)
      if (leadErr.code === '23505') {
        return res.status(409).json({ error: 'Email já cadastrado. Entre em contato para verificar sua vaga.' })
      }
      return res.status(500).json({ error: 'Erro ao salvar cadastro. Tente novamente.' })
    }

    if (!lead) {
      return res.status(500).json({ error: 'Erro ao salvar cadastro. Tente novamente.' })
    }

    const { price } = PLAN_PRICES[plano]

    // Create PIX transparent payment — minimal payload to isolate error
    const pixRes = await abacatePost('/v2/transparents/create', {
      amount: price,
    })

    const pixBody = await pixRes.text()
    console.log('[checkout] pix status:', pixRes.status)
    console.log('[checkout] pix body:', pixBody)

    if (!pixRes.ok) {
      await supabase.from('leads').delete().eq('id', lead.id)
      return res.status(502).json({ error: `AbacatePay ${pixRes.status}: ${pixBody.slice(0, 300)}` })
    }

    const pixJson = JSON.parse(pixBody) as { data?: { id: string; brCode: string; brCodeBase64: string } }
    const pixId = pixJson.data?.id
    const brCode = pixJson.data?.brCode
    const brCodeBase64 = pixJson.data?.brCodeBase64

    if (!pixId || !brCode) {
      console.error('[checkout] pix response missing data:', pixBody)
      await supabase.from('leads').delete().eq('id', lead.id)
      return res.status(502).json({ error: 'Erro ao criar link de pagamento. Tente novamente.' })
    }

    await supabase.from('leads').update({ checkout_id: pixId }).eq('id', lead.id)

    return res.status(200).json({ brCode, brCodeBase64, pixId })
  } catch (error) {
    console.error('[checkout] error:', error)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
