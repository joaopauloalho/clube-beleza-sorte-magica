import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { DIA_PAGAMENTO, DIA_SORTEIO, fraseDoCiclo } from './ciclo'
import { maiorCredito, planosCanonicos } from './planos-publicos'
import { LISTA_SERVICOS_PLACEHOLDER, SERVICOS_DO_CLUBE } from './servicos'

test('o ciclo público usa um único par de dias e não garante o prêmio', () => {
  assert.equal(DIA_PAGAMENTO, 5)
  assert.equal(DIA_SORTEIO, 10)
  assert.match(fraseDoCiclo(), /dia 5/)
  assert.match(fraseDoCiclo(), /dia 10/)
  assert.match(fraseDoCiclo(), /pode ser sorteada/)
  assert.equal(/vai ganhar|1\.700|1700/.test(fraseDoCiclo()), false)
})

test('o teto do crédito é o maior plano, e a lista de serviços está vazia', () => {
  assert.equal(maiorCredito(planosCanonicos()), 1600)
  assert.equal(SERVICOS_DO_CLUBE.length, 0)
  assert.equal(LISTA_SERVICOS_PLACEHOLDER, '[A DEFINIR: lista de serviços]')
  const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '../..')
  const pagina = readFileSync(join(raiz, 'src/pages/Index.tsx'), 'utf8')
  assert.equal(pagina.includes('1700') || pagina.includes('1.700'), false)
  assert.match(pagina, /fraseDoCiclo|DIA_PAGAMENTO/)
})
