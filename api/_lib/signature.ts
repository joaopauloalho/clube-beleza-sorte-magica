import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Chave pública de HMAC publicada pela AbacatePay.
 * Não é segredo: a origem do webhook é o webhookSecret, comparado à parte.
 * https://docs.abacatepay.com/pages/webhooks/security
 */
export const ABACATEPAY_PUBLIC_KEY =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

export function assinarCorpo(rawBody: Buffer | string, key = ABACATEPAY_PUBLIC_KEY): string {
  return createHmac('sha256', key).update(rawBody).digest('base64')
}

export function compararSegredo(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido)
  const b = Buffer.from(esperado)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function assinaturaConfere(rawBody: Buffer | string, assinaturaRecebida: string): boolean {
  if (!assinaturaRecebida) return false
  return compararSegredo(assinarCorpo(rawBody), assinaturaRecebida)
}
