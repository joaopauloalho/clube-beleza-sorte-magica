import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatarReais } from './format'
import {
  economia,
  exemploAnoSuprema,
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
    'Microagulhamento',
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
    'Microagulhamento com PDRN',
    'Microagulhamento + Peeling',
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

test('o ganho da assinatura não se mistura com o crédito do sorteio', () => {
  const porSlug = Object.fromEntries(PLANS.map((plano) => [plano.slug, ofertaDoPlano({ ...plano, nomeCurto: plano.nome.replace(/^Beleza\s+/, ''), desconto: plano.precoMembro })]))
  assert.equal(porSlug.essencial.ganhoNome, 'Revitalização facial')
  assert.equal(porSlug.essencial.ganhoTabela, 180)
  assert.equal(porSlug.essencial.credito, 700)
  assert.equal(porSlug.essencial.bonus, 100)
  assert.equal(porSlug.essencial.ganhoTabela + porSlug.essencial.bonus, 280)
  assert.equal(porSlug.radiante.ganhoTabela + porSlug.radiante.bonus, 520)
  assert.equal(porSlug.suprema.ganhoTabela + porSlug.suprema.bonus, 849)
  assert.equal(porSlug.essencial.soma, 880)
  assert.equal(porSlug.radiante.credito, 1200)
  assert.equal(porSlug.radiante.bonus, 300)
  assert.equal(porSlug.radiante.soma, 1420)
  assert.equal(porSlug.suprema.ganhoNome, 'Microagulhamento')
  assert.equal(porSlug.suprema.soma, 2049)
  assert.match(porSlug.suprema.quase ?? '', /quase/)
  assert.match(porSlug.suprema.quase ?? '', /2\.000/)
  assert.equal(porSlug.essencial.quase, null)
  assert.equal(porSlug.radiante.quase, null)
  for (const oferta of Object.values(porSlug)) {
    assert.equal(oferta.credito, oferta.soma - oferta.ganhoTabela)
  }
})

test('o ano de exemplo da Suprema fecha a conta sem gastar o crédito restante', () => {
  const ano = exemploAnoSuprema()
  assert.equal(ano.usoCredito, 999 + 399)
  assert.equal(ano.restante, 302)
  assert.equal(ano.investiu, 1200)
  assert.equal(ano.aParte, 176 * 2)
  assert.equal(ano.recebeu, 349 + 1249 + 499 + 220 * 2)
  assert.equal(ano.economizou, ano.recebeu - (ano.investiu + ano.aParte))
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
