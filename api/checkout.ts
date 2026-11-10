import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * O checkout avulso da AbacatePay cobrava na hora, aceitava cartão e não esperava
 * o grupo fechar em 24 pessoas. Isso não cabe no Pix Automático.
 * A entrada agora é POST /api/lista-espera. Esta rota não chama a AbacatePay.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  return res.status(410).json({
    error:
      'O pagamento avulso foi desativado. Ninguém é cobrado antes de o grupo completar 24 pessoas, e a cobrança será só por Pix Automático. Entre na lista de espera.',
  })
}
