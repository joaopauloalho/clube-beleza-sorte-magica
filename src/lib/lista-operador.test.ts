import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  filtrarIntegrantes,
  filtrarIntegrantesParaPlanilha,
  filtrarLeadsSemCota,
  rotuloMesDoCiclo,
  rotuloSituacao,
} from './lista-operador'

const grupo = 'grupo-1'
const linhas = [
  { grupo_id: grupo, status: 'ativo', em_dia: true, data_contemplacao: null, nome: 'Ana' },
  { grupo_id: grupo, status: 'inadimplente', em_dia: false, data_contemplacao: null, nome: 'Bia' },
  { grupo_id: grupo, status: 'sorteado', em_dia: true, data_contemplacao: '2027-04-10', nome: 'Cia' },
  { grupo_id: grupo, status: 'cancelado', em_dia: false, data_contemplacao: null, nome: 'Dora' },
  { grupo_id: grupo, status: 'aguardando_grupo', em_dia: false, data_contemplacao: null, nome: 'Eva' },
  { grupo_id: 'outro', status: 'ativo', em_dia: true, data_contemplacao: null, nome: 'Ana' },
]

test('filtros da tela de integrantes', () => {
  assert.deepEqual(filtrarIntegrantes(linhas, grupo, 'todas', '').map((l) => l.nome), ['Ana', 'Bia', 'Cia', 'Dora', 'Eva'])
  assert.deepEqual(filtrarIntegrantes(linhas, grupo, 'em_dia', '').map((l) => l.nome), ['Ana', 'Cia'])
  assert.deepEqual(filtrarIntegrantes(linhas, grupo, 'atraso', '').map((l) => l.nome), ['Bia'])
  assert.deepEqual(filtrarIntegrantes(linhas, grupo, 'sorteadas', '').map((l) => l.nome), ['Cia'])
  assert.deepEqual(filtrarIntegrantes(linhas, grupo, 'canceladas', 'do').map((l) => l.nome), ['Dora'])
  assert.deepEqual(filtrarIntegrantes(linhas, grupo, 'leads', ''), [])
})

test('planilha de integrantes no filtro de leads usa a busca sem cortar a situação', () => {
  assert.deepEqual(filtrarIntegrantesParaPlanilha(linhas, grupo, 'leads', 'ia').map((l) => l.nome), ['Bia', 'Cia'])
})

test('leads sem cota repetem o recorte da tela', () => {
  const leads = [
    { nome: 'Ana', whatsapp: '43999990000' },
    { nome: 'Lia', whatsapp: null },
    { nome: 'Nara', whatsapp: '43988880000' },
  ]
  const comCota = new Set(['43999990000'])
  assert.deepEqual(filtrarLeadsSemCota(leads, comCota, 'a').map((l) => l.nome), ['Lia', 'Nara'])
  assert.deepEqual(filtrarLeadsSemCota(leads, comCota, 'lia').map((l) => l.nome), ['Lia'])
})

test('mês do ciclo e situação', () => {
  assert.equal(rotuloMesDoCiclo(0, null), 'Ciclo ainda não começou')
  assert.equal(rotuloMesDoCiclo(0, '2027-01-01'), 'Mês 1 de 12')
  assert.equal(rotuloMesDoCiclo(3, '2027-01-01'), 'Mês 4 de 12')
  assert.equal(rotuloMesDoCiclo(12, '2027-01-01'), 'Ciclo encerrado')
  assert.equal(rotuloSituacao('sorteado', false, true), 'Sorteada, em atraso')
  assert.equal(rotuloSituacao('aguardando_grupo', false, false), 'Aguardando grupo')
})
