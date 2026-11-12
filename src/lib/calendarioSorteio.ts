import { GROUP_SIZE } from './plans'

/**
 * Quantas pessoas são sorteadas em cada mês do ciclo de 12 meses.
 * Segue REGRA_SORTEIO em copy.ts: 2 por mês e 3 nos meses 4 e 8, todas sorteadas até o mês 11.
 */
export const SORTEADAS_POR_MES = [2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 0] as const

export const MESES_DO_CICLO = SORTEADAS_POR_MES.length

export interface EstadoDoMes {
  mes: number
  /** Já sorteadas em meses anteriores. */
  antes: number
  /** Sorteadas neste mês. */
  noMes: number
  /** Concorrem neste mês: quem está em dia e ainda não foi sorteada, se ninguém saiu do grupo. */
  concorrem: number
  /** Chance de quem concorre ser sorteada neste mês, de 0 a 1. */
  chance: number
}

export function estadoDoMes(mes: number): EstadoDoMes {
  if (!Number.isInteger(mes) || mes < 1 || mes > MESES_DO_CICLO) {
    throw new Error(`Mês do ciclo inválido: ${mes}`)
  }
  const antes = SORTEADAS_POR_MES.slice(0, mes - 1).reduce((soma, n) => soma + n, 0)
  const noMes = SORTEADAS_POR_MES[mes - 1]
  const concorrem = GROUP_SIZE - antes
  const chance = noMes === 0 || concorrem <= 0 ? 0 : noMes / concorrem
  return { mes, antes, noMes, concorrem, chance }
}
