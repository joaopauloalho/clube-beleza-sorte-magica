import crypto from 'node:crypto'

export function secretsMatch(provided: string, expected: string): boolean {
  if (!provided || !expected) return false
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

/** HMAC-SHA256 do corpo cru, em base64, como a AbacatePay envia em X-Webhook-Signature. */
export function verifyAbacateSignature(rawBody: string, signature: string, publicKey: string): boolean {
  if (!rawBody || !signature || !publicKey) return false
  const expected = crypto.createHmac('sha256', publicKey).update(Buffer.from(rawBody, 'utf8')).digest('base64')
  return secretsMatch(signature, expected)
}

export type ChargeFailure = 'saldo_insuficiente' | 'autorizacao_revogada' | 'falha_cobranca'
export type CancellationKind = 'inadimplencia' | 'autorizacao_revogada' | 'cancelada'

export function classifyChargeFailure(input: {
  rejectCode?: string | null
  reason?: string | null
}): ChargeFailure {
  const text = `${input.rejectCode ?? ''} ${input.reason ?? ''}`.toLowerCase()
  if (!text.trim()) return 'falha_cobranca'
  if (/(am04|insufficient|saldo insuficiente|sem saldo|fundos insuficientes)/.test(text)) {
    return 'saldo_insuficiente'
  }
  if (/(md01|revog|sem mandato|no mandate|autoriza[cç][aã]o (cancelada|revogada)|mandate)/.test(text)) {
    return 'autorizacao_revogada'
  }
  return 'falha_cobranca'
}

/**
 * A AbacatePay não publica um evento só para "cliente revogou no app do banco".
 * Isso chega como subscription.cancelled. Em Pix, sem estouro de retentativa,
 * tratamos como revogação da autorização.
 */
export function classifyCancellation(input: {
  cancelledDueTo?: string | null
  method?: string | null
}): CancellationKind {
  const why = (input.cancelledDueTo ?? '').toLowerCase()
  if (why.includes('max_payment_retries')) return 'inadimplencia'
  if (/(revog|mandate|customer|bank|banco)/.test(why)) return 'autorizacao_revogada'
  if ((input.method ?? '').toUpperCase() === 'PIX' && !why) return 'autorizacao_revogada'
  return 'cancelada'
}
