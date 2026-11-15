import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chanceReal, filtrarElegiveis, proximoMes, quantidadeDoMes, sortear, type MembroParaSorteio } from './sorteio'

function membro(parcial: Partial<MembroParaSorteio> & Pick<MembroParaSorteio, 'id' | 'cota'>): MembroParaSorteio {
  return {
    emDia: true,
    jaSorteado: false,
    status: 'ativo',
    ...parcial,
  }
}

test('sai quem não está em dia, quem já foi sorteada e quem não está ativa', () => {
  const lista = filtrarElegiveis([
    membro({ id: 'a', cota: 2 }),
    membro({ id: 'b', cota: 1, emDia: false }),
    membro({ id: 'c', cota: 3, jaSorteado: true }),
    membro({ id: 'd', cota: 4, status: 'inadimplente' }),
    membro({ id: 'e', cota: 5, status: 'cancelado' }),
    membro({ id: 'f', cota: 6, status: 'aguardando_grupo' }),
  ])
  assert.deepEqual(lista.map((item) => item.membroId), ['a'])
})

test('sorteia 2 e guarda a lista inteira de elegíveis na conta da chance', () => {
  const elegiveis = filtrarElegiveis([1, 2, 3, 4].map((cota) => membro({ id: `m${cota}`, cota })))
  const sequencia = [0, 0]
  const sorteados = sortear(elegiveis, () => sequencia.shift() ?? 0)
  assert.equal(quantidadeDoMes(elegiveis.length), 2)
  assert.deepEqual(sorteados.map((item) => item.cota), [1, 2])
  assert.equal(chanceReal(14), 2 / 14)
  assert.equal(chanceReal(2), 1)
  assert.equal(chanceReal(1), 1)
  assert.equal(proximoMes(0), 1)
  assert.equal(proximoMes(11), 12)
})

test('a quantidade do mês vem do calendário do grupo e nunca passa de quem concorre', () => {
  const elegiveis = filtrarElegiveis([1, 2, 3, 4, 5, 6].map((cota) => membro({ id: `m${cota}`, cota })))
  const zeros = () => 0
  assert.equal(sortear(elegiveis, zeros, 4).length, 4)
  assert.equal(sortear(elegiveis, zeros, 9).length, 6)
  assert.equal(sortear(elegiveis, zeros, 0).length, 0)
  assert.equal(chanceReal(37, 4), 4 / 37)
  assert.equal(chanceReal(3, 5), 1)
})
