import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'
import { ABACATEPAY_PUBLIC_KEY, assinarCorpo, assinaturaConfere, compararSegredo } from './signature'

test('assinatura HMAC confere o corpo cru e rejeita corpo alterado', () => {
  const corpo = Buffer.from('{"id":"log_1","devMode":true}')
  const assinatura = assinarCorpo(corpo)
  const direta = createHmac('sha256', ABACATEPAY_PUBLIC_KEY).update(corpo).digest('base64')
  assert.equal(assinatura, direta)
  assert.equal(assinaturaConfere(corpo, assinatura), true)
  assert.equal(assinaturaConfere(Buffer.from(corpo.toString() + ' '), assinatura), false)
  assert.equal(assinaturaConfere(corpo, ''), false)
})

test('segredo comparado em tamanho diferente não passa', () => {
  assert.equal(compararSegredo('segredo-certo-com-32-caracteres-ou-mais', 'segredo-certo-com-32-caracteres-ou-mais'), true)
  assert.equal(compararSegredo('outro', 'segredo-certo-com-32-caracteres-ou-mais'), false)
})
