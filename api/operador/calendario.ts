import type { VercelRequest, VercelResponse } from '@vercel/node'
import { calendarioPadrao, editarMes, refazerRestante } from '../../src/lib/calendarioDoGrupo'
import { lerEstadoDoCalendario } from '../_lib/calendario-servidor'
import { mensagemDoBanco, validarAcaoDoCalendario } from '../_lib/operador-validacao'
import { clienteServico, exigirOperador } from '../_lib/supabase-admin'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const operador = await exigirOperador(req.headers.authorization)
    const entrada = validarAcaoDoCalendario(req.body)
    if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
    const pedido = entrada.valor
    const admin = clienteServico()

    if (pedido.acao === 'conferir') {
      const feito = await admin.rpc('confirmar_conferencia', { p_grupo_id: pedido.grupoId, p_ator: operador.id })
      if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
      return res.status(200).json(feito.data)
    }

    const estado = await lerEstadoDoCalendario(admin, pedido.grupoId)
    let novo: number[]
    let motivo: string | null = null
    let primeiroSorteio: string | null = null

    try {
      if (pedido.acao === 'gerar') {
        if (estado.calendario) return res.status(409).json({ erro: 'Este grupo já tem calendário. Use editar.' })
        novo = calendarioPadrao(estado.tamanho)
        primeiroSorteio = pedido.primeiroSorteio
      } else if (pedido.acao === 'editar') {
        if (!estado.calendario) return res.status(409).json({ erro: 'Gere o calendário do grupo primeiro.' })
        novo = editarMes(estado.calendario, {
          mes: pedido.mes,
          quantidade: pedido.quantidade,
          tamanho: estado.tamanho,
          mesesJaSorteados: estado.mesesJaSorteados,
        })
        motivo = pedido.motivo
      } else {
        if (!estado.calendario) return res.status(409).json({ erro: 'Gere o calendário do grupo primeiro.' })
        novo = refazerRestante(estado.calendario, estado.mesesJaSorteados, estado.pool)
        motivo = pedido.motivo
      }
    } catch (erro) {
      return res.status(422).json({ erro: erro instanceof Error ? erro.message : 'Calendário inválido.' })
    }

    const salvo = await admin.rpc('salvar_calendario_sorteio', {
      p_grupo_id: pedido.grupoId,
      p_calendario: novo,
      p_primeiro_sorteio: primeiroSorteio,
      p_motivo: motivo,
      p_ator: operador.id,
    })
    if (salvo.error) return res.status(409).json({ erro: mensagemDoBanco(salvo.error.message) })
    return res.status(200).json({ ok: true, calendario: novo })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    return res.status(status).json({ erro: error instanceof Error ? error.message : 'Falha no calendário.' })
  }
}
