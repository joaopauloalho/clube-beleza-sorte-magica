import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatarReais } from './format'
import {
  economia,
  fraseBonusSuprema,
  fraseEconomia,
  fraseEssencial,
  GRUPOS_PROCEDIMENTOS,
  procedimentoPorId,
  procedimentosEmDestaque,
} from './procedimentos'
import { bonusEmServicos, PLANS } from './plans'

test('a tabela curta tem os 8 procedimentos na ordem pedida', () => {
  assert.deepEqual(procedimentosEmDestaque().map((item) => item.nome), [
    'Peeling',
    'PEIM (revitalização)',
    'MMP',
    'Limpeza de pele',
    'Toxina botulínica (botox feminino)',
    'Toxina masculina',
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

test('a Essencial cita o PEIM de tabela e o bônus calculado', () => {
  const essencial = PLANS.find((plano) => plano.slug === 'essencial')
  assert.ok(essencial)
  const frase = fraseEssencial(essencial.mensalidade, essencial.total12, essencial.credito)
  assert.match(frase, /PEIM \(revitalização\)/)
  assert.match(frase, /180/)
  assert.match(frase, new RegExp(formatarReais(bonusEmServicos(essencial.credito, essencial.total12)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.equal(frase.includes('A CONFIRMAR'), false)
})

test('o texto da Suprema só diz metade quando o bônus cobre metade da toxina', () => {
  const suprema = PLANS.find((plano) => plano.slug === 'suprema')
  assert.ok(suprema)
  const bonus = bonusEmServicos(suprema.credito, suprema.total12)
  const frase = fraseBonusSuprema(bonus)
  assert.match(frase, /metade/)
  assert.match(frase, /999/)
  assert.match(frase, /1\.249/)
  assert.equal(fraseBonusSuprema(100).includes('metade'), false)
})
