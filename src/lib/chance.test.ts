import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chanceAcumulada, chanceMensal, elegiveisTeoricos, formatarPercentual, serieDeChance } from './chance'

test('chance mensal nos marcos do regulamento', () => {
  assert.equal(elegiveisTeoricos(1), 24)
  assert.equal(elegiveisTeoricos(6), 14)
  assert.equal(elegiveisTeoricos(11), 4)
  assert.equal(elegiveisTeoricos(12), 2)
  assert.equal(formatarPercentual(chanceMensal(1)), '8%')
  assert.equal(formatarPercentual(chanceMensal(6)), '14%')
  assert.equal(formatarPercentual(chanceMensal(11)), '50%')
  assert.equal(formatarPercentual(chanceMensal(12)), '100%')
})

test('chance acumulada é m/12', () => {
  assert.equal(formatarPercentual(chanceAcumulada(1)), '8%')
  assert.equal(formatarPercentual(chanceAcumulada(6)), '50%')
  assert.equal(formatarPercentual(chanceAcumulada(12)), '100%')
  assert.equal(serieDeChance().length, 12)
})
