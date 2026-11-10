import type { VercelRequest, VercelResponse } from '@vercel/node'
import { filtrarElegiveis, sortear } from '../../src/lib/sorteio'
import { clienteServico, exigirOperador } from '../_lib/supabase-admin'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    await exigirOperador(req.headers.authorization)
    const grupoId = String(req.body?.grupoId ?? '')
    const data = String(req.body?.data ?? '')
    if (!/^[0-9a-f-]{36}$/i.test(grupoId)) return res.status(400).json({ erro: 'Grupo inválido.' })
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return res.status(400).json({ erro: 'Data inválida. Use AAAA-MM-DD.' })

    const admin = clienteServico()
    const membrosBusca = await admin
      .from('membros')
      .select('id, cota, em_dia, status, data_contemplacao')
      .eq('grupo_id', grupoId)
    if (membrosBusca.error) return res.status(500).json({ erro: 'Não foi possível ler os membros.' })

    const elegiveis = filtrarElegiveis(
      (membrosBusca.data ?? []).map((membro) => ({
        id: membro.id,
        cota: membro.cota ?? 0,
        emDia: Boolean(membro.em_dia),
        jaSorteado: Boolean(membro.data_contemplacao) || membro.status === 'sorteado',
        status: membro.status ?? '',
      })),
    )
    const escolhidos = sortear(elegiveis)
    if (escolhidos.length === 0) {
      return res.status(409).json({ erro: 'Nenhuma integrante em dia e ainda não sorteada neste grupo.' })
    }

    const aplicado = await admin.rpc('aplicar_sorteio', {
      p_grupo_id: grupoId,
      p_data: data,
      p_sorteados: escolhidos.map((item) => item.membroId),
    })
    if (aplicado.error) {
      return res.status(409).json({ erro: aplicado.error.message })
    }

    return res.status(200).json({
      ok: true,
      elegiveis,
      sorteados: escolhidos,
      resultado: aplicado.data,
    })
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    const mensagem = error instanceof Error ? error.message : 'Falha no sorteio.'
    return res.status(status).json({ erro: mensagem })
  }
}
