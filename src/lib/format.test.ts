import assert from 'node:assert/strict'
import { test } from 'node:test'
import { centavosDeTexto, formatarData } from './format'

test('data só com dia não muda de fuso', () => {
  assert.equal(formatarData('2027-03-01'), '01/03/2027')
  assert.equal(formatarData(null), '—')
  assert.equal(formatarData('nao-e-data'), '—')
})

test('valor digitado vira centavos', () => {
  assert.equal(centavosDeTexto('1.700,50'), 170050)
  assert.equal(centavosDeTexto('10,5'), 1050)
  assert.equal(centavosDeTexto('10.50'), 1050)
  assert.equal(centavosDeTexto('1.700'), 170000)
  assert.equal(centavosDeTexto('0'), null)
  assert.equal(centavosDeTexto('abc'), null)
})
