import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

interface WebhookPayload {
  event: string
  data: {
    id: string
    status: string
    customer?: { email?: string }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Verify token sent by AbacatePay as query param
  const token = req.query.token as string | undefined
  if (!token || token !== process.env.ABACATEPAY_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body as WebhookPayload

  // Only process confirmed checkout payments
  if (body.event !== 'checkout.completed' || body.data?.status !== 'PAID') {
    return res.status(200).json({ ok: true, skipped: true })
  }

  const checkoutId = body.data.id

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  try {
    const { data: lead } = await supabase
      .from('leads')
      .select('id, email, status')
      .eq('checkout_id', checkoutId)
      .maybeSingle()

    if (!lead) {
      console.warn('[webhook] Lead not found for checkout_id:', checkoutId)
      return res.status(200).json({ ok: true, warning: 'lead_not_found' })
    }

    // Idempotency: skip if already active
    if (lead.status === 'ativo') {
      return res.status(200).json({ ok: true, skipped: 'already_active' })
    }

    await supabase.from('leads').update({ status: 'ativo' }).eq('id', lead.id)

    // Create Supabase Auth user — Supabase sends magic link email automatically
    const { error: authErr } = await supabase.auth.admin.createUser({
      email: lead.email,
      email_confirm: true,
    })

    if (authErr && !authErr.message.includes('already registered')) {
      console.error('[webhook] Failed to create auth user:', authErr.message)
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[webhook] Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
