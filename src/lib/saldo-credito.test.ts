import assert from 'node:assert/strict'
import { test } from 'node:test'
import { divideCredito, saldoDoCredito } from './saldo-credito'

test('saldo desconta só uso ativo e não fica implícito no estorno', () => {
  const saldo = saldoDoCredito(170000, [
    { credito_id: 'a', valor_centavos: 50000, status: 'ativo' },
    { credito_id: 'a', valor_centavos: 20000, status: 'estornado' },
    { credito_id: 'b', valor_centavos: 10000, status: 'ativo' },
  ], 'a')
  assert.equal(saldo, 120000)
})

test('saldo pode acusar negativo se os dados já estiverem errados', () => {
  assert.equal(saldoDoCredito(100, [{ valor_centavos: 150, status: 'ativo' }]), -50)
})

test('só a Suprema divide o crédito', () => {
  assert.equal(divideCredito('suprema', 'Beleza Suprema'), true)
  assert.equal(divideCredito('essencial', 'Beleza Essencial'), false)
  assert.equal(divideCredito('radiante', 'Beleza Radiante'), false)
  assert.equal(divideCredito(null, 'Beleza Suprema'), true)
  assert.equal(divideCredito(null, 'Beleza Essencial'), false)
})
