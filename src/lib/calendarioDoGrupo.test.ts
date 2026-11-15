import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SORTEADAS_POR_MES } from './calendarioSorteio'
import {
  calendarioPadrao,
  chanceDoMes,
  editarMes,
  previsaoDoGrupo,
  somar,
  validarCalendario,
} from './calendarioDoGrupo'

test('para 24 pessoas o calendário padrão é o que o site já publica', () => {
  assert.deepEqual(calendarioPadrao(24), [...SORTEADAS_POR_MES])
})

test('para 50 pessoas todas são sorteadas até o mês 11 e o mês 12 fica sem sorteio', () => {
  const cal = calendarioPadrao(50)
  assert.deepEqual(cal, [5, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 0])
  assert.equal(somar(cal), 50)
})

test('o padrão fecha a conta para qualquer tamanho de 12 a 120', () => {
  for (let n = 12; n <= 120; n += 1) {
    const cal = calendarioPadrao(n)
    assert.equal(cal.length, 12)
    assert.equal(cal[11], 0)
    assert.equal(somar(cal), n, `n=${n}`)
    assert.ok(Math.max(...cal) - Math.min(...cal.slice(0, 11)) <= 1, `n=${n} deve ser equilibrado`)
  }
})

test('tamanho abaixo do mínimo ou fracionário é recusado', () => {
  assert.throws(() => calendarioPadrao(11))
  assert.throws(() => calendarioPadrao(24.5))
})

test('editar o mês 6 de 4 para 6 refaz só os meses seguintes e continua fechando em 50', () => {
  const base = calendarioPadrao(50)
  const novo = editarMes(base, { mes: 6, quantidade: 6, tamanho: 50, mesesJaSorteados: 2 })
  assert.equal(novo[5], 6)
  assert.deepEqual(novo.slice(0, 5), base.slice(0, 5))
  assert.equal(somar(novo), 50)
  assert.equal(novo[11], 0)
})

test('não deixa editar mês que já foi sorteado', () => {
  const base = calendarioPadrao(50)
  assert.throws(() => editarMes(base, { mes: 2, quantidade: 3, tamanho: 50, mesesJaSorteados: 2 }), /já foi sorteado/)
})

test('não deixa sortear mais gente do que ainda concorre', () => {
  const base = calendarioPadrao(24)
  assert.throws(() => editarMes(base, { mes: 3, quantidade: 21, tamanho: 24, mesesJaSorteados: 2 }), /concorrem/)
})

test('baixar o mês 10 empurra a sobra para o mês 11', () => {
  const base = calendarioPadrao(24)
  const novo = editarMes(base, { mes: 10, quantidade: 1, tamanho: 24, mesesJaSorteados: 9 })
  assert.equal(novo[9], 1)
  assert.equal(novo[10], 3)
  assert.equal(somar(novo), 24)
})

test('o mês 11 só aceita sortear todo mundo que sobrou', () => {
  const base = calendarioPadrao(24)
  assert.throws(() => editarMes(base, { mes: 11, quantidade: 1, tamanho: 24, mesesJaSorteados: 10 }), /mês 11/)
  const ok = editarMes(base, { mes: 11, quantidade: 2, tamanho: 24, mesesJaSorteados: 10 })
  assert.equal(somar(ok), 24)
})

test('o mês 12 não tem sorteio para editar', () => {
  assert.throws(() => editarMes(calendarioPadrao(24), { mes: 12, quantidade: 1, tamanho: 24, mesesJaSorteados: 0 }), /mês 12/)
})

test('validarCalendario aponta soma errada e mês 12 com sorteio', () => {
  assert.equal(validarCalendario(calendarioPadrao(24), 24).ok, true)
  assert.equal(validarCalendario([2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 1, 0], 24).ok, false)
  assert.equal(validarCalendario([2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 1], 24).ok, false)
})

test('chance do mês é sorteadas dividido por quem está em dia e ainda concorre', () => {
  assert.equal(chanceDoMes(4, 37), 4 / 37)
  assert.equal(chanceDoMes(4, 0), 0)
  assert.equal(chanceDoMes(5, 3), 1)
})

test('previsão mês a mês usa o calendário e a lista de quem já saiu do grupo', () => {
  const prev = previsaoDoGrupo(calendarioPadrao(50), 50)
  assert.equal(prev[0].concorrem, 50)
  assert.equal(prev[1].concorrem, 45)
  assert.equal(prev[10].chance, 1)
  assert.equal(prev[11].sorteadas, 0)
})
