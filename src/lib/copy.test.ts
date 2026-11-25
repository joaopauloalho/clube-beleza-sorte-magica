import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { GRUPOS_PROCEDIMENTOS } from './procedimentos'
import { imaginePrimeiraMensalidade, LINHA_CHANCE, LINHA_SORTEIO, TEXTO_OPTIN_WHATSAPP, TEXTO_REGULAMENTO } from './copy'
import { PLANS } from './plans'

const proibido = /dobra|dia seguinte|poucos dias|logo em seguida|vai ganhar|m\/12/i

test('a frase usa o valor de cada plano e não promete prazo nem garantia', () => {
  const porSlug = Object.fromEntries(PLANS.map((plano) => [plano.slug, imaginePrimeiraMensalidade(plano.mensalidade, plano.credito)]))
  assert.match(porSlug.essencial, /50/)
  assert.match(porSlug.essencial, /700/)
  assert.match(porSlug.radiante, /75/)
  assert.match(porSlug.radiante, /1\.200/)
  assert.match(porSlug.suprema, /100/)
  assert.match(porSlug.suprema, /1\.700/)
  for (const frase of Object.values(porSlug)) {
    assert.match(frase, /Imagine pagar/)
    assert.match(frase, /poder ser sorteada/)
    assert.match(frase, /primeiro sorteio/)
    assert.equal(proibido.test(frase), false)
  }
  assert.match(LINHA_SORTEIO, /regulamento/)
  assert.match(LINHA_CHANCE, /aumenta/)
  assert.equal(proibido.test(LINHA_CHANCE), false)
})

test('a função de consentimento mais nova repete o texto da interface', () => {
  const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '../..')
  const sql = readFileSync(join(raiz, 'supabase/migrations/20261125143000_credito_uso_grupos_regulamento.sql'), 'utf8')
  assert.ok(sql.includes(TEXTO_REGULAMENTO))
  assert.ok(sql.includes(TEXTO_OPTIN_WHATSAPP))
  assert.equal(sql.includes('Clube Beleza'), false)
  assert.equal(sql.includes('em até 12 meses'), false)
  assert.equal(/update\s+public\.leads/i.test(sql), false)
  assert.equal(/delete\s+from\s+public\.leads/i.test(sql), false)
  for (const item of GRUPOS_PROCEDIMENTOS.flatMap((grupo) => grupo.itens)) {
    const nome = item.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    assert.match(sql, new RegExp(`\\('${item.id}', '${nome}'\\)`))
  }
})

test('as telas públicas não mostram a conta da chance nem a frase de dobrar', () => {
  const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '../..')
  const arquivos = [
    'src/pages/Index.tsx',
    'src/pages/Adesao.tsx',
    'src/pages/Area.tsx',
    'src/pages/ListaEspera.tsx',
    'src/components/PlanosGrid.tsx',
    'src/components/LinhaDeCredito.tsx',
  ]
  for (const arquivo of arquivos) {
    const texto = readFileSync(join(raiz, arquivo), 'utf8')
    assert.equal(proibido.test(texto), false, arquivo)
    assert.equal(texto.includes('Chance:'), false, arquivo)
  }
})
