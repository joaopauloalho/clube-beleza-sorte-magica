export const GROUP_SIZE = 24
export const WINNERS_PER_MONTH = 2
export const CYCLE_MONTHS = 12

export interface DrawMonth {
  month: number
  winners: number
  eligible: number
  /** Chance do mês, arredondada para inteiro (mês 1 = 8%, mês 6 = 14%). */
  monthlyPercent: number
  /** Chance acumulada m/12, em percentual. */
  cumulativePercent: number
}

export function eligibleAtMonth(month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > CYCLE_MONTHS) {
    throw new Error('Mês inválido')
  }
  return GROUP_SIZE - WINNERS_PER_MONTH * (month - 1)
}

export function drawMonth(month: number): DrawMonth {
  const eligible = eligibleAtMonth(month)
  const winners = Math.min(WINNERS_PER_MONTH, eligible)
  return {
    month,
    winners,
    eligible,
    monthlyPercent: Math.round((winners / eligible) * 100),
    cumulativePercent: (month / CYCLE_MONTHS) * 100,
  }
}

export const DRAW_MONTHS: DrawMonth[] = Array.from({ length: CYCLE_MONTHS }, (_, index) => drawMonth(index + 1))

export function formatPercent(value: number, digits = 0): string {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}%`
}
