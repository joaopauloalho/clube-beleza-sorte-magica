import type { VercelRequest, VercelResponse } from '@vercel/node'
import { procedimentoPorId } from '../../src/lib/procedimentos'
import {
  mensagemDoBanco,
  validarEstornoDeUso,
  validarLiberarCredito,
  validarUsoCredito,
} from '../_lib/operador-validacao'
import { clienteServico, exigirOperador } from '../_lib/supabase-admin'

/** Liberar crédito da sorteada, registrar uso e estornar. Só operador, tudo na auditoria. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const operador = await exigirOperador(req.headers.authorization)
    const admin = clienteServico()
    const acao = req.body?.acao

    if (acao === 'liberar') {
      const entrada = validarLiberarCredito(req.body)
      if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
      const feito = await admin.rpc('liberar_credito', { p_credito_id: entrada.valor.creditoId, p_ator: operador.id })
      if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
      return res.status(200).json(feito.data)
    }

    if (acao === 'usar') {
      const entrada = validarUsoCredito(req.body)
      if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
      const procedimento = procedimentoPorId(entrada.valor.procedimentoId)
      const feito = await admin.rpc('registrar_uso_credito', {
        p_credito_id: entrada.valor.creditoId,
        p_procedimento_id: procedimento.id,
        p_procedimento_nome: procedimento.nome,
        p_valor_centavos: entrada.valor.valorCentavos,
        p_data: entrada.valor.data,
        p_observacao: entrada.valor.observacao,
        p_usado_por: entrada.valor.usadoPor,
        p_ator: operador.id,
      })
      if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
      return res.status(200).json(feito.data)
    }

    if (acao === 'estornar') {
      const entrada = validarEstornoDeUso(req.body)
      if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
      const feito = await admin.rpc('estornar_uso_credito', {
        p_uso_id: entrada.valor.usoId,
        p_motivo: entrada.valor.motivo,
        p_ator: operador.id,
      })
      if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
      return res.status(200).json(feito.data)
    }

    return res.status(400).json({ erro: 'Ação desconhecida.' })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    return res.status(status).json({ erro: error instanceof Error ? error.message : 'Falha ao registrar o crédito.' })
  }
}
