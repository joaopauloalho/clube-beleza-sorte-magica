export type PlanName = 'Beleza Essencial' | 'Beleza Radiante' | 'Beleza Suprema'
export type PlanSlug = 'essencial' | 'radiante' | 'suprema'

export interface Plan {
  name: PlanName
  slug: PlanSlug
  productId: string
  price: number
  priceLabel: string
  gift: string
  giftValue: string
  raffle: string
  discount: string
  recommended: boolean
}

export const PLANS: Record<PlanName, Plan> = {
  'Beleza Essencial': {
    name: 'Beleza Essencial',
    slug: 'essencial',
    productId: 'prod_HkEdRX1zgXN3R6rHGw5MJqs3',
    price: 49.90,
    priceLabel: '49,90',
    gift: 'Limpeza de Pele',
    giftValue: '197',
    raffle: '700',
    discount: '10%',
    recommended: false,
  },
  'Beleza Radiante': {
    name: 'Beleza Radiante',
    slug: 'radiante',
    productId: 'prod_NCnDjfcbKwyFs5edEtmfUcYC',
    price: 74.90,
    priceLabel: '74,90',
    gift: 'Peeling',
    giftValue: '217',
    raffle: '1.000',
    discount: '15%',
    recommended: false,
  },
  'Beleza Suprema': {
    name: 'Beleza Suprema',
    slug: 'suprema',
    productId: 'prod_Nj1RaWGePckwBBeJJFH5UMyz',
    price: 99.90,
    priceLabel: '99,90',
    gift: 'Microagulhamento',
    giftValue: '327',
    raffle: '1.500',
    discount: '20%',
    recommended: true,
  },
}

export const PLAN_LIST: Plan[] = Object.values(PLANS)

export function getPlanBySlug(slug: string): Plan | undefined {
  return PLAN_LIST.find((p) => p.slug === slug)
}

export function getPlanByName(name: string): Plan | undefined {
  return PLANS[name as PlanName]
}
