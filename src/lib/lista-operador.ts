export type FiltroDaTela = 'todas' | 'em_dia' | 'atraso' | 'sorteadas' | 'canceladas' | 'leads'

export interface LinhaFiltravel {
  grupo_id: string
  status: string
  em_dia: boolean
  data_contemplacao: string | null
  nome: string
}

export interface LeadFiltravel {
  nome: string
  whatsapp: string | null
}

export function sorteadaDaLinha(status: string, dataContemplacao: string | null): boolean {
  return status === 'sorteado' || Boolean(dataContemplacao)
}

export function rotuloSituacao(status: string, emDia: boolean, sorteada: boolean): string {
  if (status === 'cancelado') return 'Cancelada'
  if (sorteada) return emDia ? 'Sorteada' : 'Sorteada, em atraso'
  if (status === 'aguardando_grupo') return 'Aguardando grupo'
  return emDia ? 'Em dia' : 'Em atraso'
}

/** Mesmo recorte da lista de integrantes do painel. O filtro "leads" não devolve integrante. */
export function filtrarIntegrantes<T extends LinhaFiltravel>(
  linhas: readonly T[],
  grupoId: string,
  filtro: FiltroDaTela,
  busca: string,
): T[] {
  if (filtro === 'leads') return []
  const termo = busca.trim().toLowerCase()
  return linhas.filter((linha) => linha.grupo_id === grupoId).filter((linha) => {
    const sorteada = sorteadaDaLinha(linha.status, linha.data_contemplacao)
    if (filtro === 'em_dia' && !(linha.em_dia && linha.status !== 'cancelado')) return false
    if (filtro === 'atraso' && !(!linha.em_dia && linha.status !== 'cancelado' && linha.status !== 'aguardando_grupo')) return false
    if (filtro === 'sorteadas' && !sorteada) return false
    if (filtro === 'canceladas' && linha.status !== 'cancelado') return false
    return !termo || linha.nome.toLowerCase().includes(termo)
  })
}

/**
 * Planilha de integrantes quando a tela está no filtro de leads: o grupo e a busca continuam,
 * e a situação não restringe, porque esse filtro é da outra lista.
 */
export function filtrarIntegrantesParaPlanilha<T extends LinhaFiltravel>(
  linhas: readonly T[],
  grupoId: string,
  filtro: FiltroDaTela,
  busca: string,
): T[] {
  return filtrarIntegrantes(linhas, grupoId, filtro === 'leads' ? 'todas' : filtro, busca)
}

/** Leads que ainda não viraram cota, pelo WhatsApp, mais a busca por nome. Igual à aba Leads. */
export function filtrarLeadsSemCota<T extends LeadFiltravel>(
  leads: readonly T[],
  whatsappsComCota: ReadonlySet<string>,
  busca: string,
): T[] {
  const termo = busca.trim().toLowerCase()
  return leads
    .filter((lead) => !lead.whatsapp || !whatsappsComCota.has(lead.whatsapp))
    .filter((lead) => !termo || lead.nome.toLowerCase().includes(termo))
}

export function rotuloMesDoCiclo(ultimoMesSorteado: number | null, cobrancaIniciadaEm: string | null): string {
  const ultimo = ultimoMesSorteado ?? 0
  if (!cobrancaIniciadaEm && ultimo === 0) return 'Ciclo ainda não começou'
  if (ultimo >= 12) return 'Ciclo encerrado'
  return `Mês ${ultimo + 1} de 12`
}

export function rotuloStatusGrupo(status: string | null): string {
  if (status === 'aberto') return 'Aberto'
  if (status === 'completo') return 'Completo'
  return status || 'Sem status'
}
