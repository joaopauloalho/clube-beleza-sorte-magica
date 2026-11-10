export type PlanSlug = 'essencial' | 'radiante' | 'suprema'

export interface Plan {
  slug: PlanSlug
  /** Nome já gravado nas 3 linhas de public.planos. */
  nome: string
  mensalidade: number
  total12: number
  credito: number
  /** Bônus da clínica sobre o total pago em 12 meses, como fração (0,17 = 17%). */
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
 * Essencial 50/600/700/17%/10%, Radiante 75/900/1125/25%/15%, Suprema 100/1200/1600/33%/20%.
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
    credito: 1125,
    bonusClinica: 0.25,
    precoMembro: 0.15,
    destaque: false,
  },
  {
    slug: 'suprema',
    nome: 'Beleza Suprema',
    mensalidade: 100,
    total12: 1200,
    credito: 1600,
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
