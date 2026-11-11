import assert from 'node:assert/strict'
import { test } from 'node:test'
import { A_DEFINIR } from '../../src/lib/copy'
import { exigirDevMode, ForaDoModoTesteError, lerDevMode } from './abacatepay'
import { corpoAssinaturaPix, corpoProdutoMensal, decidirCobranca, pixAutomaticoLigado } from './cobranca'

test('não cobra grupo incompleto nem com a flag desligada', () => {
  assert.equal(decidirCobranca({ vagas: 23, pixAutomaticoLigado: true }).cobrar, false)
  assert.equal(decidirCobranca({ vagas: 23, pixAutomaticoLigado: true }).motivo, 'grupo_incompleto')
  const desligada = decidirCobranca({ vagas: 24, pixAutomaticoLigado: false })
  assert.equal(desligada.cobrar, false)
  assert.equal(desligada.aviso, A_DEFINIR.pixLiberacao)
  assert.equal(decidirCobranca({ vagas: 24, pixAutomaticoLigado: true }).cobrar, true)
  assert.equal(pixAutomaticoLigado({} as NodeJS.ProcessEnv), false)
  assert.equal(pixAutomaticoLigado({ ABACATEPAY_PIX_AUTOMATICO_ENABLED: 'true' } as NodeJS.ProcessEnv), true)
  assert.equal(pixAutomaticoLigado({ ABACATEPAY_PIX_AUTOMATICO_ENABLED: 'false' } as NodeJS.ProcessEnv), false)
})

test('assinatura PIX tem um produto mensal e não manda cupom nem trial', () => {
  const produto = corpoProdutoMensal({ externalId: 'clube-beleza-essencial-mensal', nome: 'Beleza Essencial mensal', precoCentavos: 5000 })
  assert.equal(produto.cycle, 'MONTHLY')
  assert.equal('trialDays' in produto, false)
  const corpo = corpoAssinaturaPix({
    productId: 'prod_1',
    externalId: 'membro-1',
    customerId: 'cust_1',
    completionUrl: 'https://app.example/area',
    returnUrl: 'https://app.example/adesao',
  })
  assert.deepEqual(corpo.methods, ['PIX'])
  assert.deepEqual(corpo.items, [{ id: 'prod_1', quantity: 1 }])
  assert.equal('coupons' in corpo, false)
  assert.equal('trialDays' in corpo, false)
})

test('resposta fora de devMode é recusada', () => {
  assert.equal(lerDevMode({ data: { devMode: true } }), true)
  assert.equal(lerDevMode({ devMode: false }), false)
  assert.throws(() => exigirDevMode({ data: { id: 'prod_1', devMode: false } }), ForaDoModoTesteError)
})
