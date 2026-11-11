import { CYCLE_MONTHS, DRAWS_PER_MONTH, GROUP_SIZE } from './plans'

export function assertMonth(month: number): void {
  if (!Number.isInteger(month) || month < 1 || month > CYCLE_MONTHS) {
    throw new Error(`Mês do ciclo inválido: ${month}`)
  }
}

/** Quantas pessoas ainda podem ser sorteadas no mês m, se ninguém saiu. */
export function elegiveisTeoricos(month: number): number {
  assertMonth(month)
  return GROUP_SIZE - DRAWS_PER_MONTH * (month - 1)
}

/** Chance de ser sorteada naquele mês: 2 / (24 - 2*(m-1)). */
export function chanceMensal(month: number): number {
  return DRAWS_PER_MONTH / elegiveisTeoricos(month)
}

/** Chance acumulada de já ter recebido o crédito: m/12. */
export function chanceAcumulada(month: number): number {
  assertMonth(month)
  return month / CYCLE_MONTHS
}

export function percentInteiro(fraction: number): number {
  return Math.round(fraction * 100)
}

export function formatarPercentual(fraction: number): string {
  return `${percentInteiro(fraction)}%`
}

export interface PontoDeChance {
  mes: number
  mensal: number
  acumulada: number
}

export function serieDeChance(): PontoDeChance[] {
  return Array.from({ length: CYCLE_MONTHS }, (_, index) => {
    const mes = index + 1
    return {
      mes,
      mensal: percentInteiro(chanceMensal(mes)),
      acumulada: percentInteiro(chanceAcumulada(mes)),
    }
  })
}
