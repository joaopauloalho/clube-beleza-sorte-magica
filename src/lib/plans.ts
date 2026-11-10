export type PlanName = 'Beleza Essencial' | 'Beleza Radiante' | 'Beleza Suprema'
export type PlanSlug = 'essencial' | 'radiante' | 'suprema'

export interface Plan {
  name: PlanName
  slug: PlanSlug
  /** Mensalidade em reais. */
  price: number
  /** Soma das 12 mensalidades, em reais. */
  total12: number
  /** Crédito em serviços se a pessoa for sorteada, em reais. */
  credit: number
  /** Bônus da clínica sobre o total pago. */
  clinicBonus: string
  /** Desconto do preço de membro enquanto aguarda o sorteio. */
  memberDiscount: string
  recommended: boolean
}

/**
 * Fonte única dos valores exibidos no site.
 * A migration `20261110220000_user_roles_and_rls.sql` grava os mesmos números em `planos`.
 */
export const PLANS: Record<PlanName, Plan> = {
  'Beleza Essencial': {
    name: 'Beleza Essencial',
    slug: 'essencial',
    price: 50,
    total12: 600,
    credit: 700,
    clinicBonus: '17%',
    memberDiscount: '10%',
    recommended: false,
  },
  'Beleza Radiante': {
    name: 'Beleza Radiante',
    slug: 'radiante',
    price: 75,
    total12: 900,
    credit: 1125,
    clinicBonus: '25%',
    memberDiscount: '15%',
    recommended: false,
  },
  'Beleza Suprema': {
    name: 'Beleza Suprema',
    slug: 'suprema',
    price: 100,
    total12: 1200,
    credit: 1600,
    clinicBonus: '33%',
    memberDiscount: '20%',
    recommended: true,
  },
}

export const PLAN_LIST: Plan[] = Object.values(PLANS)

export const PLAN_NAMES = PLAN_LIST.map((plan) => plan.name) as [PlanName, ...PlanName[]]

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLAN_LIST.find((plan) => plan.slug === slug)
}

export function getPlanByName(name: string): Plan | undefined {
  return PLANS[name as PlanName]
}
