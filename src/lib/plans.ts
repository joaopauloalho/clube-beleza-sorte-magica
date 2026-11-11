import { formatarReais } from './format'

export type PlanSlug = 'essencial' | 'radiante' | 'suprema'

export interface Plan {
  slug: PlanSlug
  /** Nome já gravado nas 3 linhas de public.planos. */
  nome: string
  mensalidade: number
  total12: number
  credito: number
  /** Fração da coluna bonus_clinica_pct. O bônus em reais da tela é credito − total12. */
  bonusClinica: number
  /** Desconto do preço de membro enquanto a pessoa não foi sorteada. */
  precoMembro: number
  destaque: boolean
}

export const GROUP_SIZE = 24
export const DRAWS_PER_MONTH = 2
export const CYCLE_MONTHS = 12

/**
 * Fonte única dos três planos.
 * Essencial 50/600/700/17%/10%, Radiante 75/900/1350/25%/15%, Suprema 100/1200/1700/33%/20%.
 * O crédito 1350 da Radiante está em `20261111050000_credito_radiante_1350.sql`.
 * A fração `bonusClinica` continua a coluna já gravada. O bônus em reais é `credito - total12`.
 */
export const PLANS: readonly Plan[] = [
  {
    slug: 'essencial',
    nome: 'Beleza Essencial',
    mensalidade: 50,
    total12: 600,
    credito: 700,
    bonusClinica: 0.17,
    precoMembro: 0.1,
    destaque: false,
  },
  {
    slug: 'radiante',
    nome: 'Beleza Radiante',
    mensalidade: 75,
    total12: 900,
    credito: 1350,
    bonusClinica: 0.25,
    precoMembro: 0.15,
    destaque: false,
  },
  {
    slug: 'suprema',
    nome: 'Beleza Suprema',
    mensalidade: 100,
    total12: 1200,
    credito: 1700,
    bonusClinica: 0.33,
    precoMembro: 0.2,
    destaque: true,
  },
] as const

export function getPlanBySlug(slug: string | null | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.slug === slug)
}

export function getPlanByNome(nome: string | null | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.nome === nome)
}

export function precoEmCentavos(reais: number): number {
  return Math.round(reais * 100)
}

/** Crédito do plano menos o que a pessoa paga nas 12 mensalidades. */
export function bonusEmServicos(credito: number, total12: number): number {
  return credito - total12
}

const DIAS_NO_MES = 30

/**
 * Mensalidade dividida por 30.
 * Valor exato no centavo sai como preço. Se o valor real fica a até cinco centavos
 * do décimo seguinte, a frase diz "menos de" esse décimo. Nos outros casos, arredonda ao centavo.
 */
export function frasePorDia(mensalidade: number): string {
  const dia = mensalidade / DIAS_NO_MES
  const centavos = Math.round((dia + Number.EPSILON) * 100) / 100
  const exatoNoCentavo = Math.abs(dia * 100 - Math.round(dia * 100)) < 1e-6
  if (exatoNoCentavo) return `${formatarReais(centavos)} por dia`
  const proximoDecimo = Math.ceil((dia - 1e-9) * 10) / 10
  if (proximoDecimo - dia > 0 && proximoDecimo - dia <= 0.05) {
    return `menos de ${formatarReais(proximoDecimo)} por dia`
  }
  return `${formatarReais(centavos)} por dia`
}
