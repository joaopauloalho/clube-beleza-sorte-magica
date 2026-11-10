import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatBRL, getPlanByName, getPlanBySlug, PLANS } from './plans.ts'
import { DRAW_MONTHS, drawMonth } from './sorteio.ts'

describe('PLANS', () => {
  it('tem três planos com os valores do spec', () => {
    assert.equal(Object.keys(PLANS).length, 3)
    assert.deepEqual(
      [PLANS['Beleza Essencial'].price, PLANS['Beleza Essencial'].total12, PLANS['Beleza Essencial'].credit],
      [50, 600, 700],
    )
    assert.equal(PLANS['Beleza Essencial'].clinicBonus, '17%')
    assert.equal(PLANS['Beleza Essencial'].memberDiscount, '10%')
    assert.deepEqual(
      [PLANS['Beleza Radiante'].price, PLANS['Beleza Radiante'].total12, PLANS['Beleza Radiante'].credit],
      [75, 900, 1125],
    )
    assert.equal(PLANS['Beleza Radiante'].clinicBonus, '25%')
    assert.equal(PLANS['Beleza Radiante'].memberDiscount, '15%')
    assert.deepEqual(
      [PLANS['Beleza Suprema'].price, PLANS['Beleza Suprema'].total12, PLANS['Beleza Suprema'].credit],
      [100, 1200, 1600],
    )
    assert.equal(PLANS['Beleza Suprema'].clinicBonus, '33%')
    assert.equal(PLANS['Beleza Suprema'].memberDiscount, '20%')
  })

  it('formata reais em pt-BR', () => {
    assert.equal(formatBRL(50), '50')
    assert.equal(formatBRL(1125), '1.125')
    assert.equal(formatBRL(1600), '1.600')
  })
})

describe('busca de plano', () => {
  it('encontra por slug e por nome', () => {
    assert.equal(getPlanBySlug('suprema')?.name, 'Beleza Suprema')
    assert.equal(getPlanBySlug('desconhecido'), undefined)
    assert.equal(getPlanByName('Beleza Radiante')?.slug, 'radiante')
  })
})

describe('chance do sorteio', () => {
  it('mês 1, 6, 11 e 12 batem com o spec', () => {
    assert.deepEqual(
      [drawMonth(1).eligible, drawMonth(1).winners, drawMonth(1).monthlyPercent],
      [24, 2, 8],
    )
    assert.deepEqual(
      [drawMonth(6).eligible, drawMonth(6).monthlyPercent],
      [14, 14],
    )
    assert.equal(drawMonth(11).monthlyPercent, 50)
    assert.equal(drawMonth(12).monthlyPercent, 100)
    assert.equal(drawMonth(6).cumulativePercent, 50)
    assert.equal(drawMonth(12).cumulativePercent, 100)
  })

  it('são 2 sorteados entre 24 - 2*(m-1) elegíveis', () => {
    for (const month of DRAW_MONTHS) {
      assert.equal(month.eligible, 24 - 2 * (month.month - 1))
      assert.equal(month.winners, 2)
    }
  })
})
