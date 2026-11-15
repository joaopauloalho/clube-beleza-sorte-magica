import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  chanceDoProximoSorteio,
  formatarPercentual,
  linkWhatsapp,
  mensagemUltimaCobranca,
  nomeDoMes,
  resumirGrupo,
  textoDoCanal,
} from './operador-resumo'

test('resumo do grupo separa em dia, atraso, canceladas e sorteadas', () => {
  const r = resumirGrupo([
    { status: 'ativo', em_dia: true, data_contemplacao: null },
    { status: 'ativo', em_dia: true, data_contemplacao: null },
    { status: 'inadimplente', em_dia: false, data_contemplacao: null },
    { status: 'cancelado', em_dia: false, data_contemplacao: null },
    { status: 'sorteado', em_dia: true, data_contemplacao: '2027-02-10' },
  ])
  assert.deepEqual(r, { total: 5, emDia: 3, emAtraso: 1, canceladas: 1, sorteadas: 1, concorrem: 2 })
})

test('percentual em português com uma casa quando precisa', () => {
  assert.equal(formatarPercentual(4 / 37), '10,8%')
  assert.equal(formatarPercentual(0.1), '10%')
  assert.equal(formatarPercentual(1), '100%')
  assert.equal(formatarPercentual(0), '0%')
  assert.equal(chanceDoProximoSorteio(4, 37), '10,8%')
})

test('link do WhatsApp aceita celular brasileiro com ou sem 55 e recusa o resto', () => {
  assert.equal(linkWhatsapp('(43) 99999-1234', 'oi'), 'https://wa.me/5543999991234?text=oi')
  assert.equal(linkWhatsapp('+55 43 99999-1234', 'a b'), 'https://wa.me/5543999991234?text=a%20b')
  assert.equal(linkWhatsapp('4333331234', 'oi'), null)
  assert.equal(linkWhatsapp(null, 'oi'), null)
})

test('mensagem de última cobrança usa só o primeiro nome e não promete nada', () => {
  const m = mensagemUltimaCobranca('Fernanda Lima', 'R$ 75,00', 'abril')
  assert.match(m, /^Oi, Fernanda!/)
  assert.match(m, /R\$ 75,00/)
  assert.doesNotMatch(m, /ganhe|última chance|imperdível/i)
})

test('texto do Canal traz só cotas, chance real e a frase obrigatória', () => {
  const t = textoDoCanal('abril', [22, 3, 14, 37], 4, 37)
  assert.match(t, /Cotas sorteadas: 03, 14, 22, 37\./)
  assert.match(t, /4 entre 37 cotas em dia \(10,8%\)/)
  assert.match(t, /O crédito só existe se você for sorteada\./)
})

test('nome do mês', () => {
  assert.equal(nomeDoMes(0), 'janeiro')
  assert.equal(nomeDoMes(3), 'abril')
  assert.equal(nomeDoMes(13), 'fevereiro')
})
