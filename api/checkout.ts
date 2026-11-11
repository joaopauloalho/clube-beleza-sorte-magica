import type { VercelRequest, VercelResponse } from '@vercel/node'

/** O checkout avulso aceitava cartão e cobrava antes do grupo fechar. Fica desligado. */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(410).json({
    erro: 'Checkout avulso desligado. A entrada é a página de adesão. Ninguém é cobrado antes de o grupo completar 24 pessoas.',
  })
}
