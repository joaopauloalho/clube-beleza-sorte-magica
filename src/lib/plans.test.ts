import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PLANS, getPlanBySlug, precoEmCentavos } from './plans'

test('há três planos e os valores canônicos', () => {
  assert.equal(PLANS.length, 3)
  assert.deepEqual(PLANS.map((plano) => [plano.slug, plano.mensalidade, plano.total12, plano.credito, plano.bonusClinica, plano.precoMembro]), [
    ['essencial', 50, 600, 700, 0.17, 0.1],
    ['radiante', 75, 900, 1125, 0.25, 0.15],
    ['suprema', 100, 1200, 1600, 0.33, 0.2],
  ])
})

test('o total de 12 meses é a mensalidade vezes 12', () => {
  for (const plano of PLANS) assert.equal(plano.total12, plano.mensalidade * 12)
})

test('busca por slug e centavos', () => {
  assert.equal(getPlanBySlug('radiante')?.nome, 'Beleza Radiante')
  assert.equal(getPlanBySlug('inexistente'), undefined)
  assert.equal(precoEmCentavos(75), 7500)
  assert.equal(precoEmCentavos(1125), 112500)
})
