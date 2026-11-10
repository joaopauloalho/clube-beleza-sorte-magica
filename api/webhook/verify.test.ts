import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { describe, it } from 'node:test'
import { classifyCancellation, classifyChargeFailure, secretsMatch, verifyAbacateSignature } from './verify.ts'

describe('assinatura do webhook', () => {
  it('confere o HMAC do corpo cru e rejeita corpo alterado', () => {
    const key = 'chave-publica-de-teste'
    const body = '{"id":"log_1","event":"subscription.payment_failed","devMode":true}'
    const signature = crypto.createHmac('sha256', key).update(Buffer.from(body, 'utf8')).digest('base64')
    assert.equal(verifyAbacateSignature(body, signature, key), true)
    assert.equal(verifyAbacateSignature(body + ' ', signature, key), false)
    assert.equal(verifyAbacateSignature(body, signature, 'outra'), false)
  })

  it('compara segredo sem aceitar vazio', () => {
    assert.equal(secretsMatch('abc', 'abc'), true)
    assert.equal(secretsMatch('abc', 'abd'), false)
    assert.equal(secretsMatch('', 'abc'), false)
  })
})

describe('falha e cancelamento', () => {
  it('separa saldo insuficiente de revogação', () => {
    assert.equal(classifyChargeFailure({ rejectCode: 'AM04' }), 'saldo_insuficiente')
    assert.equal(classifyChargeFailure({ reason: 'saldo insuficiente' }), 'saldo_insuficiente')
    assert.equal(classifyChargeFailure({ rejectCode: 'MD01' }), 'autorizacao_revogada')
    assert.equal(classifyChargeFailure({ reason: 'cartão recusado' }), 'falha_cobranca')
  })

  it('trata cancelamento Pix sem causa como revogação no banco', () => {
    assert.equal(classifyCancellation({ cancelledDueTo: 'max_payment_retries_exceeded', method: 'PIX' }), 'inadimplencia')
    assert.equal(classifyCancellation({ cancelledDueTo: null, method: 'PIX' }), 'autorizacao_revogada')
    assert.equal(classifyCancellation({ cancelledDueTo: null, method: 'CARD' }), 'cancelada')
  })
})
