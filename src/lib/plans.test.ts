import { describe, it, expect } from 'bun:test'
import { PLANS, getPlanBySlug, getPlanByName } from './plans'

describe('PLANS', () => {
  it('has three plans', () => {
    expect(Object.keys(PLANS)).toHaveLength(3)
  })

  it('Beleza Essencial has correct productId and price', () => {
    expect(PLANS['Beleza Essencial'].productId).toBe('prod_HkEdRX1zgXN3R6rHGw5MJqs3')
    expect(PLANS['Beleza Essencial'].price).toBe(49.90)
    expect(PLANS['Beleza Essencial'].slug).toBe('essencial')
  })

  it('Beleza Radiante has correct productId and price', () => {
    expect(PLANS['Beleza Radiante'].productId).toBe('prod_NCnDjfcbKwyFs5edEtmfUcYC')
    expect(PLANS['Beleza Radiante'].price).toBe(74.90)
  })

  it('Beleza Suprema has correct productId and price', () => {
    expect(PLANS['Beleza Suprema'].productId).toBe('prod_Nj1RaWGePckwBBeJJFH5UMyz')
    expect(PLANS['Beleza Suprema'].price).toBe(99.90)
  })
})

describe('getPlanBySlug', () => {
  it('returns correct plan for valid slug', () => {
    const plan = getPlanBySlug('suprema')
    expect(plan?.name).toBe('Beleza Suprema')
  })

  it('returns undefined for unknown slug', () => {
    expect(getPlanBySlug('desconhecido')).toBeUndefined()
  })
})

describe('getPlanByName', () => {
  it('returns plan for full name', () => {
    expect(getPlanByName('Beleza Radiante')?.slug).toBe('radiante')
  })
})
