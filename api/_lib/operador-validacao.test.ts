import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  competenciaDoMes,
  mensagemDoBanco,
  validarAcaoDoCalendario,
  validarEstorno,
  validarPagamentoManual,
} from './operador-validacao'

const ID = '0f8fad5b-d9cb-469f-a165-70867728950e'

test('competência vira o primeiro dia do mês', () => {
  assert.equal(competenciaDoMes('2027-03'), '2027-03-01')
  assert.equal(competenciaDoMes('2027-03-17'), '2027-03-01')
  assert.equal(competenciaDoMes('03/2027'), null)
  assert.equal(competenciaDoMes('2027-13'), null)
})

test('pagamento manual aceita dinheiro e exige explicação para "outro"', () => {
  const ok = validarPagamentoManual({ membroId: ID, competencia: '2027-03', valorCentavos: 7500, forma: 'dinheiro' })
  assert.ok(ok.ok)
  const semObs = validarPagamentoManual({ membroId: ID, competencia: '2027-03', valorCentavos: 7500, forma: 'outro' })
  assert.equal(semObs.ok, false)
  const comObs = validarPagamentoManual({ membroId: ID, competencia: '2027-03', valorCentavos: 7500, forma: 'outro', observacao: 'Troca por serviço' })
  assert.ok(comObs.ok)
})

test('pagamento manual recusa valor e forma inválidos', () => {
  assert.equal(validarPagamentoManual({ membroId: ID, competencia: '2027-03', valorCentavos: 0, forma: 'dinheiro' }).ok, false)
  assert.equal(validarPagamentoManual({ membroId: ID, competencia: '2027-03', valorCentavos: 75.5, forma: 'dinheiro' }).ok, false)
  assert.equal(validarPagamentoManual({ membroId: ID, competencia: '2027-03', valorCentavos: 7500, forma: 'fiado' }).ok, false)
  assert.equal(validarPagamentoManual({ membroId: 'x', competencia: '2027-03', valorCentavos: 7500, forma: 'dinheiro' }).ok, false)
  assert.equal(validarPagamentoManual(null).ok, false)
})

test('estorno exige motivo', () => {
  assert.equal(validarEstorno({ pagamentoId: ID, motivo: 'oi' }).ok, false)
  assert.ok(validarEstorno({ pagamentoId: ID, motivo: 'lancei na pessoa errada' }).ok)
})

test('ações do calendário', () => {
  assert.ok(validarAcaoDoCalendario({ acao: 'conferir', grupoId: ID }).ok)
  assert.ok(validarAcaoDoCalendario({ acao: 'gerar', grupoId: ID, primeiroSorteio: '2027-02-10' }).ok)
  assert.equal(validarAcaoDoCalendario({ acao: 'gerar', grupoId: ID, primeiroSorteio: 'amanhã' }).ok, false)
  assert.equal(validarAcaoDoCalendario({ acao: 'editar', grupoId: ID, mes: 6, quantidade: 6 }).ok, false)
  assert.ok(validarAcaoDoCalendario({ acao: 'editar', grupoId: ID, mes: 6, quantidade: 6, motivo: 'decidi fazer 6 em junho' }).ok)
  assert.equal(validarAcaoDoCalendario({ acao: 'editar', grupoId: ID, mes: 12, quantidade: 1, motivo: 'tentando o mês 12' }).ok, false)
  assert.equal(validarAcaoDoCalendario({ acao: 'apagar', grupoId: ID }).ok, false)
})

test('os códigos do banco viram frases', () => {
  assert.match(mensagemDoBanco('conferencia_pendente'), /conferência/)
  assert.match(mensagemDoBanco('ERROR: P0001: ja_pago_na_competencia'), /já está pago/)
  assert.match(mensagemDoBanco('algo inesperado'), /Não foi possível/)
  assert.match(mensagemDoBanco(null), /Não foi possível/)
})
