import assert from 'node:assert/strict'
import { test } from 'node:test'
import { estadoDoMes, MESES_DO_CICLO, SORTEADAS_POR_MES } from './calendarioSorteio'
import { GROUP_SIZE } from './plans'

test('as 24 pessoas do grupo são sorteadas uma vez até o mês 11', () => {
  const total = SORTEADAS_POR_MES.reduce((soma, n) => soma + n, 0)
  assert.equal(total, GROUP_SIZE)
  assert.equal(SORTEADAS_POR_MES[MESES_DO_CICLO - 1], 0)
})

test('são 3 sorteadas nos meses 4 e 8 e 2 nos demais meses com sorteio', () => {
  assert.equal(SORTEADAS_POR_MES[3], 3)
  assert.equal(SORTEADAS_POR_MES[7], 3)
  assert.equal(SORTEADAS_POR_MES[0], 2)
  assert.equal(SORTEADAS_POR_MES[10], 2)
})

test('a chance do mês é sorteadas dividido por quem ainda concorre', () => {
  const m1 = estadoDoMes(1)
  assert.deepEqual({ antes: m1.antes, noMes: m1.noMes, concorrem: m1.concorrem }, { antes: 0, noMes: 2, concorrem: 24 })
  assert.equal(m1.chance, 2 / 24)
  const m4 = estadoDoMes(4)
  assert.deepEqual({ antes: m4.antes, noMes: m4.noMes, concorrem: m4.concorrem }, { antes: 6, noMes: 3, concorrem: 18 })
  assert.equal(m4.chance, 3 / 18)
  const m11 = estadoDoMes(11)
  assert.equal(m11.concorrem, 2)
  assert.equal(m11.chance, 1)
})

test('no mês 12 todas já foram sorteadas e não há sorteio', () => {
  const m12 = estadoDoMes(12)
  assert.equal(m12.noMes, 0)
  assert.equal(m12.concorrem, 0)
  assert.equal(m12.chance, 0)
})

test('mês fora do ciclo é recusado', () => {
  assert.throws(() => estadoDoMes(0))
  assert.throws(() => estadoDoMes(13))
  assert.throws(() => estadoDoMes(2.5))
})
