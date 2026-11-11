import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bonusEmServicos, frasePorDia, PLANS, getPlanBySlug, precoEmCentavos } from './plans'
import { formatarReais } from './format'

test('há três planos e os valores canônicos', () => {
  assert.equal(PLANS.length, 3)
  assert.deepEqual(PLANS.map((plano) => [plano.slug, plano.mensalidade, plano.total12, plano.credito, plano.bonusClinica, plano.precoMembro]), [
    ['essencial', 50, 600, 700, 0.17, 0.1],
    ['radiante', 75, 900, 1350, 0.25, 0.15],
    ['suprema', 100, 1200, 1700, 0.33, 0.2],
  ])
})

test('o total de 12 meses é a mensalidade vezes 12', () => {
  for (const plano of PLANS) assert.equal(plano.total12, plano.mensalidade * 12)
})

test('o bônus em serviços é o crédito menos as 12 mensalidades', () => {
  assert.deepEqual(
    PLANS.map((plano) => bonusEmServicos(plano.credito, plano.total12)),
    [100, 450, 500],
  )
  for (const plano of PLANS) {
    assert.equal(bonusEmServicos(plano.credito, plano.total12), plano.credito - plano.total12)
  }
})

test('o preço por dia divide a mensalidade por 30', () => {
  assert.equal(frasePorDia(50), `menos de ${formatarReais(1.7)} por dia`)
  assert.equal(frasePorDia(75), `${formatarReais(2.5)} por dia`)
  assert.equal(frasePorDia(100), `${formatarReais(3.33)} por dia`)
})

test('a migration da Suprema só troca o crédito de 1600 para 1700', () => {
  const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '../..')
  const sql = readFileSync(join(raiz, 'supabase/migrations/20261111040200_credito_suprema_1700.sql'), 'utf8')
  assert.match(sql, /where nome = 'Beleza Suprema'/)
  assert.match(sql, /and credito_sorteio = 1600/)
  assert.match(sql, /set credito_sorteio = 1700/)
  assert.equal(/update\s+public\.leads/i.test(sql), false)
  assert.equal(/delete\s+from/i.test(sql), false)
})

test('a migration da Radiante só troca o crédito de 1125 para 1350', () => {
  const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '../..')
  const sql = readFileSync(join(raiz, 'supabase/migrations/20261111050000_credito_radiante_1350.sql'), 'utf8')
  assert.match(sql, /where nome = 'Beleza Radiante'/)
  assert.match(sql, /and credito_sorteio = 1125/)
  assert.match(sql, /set credito_sorteio = 1350/)
  assert.equal(/update\s+public\.leads/i.test(sql), false)
  assert.equal(/delete\s+from/i.test(sql), false)
})

test('busca por slug e centavos', () => {
  assert.equal(getPlanBySlug('radiante')?.nome, 'Beleza Radiante')
  assert.equal(getPlanBySlug('inexistente'), undefined)
  assert.equal(precoEmCentavos(75), 7500)
  assert.equal(precoEmCentavos(1125), 112500)
})
