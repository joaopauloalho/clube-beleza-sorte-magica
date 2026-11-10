import assert from 'node:assert/strict'
import { test } from 'node:test'
import { efeitoNoMembro, interpretarEvento } from './webhook-eventos'

const base = {
  id: 'log_1',
  devMode: true,
  data: {
    subscription: { id: 'subs_1', cancelledDueTo: null, cancelPolicy: null },
    checkout: { id: 'bill_1', externalId: 'membro-1' },
    payment: { id: 'pay_1', amount: 5000, status: 'PAID' },
  },
}

test('recusa evento que não está em devMode', () => {
  const acao = interpretarEvento({ ...base, devMode: false, event: 'subscription.completed' })
  assert.equal(acao.tipo, 'recusar')
  if (acao.tipo === 'recusar') assert.equal(acao.status, 422)
})

test('pagamento confirmado marca a integrante em dia', () => {
  const acao = interpretarEvento({ ...base, event: 'subscription.completed' })
  assert.equal(acao.tipo, 'pagamento')
  const efeito = efeitoNoMembro(acao, { status: 'aguardando_pix', emDia: false })
  assert.equal(efeito?.emDia, true)
  assert.equal(efeito?.status, 'ativo')
  assert.equal(efeito?.assinaturaStatus, 'ativa')
})

test('falha com saldo insuficiente tira a pessoa do sorteio', () => {
  const acao = interpretarEvento({
    ...base,
    event: 'subscription.payment_failed',
    data: { ...base.data, rejectCode: 'AM04', payment: { ...base.data.payment, status: 'FAILED' } },
  })
  assert.equal(acao.tipo, 'falha')
  if (acao.tipo === 'falha') assert.equal(acao.classe, 'saldo_insuficiente')
  const efeito = efeitoNoMembro(acao, { status: 'ativo', emDia: true })
  assert.equal(efeito?.emDia, false)
  assert.equal(efeito?.status, 'inadimplente')
})

test('revogação no banco cancela na hora', () => {
  const acao = interpretarEvento({
    ...base,
    event: 'subscription.cancelled',
    data: {
      ...base.data,
      subscription: { id: 'subs_1', cancelledDueTo: 'pix_automatic_authorization_refused', cancelPolicy: 'NOW' },
    },
  })
  const efeito = efeitoNoMembro(acao, { status: 'ativo', emDia: true })
  assert.equal(efeito?.assinaturaStatus, 'revogada')
  assert.equal(efeito?.emDia, false)
  assert.equal(efeito?.status, 'cancelado')
})

test('fim das tentativas cancela e tira do sorteio', () => {
  const acao = interpretarEvento({
    ...base,
    event: 'subscription.cancelled',
    data: {
      ...base.data,
      subscription: { id: 'subs_1', cancelledDueTo: 'max_payment_retries_exceeded', cancelPolicy: 'NOW' },
    },
  })
  const efeito = efeitoNoMembro(acao, { status: 'ativo', emDia: true })
  assert.equal(efeito?.assinaturaStatus, 'cancelada_retentativas')
  assert.equal(efeito?.status, 'inadimplente')
})

test('cancelamento pelo portal no fim do ciclo mantém quem já pagou', () => {
  const acao = interpretarEvento({
    ...base,
    event: 'subscription.cancelled',
    data: {
      ...base.data,
      subscription: { id: 'subs_1', cancelledDueTo: 'Cancelada pelo cliente no portal: preço', cancelPolicy: 'NEXT_CYCLE' },
    },
  })
  const efeito = efeitoNoMembro(acao, { status: 'ativo', emDia: true })
  assert.equal(efeito?.manterEmDiaAteFimDoCiclo ?? efeito?.emDia, true)
  assert.equal(efeito?.assinaturaStatus, 'cancelada_fim_ciclo')
  assert.equal(efeito?.status, 'ativo')
})

test('checkout.completed não muda a assinatura uma segunda vez', () => {
  const acao = interpretarEvento({ ...base, event: 'checkout.completed' })
  assert.equal(acao.tipo, 'ignorar')
})

test('quem já foi sorteada não volta para ativa quando paga de novo', () => {
  const acao = interpretarEvento({ ...base, event: 'subscription.renewed' })
  const efeito = efeitoNoMembro(acao, { status: 'sorteado', emDia: false })
  assert.equal(efeito?.status, 'sorteado')
  assert.equal(efeito?.emDia, true)
})
