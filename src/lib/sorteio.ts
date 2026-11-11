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

export function quantidadeDoMes(totalElegiveis: number): number {
  if (totalElegiveis <= 0) return 0
  return Math.min(DRAWS_PER_MONTH, totalElegiveis)
}

/** Chance real daquele sorteio: 2 dividido pelo tamanho da lista guardada, ou 1 se sobrar menos de 2. */
export function chanceReal(totalElegiveis: number): number {
  const quantidade = quantidadeDoMes(totalElegiveis)
  if (totalElegiveis <= 0 || quantidade <= 0) return 0
  return quantidade / totalElegiveis
}

export function sortear(
  elegiveis: readonly Elegivel[],
  rng: () => number = Math.random,
): Elegivel[] {
  const pool = [...elegiveis]
  const quantidade = quantidadeDoMes(pool.length)
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
