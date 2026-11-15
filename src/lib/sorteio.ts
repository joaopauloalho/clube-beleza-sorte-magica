import { DRAWS_PER_MONTH } from './plans'

export interface MembroParaSorteio {
  id: string
  cota: number
  emDia: boolean
  jaSorteado: boolean
  status: string
}

export interface Elegivel {
  membroId: string
  cota: number
}

/**
 * Em dia, ainda não sorteada e com adesão ativa.
 * Quem parou de pagar fica com emDia falso ou status diferente de ativo e sai.
 */
export function filtrarElegiveis(membros: readonly MembroParaSorteio[]): Elegivel[] {
  return membros
    .filter((membro) => membro.emDia && !membro.jaSorteado && membro.status === 'ativo')
    .map((membro) => ({ membroId: membro.id, cota: membro.cota }))
    .sort((a, b) => a.cota - b.cota)
}

/** `quantidade` vem do calendário do grupo. Sem ele vale o padrão antigo de 2 por mês. */
export function quantidadeDoMes(totalElegiveis: number, quantidade: number = DRAWS_PER_MONTH): number {
  if (totalElegiveis <= 0 || quantidade <= 0) return 0
  return Math.min(quantidade, totalElegiveis)
}

/** Chance real daquele sorteio: 2 dividido pelo tamanho da lista guardada, ou 1 se sobrar menos de 2. */
export function chanceReal(totalElegiveis: number, quantidadeDoCalendario: number = DRAWS_PER_MONTH): number {
  const quantidade = quantidadeDoMes(totalElegiveis, quantidadeDoCalendario)
  if (totalElegiveis <= 0 || quantidade <= 0) return 0
  return quantidade / totalElegiveis
}

export function sortear(
  elegiveis: readonly Elegivel[],
  rng: () => number = Math.random,
  quantidadeDoCalendario: number = DRAWS_PER_MONTH,
): Elegivel[] {
  const pool = [...elegiveis]
  const quantidade = quantidadeDoMes(pool.length, quantidadeDoCalendario)
  const sorteados: Elegivel[] = []
  for (let i = 0; i < quantidade; i += 1) {
    const indice = Math.floor(rng() * pool.length)
    const [escolhido] = pool.splice(indice, 1)
    if (escolhido) sorteados.push(escolhido)
  }
  return sorteados
}

export function proximoMes(ultimoMesSorteado: number): number {
  return ultimoMesSorteado + 1
}
