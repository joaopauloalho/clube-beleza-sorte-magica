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

const PLAN_PRODUCTS: Record<string, string> = {
  'Beleza Essencial': 'prod_HkEdRX1zgXN3R6rHGw5MJqs3',
  'Beleza Radiante':  'prod_NCnDjfcbKwyFs5edEtmfUcYC',
  'Beleza Suprema':   'prod_Nj1RaWGePckwBBeJJFH5UMyz',
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
      console.error('[checkout] error inserting lead:', leadErr)
      if (leadErr.code === '23505') { // unique_violation
        return res.status(409).json({ error: 'Email já cadastrado. Entre em contato para verificar sua vaga.' })
      }
      return res.status(500).json({ error: 'Erro ao salvar cadastro. Tente novamente.' })
    }

    if (!lead) {
      console.error('[checkout] error: lead insert returned no data')
      return res.status(500).json({ error: 'Erro ao salvar cadastro. Tente novamente.' })
    }

    // Create AbacatePay customer (optional — links CPF to billing)
    const custRes = await abacatePost('/v2/customers/create', {
      data: { name: nome, email, taxId: cpf.replace(/\D/g, ''), cellphone: whatsapp },
    })
    const custJson = await custRes.json() as { data?: { id: string } }
    const customerId = custJson?.data?.id

    // Create AbacatePay checkout
    const billingRes = await abacatePost('/v2/checkouts/create', {
      products: [{ id: PLAN_PRODUCTS[plano], quantity: 1 }],
      ...(customerId ? { customerId } : {}),
      returnUrl: `${process.env.APP_URL}/cadastro`,
      completionUrl: `${process.env.APP_URL}/cadastro?status=aguardando`,
    })

    if (!billingRes.ok) {
      const errBody = await billingRes.text()
      console.error('[checkout] billing status:', billingRes.status)
      console.error('[checkout] billing body:', errBody)
      await supabase.from('leads').delete().eq('id', lead.id)
      return res.status(502).json({ error: 'Erro ao criar link de pagamento. Tente novamente.' })
    }

    const billingJson = await billingRes.json() as { data?: { id: string; url: string } }
    const checkoutId = billingJson.data?.id
    const checkoutUrl = billingJson.data?.url

    if (!checkoutId || !checkoutUrl) {
      console.error('[checkout] error: AbacatePay billing response missing data', billingJson)
      await supabase.from('leads').delete().eq('id', lead.id)
      return res.status(502).json({ error: 'Erro ao criar link de pagamento. Tente novamente.' })
    }

    await supabase.from('leads').update({ checkout_id: checkoutId }).eq('id', lead.id)

    return res.status(200).json({ checkoutUrl })
  } catch (error) {
    console.error('[checkout] error:', error)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
