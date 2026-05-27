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

const PLAN_DEFS: Record<string, { externalId: string; name: string; description: string; price: number }> = {
  'Beleza Essencial': { externalId: 'clube-beleza-essencial', name: 'Clube de Beleza - Essencial', description: 'Assinatura mensal Plano Essencial', price: 4990 },
  'Beleza Radiante':  { externalId: 'clube-beleza-radiante',  name: 'Clube de Beleza - Radiante',  description: 'Assinatura mensal Plano Radiante',  price: 7490 },
  'Beleza Suprema':   { externalId: 'clube-beleza-suprema',   name: 'Clube de Beleza - Suprema',   description: 'Assinatura mensal Plano Suprema',   price: 9990 },
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

async function abacateGet(path: string) {
  return fetch(`${ABACATE_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}` },
  })
}

async function getOrCreateProductId(plano: string): Promise<{ id: string | null; error: string | null }> {
  const def = PLAN_DEFS[plano]

  const createRes = await abacatePost('/v2/products/create', {
    externalId: def.externalId,
    name: def.name,
    description: def.description,
    price: def.price,
    currency: 'BRL',
  })
  const createBody = await createRes.text()
  const createJson = JSON.parse(createBody) as { data?: { id: string }; error?: string }

  if (createJson.data?.id) return { id: createJson.data.id, error: null }

  // Try listing to find existing product
  const listRes = await abacateGet('/v2/products/list')
  const listBody = await listRes.text()
  const listJson = JSON.parse(listBody) as { data?: Array<{ id: string; externalId: string }> }
  const found = listJson.data?.find(p => p.externalId === def.externalId)

  if (found?.id) return { id: found.id, error: null }

  return { id: null, error: `product create: ${createBody.slice(0, 200)}` }
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

    const { data: existing } = await supabase
      .from('leads').select('id').eq('email', email).maybeSingle()

    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado. Entre em contato para verificar sua vaga.' })
    }

    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .insert({ nome, email, whatsapp, cpf, plano_interesse: plano, status: 'pendente' })
      .select('id').single()

    if (leadErr) {
      if (leadErr.code === '23505') return res.status(409).json({ error: 'Email já cadastrado.' })
      return res.status(500).json({ error: 'Erro ao salvar cadastro.' })
    }
    if (!lead) return res.status(500).json({ error: 'Erro ao salvar cadastro.' })

    // Create customer
    const custRes = await abacatePost('/v2/customers/create', {
      email, name: nome, taxId: cpf, cellphone: whatsapp,
    })
    const custJson = await custRes.json() as { data?: { id: string } }
    const customerId = custJson?.data?.id

    // Get or create product
    const { id: productId, error: productError } = await getOrCreateProductId(plano)

    if (!productId) {
      console.error('[checkout] product error:', productError)
      await supabase.from('leads').delete().eq('id', lead.id)
      return res.status(502).json({ error: 'Erro ao criar link de pagamento. Tente novamente.' })
    }

    // Hosted checkout — PIX + CARD, returns url to redirect
    const coRes = await abacatePost('/v2/checkouts/create', {
      items: [{ id: productId, quantity: 1 }],
      methods: ['PIX', 'CARD'],
      ...(customerId ? { customerId } : {}),
      externalId: `lead-${lead.id}`,
      returnUrl: `${process.env.APP_URL}/cadastro`,
      completionUrl: `${process.env.APP_URL}/cadastro?status=aguardando`,
    })

    const coBody = await coRes.text()

    if (!coRes.ok) {
      console.error('[checkout] checkout error:', coRes.status, coBody)
      await supabase.from('leads').delete().eq('id', lead.id)
      return res.status(502).json({ error: 'Erro ao criar link de pagamento. Tente novamente.' })
    }

    const coJson = JSON.parse(coBody) as { data?: { id: string; url: string } }
    const checkoutId = coJson.data?.id
    const checkoutUrl = coJson.data?.url

    if (!checkoutId || !checkoutUrl) {
      console.error('[checkout] checkout missing data:', coBody)
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
