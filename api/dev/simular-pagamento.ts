import type { VercelRequest, VercelResponse } from '@vercel/node'
import { criarClienteAbacate, ForaDoModoTesteError } from '../_lib/abacatepay'
import { exigirOperador } from '../_lib/supabase-admin'

/**
 * Simula o pagamento de um QR de checkout transparente em devMode.
 * Não cria nem autoriza Pix Automático. A doc restringe este endpoint ao modo de teste.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    await exigirOperador(req.headers.authorization)
    const id = String(req.body?.id ?? '')
    if (!id) return res.status(400).json({ erro: 'Informe o id do checkout transparente.' })
    const resultado = await criarClienteAbacate().simularPagamentoTransparente(id)
    return res.status(200).json({ ok: true, devMode: true, resultado })
  } catch (error) {
    const status = error instanceof ForaDoModoTesteError ? 409 : (error as { status?: number }).status ?? 500
    const mensagem = error instanceof Error ? error.message : 'Falha na simulação.'
    return res.status(status).json({ erro: mensagem })
  }
}
