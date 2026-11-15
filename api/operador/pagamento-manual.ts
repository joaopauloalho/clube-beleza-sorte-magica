import type { VercelRequest, VercelResponse } from '@vercel/node'
import { mensagemDoBanco, validarEstorno, validarPagamentoManual } from '../_lib/operador-validacao'
import { clienteServico, exigirOperador } from '../_lib/supabase-admin'

/** Baixa manual (dinheiro, Pix direto) e estorno da baixa. Tudo fica na auditoria. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const operador = await exigirOperador(req.headers.authorization)
    const admin = clienteServico()

    if (req.body?.acao === 'estornar') {
      const entrada = validarEstorno(req.body)
      if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
      const feito = await admin.rpc('reverter_pagamento_manual', {
        p_pagamento_id: entrada.valor.pagamentoId,
        p_motivo: entrada.valor.motivo,
        p_ator: operador.id,
      })
      if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
      return res.status(200).json(feito.data)
    }

    const entrada = validarPagamentoManual(req.body)
    if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
    const p = entrada.valor
    const feito = await admin.rpc('registrar_pagamento_manual', {
      p_membro_id: p.membroId,
      p_competencia: p.competencia,
      p_valor_centavos: p.valorCentavos,
      p_forma: p.forma,
      p_observacao: p.observacao,
      p_ator: operador.id,
    })
    if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
    return res.status(200).json(feito.data)
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    return res.status(status).json({ erro: error instanceof Error ? error.message : 'Falha ao registrar o pagamento.' })
  }
}
