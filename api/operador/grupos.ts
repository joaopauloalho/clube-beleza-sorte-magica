import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  mensagemDoBanco,
  validarCriarGrupo,
  validarExcluirGrupo,
  validarRenomearGrupo,
} from '../_lib/operador-validacao'
import { clienteServico, exigirOperador } from '../_lib/supabase-admin'

/** Criar, renomear e apagar grupo vazio. A adesão continua em reservar_cota. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const operador = await exigirOperador(req.headers.authorization)
    const admin = clienteServico()
    const acao = req.body?.acao

    if (acao === 'criar') {
      const entrada = validarCriarGrupo(req.body)
      if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
      const feito = await admin.rpc('criar_grupo', {
        p_nome: entrada.valor.nome,
        p_plano_id: entrada.valor.planoId,
        p_ator: operador.id,
      })
      if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
      return res.status(200).json(feito.data)
    }

    if (acao === 'renomear') {
      const entrada = validarRenomearGrupo(req.body)
      if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
      const feito = await admin.rpc('renomear_grupo', {
        p_grupo_id: entrada.valor.grupoId,
        p_nome: entrada.valor.nome,
        p_ator: operador.id,
      })
      if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
      return res.status(200).json(feito.data)
    }

    if (acao === 'excluir') {
      const entrada = validarExcluirGrupo(req.body)
      if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })
      const feito = await admin.rpc('excluir_grupo_vazio', {
        p_grupo_id: entrada.valor.grupoId,
        p_motivo: entrada.valor.motivo,
        p_ator: operador.id,
      })
      if (feito.error) return res.status(409).json({ erro: mensagemDoBanco(feito.error.message) })
      return res.status(200).json(feito.data)
    }

    return res.status(400).json({ erro: 'Ação desconhecida.' })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    return res.status(status).json({ erro: error instanceof Error ? error.message : 'Falha ao salvar o grupo.' })
  }
}
