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
  'Beleza Essencial': { externalId: 'beleza-essencial', name: 'Clube de Beleza - Plano Essencial', description: 'Acesso mensal ao Clube de Beleza Sorte Mágica', price: 4990 },
  'Beleza Radiante':  { externalId: 'beleza-radiante',  name: 'Clube de Beleza - Plano Radiante',  description: 'Acesso mensal ao Clube de Beleza Sorte Mágica', price: 7490 },
  'Beleza Suprema':   { externalId: 'beleza-suprema',   name: 'Clube de Beleza - Plano Suprema',   description: 'Acesso mensal ao Clube de Beleza Sorte Mágica', price: 9990 },
}

const ABACATE_BASE = 'https://api.abacatepay.com'

function abacateHeaders() {
  return {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function abacatePost(path: string, body: unknown) {
  return fetch(`${ABACATE_BASE}${path}`, {
    method: 'POST',
    headers: abacateHeaders(),
    body: JSON.stringify(body),
  })
}

async function getOrCreateProductId(plano: string): Promise<string | null> {
  const def = PLAN_DEFS[plano]

  // Try creating the product — idempotent via externalId
  const createRes = await abacatePost('/v2/products/create', {
    externalId: def.externalId,
    name: def.name,
    description: def.description,
    price: def.price,
    currency: 'BRL',
  })
  const createJson = await createRes.json() as { data?: { id: string }; error?: string }
  if (createJson.data?.id) return createJson.data.id

  console.warn('[checkout] product create failed, trying list. error:', createJson.error)

  // Fall back to listing products to find the existing one
  const listRes = await fetch(`${ABACATE_BASE}/v2/products/list`, { headers: abacateHeaders() })
  const listJson = await listRes.json() as { data?: Array<{ id: string; externalId: string }> }
  const found = listJson.data?.find(p => p.externalId === def.externalId)
  return found?.id ?? null
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

    // Create AbacatePay customer (email only required; extra fields optional)
    const custRes = await abacatePost('/v2/customers/create', {
      email, name: nome, taxId: cpf, cellphone: whatsapp,
    })
    const custJson = await custRes.json() as { data?: { id: string } }
    const customerId = custJson?.data?.id

    // Get or create product in AbacatePay
    const productId = await getOrCreateProductId(plano)
    if (!productId) {
      console.error('[checkout] could not get/create product for plan:', plano)
      await supabase.from('leads').delete().eq('id', lead.id)
      return res.status(502).json({ error: 'Erro ao criar link de pagamento. Tente novamente.' })
    }

    // Create hosted checkout (redirects user to AbacatePay page)
    const checkoutRes = await abacatePost('/v2/checkouts/create', {
      items: [{ id: productId, quantity: 1 }],
      ...(customerId ? { customerId } : {}),
      returnUrl: `${process.env.APP_URL}/cadastro`,
      completionUrl: `${process.env.APP_URL}/cadastro?status=aguardando`,
      methods: ['PIX'],
    })

    if (!checkoutRes.ok) {
      const errBody = await checkoutRes.text()
      console.error('[checkout] checkout status:', checkoutRes.status)
      console.error('[checkout] checkout body:', errBody)
      await supabase.from('leads').delete().eq('id', lead.id)
      return res.status(502).json({ error: 'Erro ao criar link de pagamento. Tente novamente.' })
    }

    const checkoutJson = await checkoutRes.json() as { data?: { id: string; url: string } }
    const checkoutId = checkoutJson.data?.id
    const checkoutUrl = checkoutJson.data?.url

    if (!checkoutId || !checkoutUrl) {
      console.error('[checkout] checkout response missing data:', checkoutJson)
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
