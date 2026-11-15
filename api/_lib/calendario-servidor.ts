import type { SupabaseClient } from '@supabase/supabase-js'

export interface EstadoDoCalendario {
  /** Quantidade por mês, 12 posições, ou null se o grupo ainda não tem calendário. */
  calendario: number[] | null
  mesesJaSorteados: number
  jaSorteadas: number
  /** Quem ainda concorre: ativa ou inadimplente e não sorteada. */
  pool: number
  /** Total de pessoas que o calendário precisa cobrir. */
  tamanho: number
}

export async function lerEstadoDoCalendario(admin: SupabaseClient, grupoId: string): Promise<EstadoDoCalendario> {
  const [linhas, sorteios, membros] = await Promise.all([
    admin.from('calendario_sorteio').select('mes, quantidade').eq('grupo_id', grupoId).order('mes'),
    admin.from('sorteios').select('mes, sorteados').eq('grupo_id', grupoId),
    admin.from('membros').select('id, status, data_contemplacao').eq('grupo_id', grupoId),
  ])
  if (linhas.error || sorteios.error || membros.error) {
    throw Object.assign(new Error('Não foi possível ler o grupo.'), { status: 500 })
  }
  const calendario = (linhas.data ?? []).length === 12 ? (linhas.data ?? []).map((l) => Number(l.quantidade)) : null
  const jaSorteadas = (sorteios.data ?? []).reduce((soma, s) => soma + (Array.isArray(s.sorteados) ? s.sorteados.length : 0), 0)
  const pool = (membros.data ?? []).filter(
    (m) => !m.data_contemplacao && (m.status === 'ativo' || m.status === 'inadimplente'),
  ).length
  return {
    calendario,
    mesesJaSorteados: (sorteios.data ?? []).length,
    jaSorteadas,
    pool,
    tamanho: jaSorteadas + pool,
  }
}
