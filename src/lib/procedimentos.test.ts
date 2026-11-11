import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatarReais } from './format'
import {
  economia,
  fraseBonusSuprema,
  fraseEconomia,
  GRUPOS_PROCEDIMENTOS,
  ofertaDoPlano,
  procedimentoPorId,
  procedimentosEmDestaque,
} from './procedimentos'
import { bonusEmServicos, PLANS } from './plans'

test('a tabela curta tem os 8 procedimentos na ordem pedida', () => {
  assert.deepEqual(procedimentosEmDestaque().map((item) => item.nome), [
    'Peeling',
    'Revitalização facial',
    'MMP',
    'Limpeza de pele',
    'Botox feminino',
    'Botox masculino',
    'Bioestimulador',
    'Preenchimento',
  ])
})

test('o restante só existe nos grupos completos', () => {
  const curtos = new Set(procedimentosEmDestaque().map((item) => item.id))
  const soNaCompleta = GRUPOS_PROCEDIMENTOS.flatMap((grupo) => grupo.itens).filter((item) => !curtos.has(item.id)).map((item) => item.nome)
  assert.deepEqual(soNaCompleta, [
    'Toxina 1 área',
    'Toxina full face',
    'Protocolo noiva',
    'MMP com PDRN',
    'MMP + Peeling',
    'Skinbooster',
  ])
})

test('os preços são os recebidos e a economia é tabela menos o plano', () => {
  const toxina = procedimentoPorId('toxina-botulinica')
  assert.equal(toxina.tabela, 1249)
  assert.equal(toxina.suprema, 999)
  assert.equal(economia(toxina.tabela, toxina.suprema), 250)
  assert.equal(fraseEconomia(toxina.tabela, toxina.suprema), `você economiza ${formatarReais(250)}`)
  assert.equal(procedimentoPorId('peim').tabela, 180)
  assert.equal(JSON.stringify(GRUPOS_PROCEDIMENTOS).includes('material'), false)
})

test('o que cada plano recebe sai dos dados e não de um total inventado', () => {
  const porSlug = Object.fromEntries(PLANS.map((plano) => [plano.slug, ofertaDoPlano({ ...plano, desconto: plano.precoMembro })]))
  assert.equal(porSlug.essencial.pagaMes, 50)
  assert.equal(porSlug.essencial.pagaAno, 600)
  assert.equal(porSlug.essencial.recebe, 700)
  assert.match(porSlug.essencial.linhas.join(' '), /Revitalização facial/)
  assert.match(porSlug.essencial.linhas.join(' '), /180/)
  assert.equal(porSlug.radiante.recebe, 1125 + 220)
  assert.equal(porSlug.suprema.recebe, 1700)
  assert.equal(porSlug.suprema.recebe, porSlug.suprema.pagaAno + bonusEmServicos(1700, 1200))
  assert.equal(JSON.stringify(porSlug).includes('2.000'), false)
  assert.equal(JSON.stringify(porSlug).includes('280'), false)
})

test('o texto da Suprema só diz metade quando o bônus cobre metade da toxina', () => {
  const suprema = PLANS.find((plano) => plano.slug === 'suprema')
  assert.ok(suprema)
  const bonus = bonusEmServicos(suprema.credito, suprema.total12)
  const frase = fraseBonusSuprema(bonus)
  assert.match(frase, /Botox feminino/)
  assert.match(frase, /metade/)
  assert.match(frase, /999/)
  assert.match(frase, /1\.249/)
  assert.equal(fraseBonusSuprema(100).includes('metade'), false)
})
