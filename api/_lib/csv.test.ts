import assert from 'node:assert/strict'
import { test } from 'node:test'
import { centavosParaPlanilha, dataParaPlanilha, planilha } from './csv'

test('planilha abre no Excel em português', () => {
  const arquivo = planilha([
    ['Nome', 'Cidade'],
    ['Ana', 'São Paulo'],
    ['=cmd', 'disse "oi"; e saiu'],
  ])
  assert.equal(arquivo.charCodeAt(0), 0xfeff)
  assert.match(arquivo, /Nome;Cidade\r\nAna;São Paulo\r\n'=cmd;"disse ""oi""; e saiu"\r\n/)
})

test('centavos e data de calendário', () => {
  assert.equal(centavosParaPlanilha(170050), '1700,50')
  assert.equal(centavosParaPlanilha(5), '0,05')
  assert.equal(dataParaPlanilha('2027-03-01'), '01/03/2027')
  assert.equal(dataParaPlanilha(null), '')
})
