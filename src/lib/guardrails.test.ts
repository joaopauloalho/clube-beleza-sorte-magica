import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { TEXTO_OPTIN_WHATSAPP, TEXTO_REGULAMENTO } from './copy'

const raiz = join(fileURLToPath(new URL('.', import.meta.url)), '../..')

function arquivos(diretorio: string): string[] {
  return readdirSync(diretorio).flatMap((nome) => {
    const caminho = join(diretorio, nome)
    if (nome === 'ui' || nome.includes('.test.')) return []
    if (statSync(caminho).isDirectory()) return arquivos(caminho)
    return caminho.endsWith('.ts') || caminho.endsWith('.tsx') || caminho.endsWith('.html') ? [caminho] : []
  })
}

test('texto de produto não usa a palavra proibida nem linguagem de procedimento', () => {
  const alvos = [
    ...arquivos(join(raiz, 'src/pages')),
    ...arquivos(join(raiz, 'src/components')),
    ...arquivos(join(raiz, 'src/lib')),
    join(raiz, 'index.html'),
  ]
  // Peeling e limpeza de pele estão na tabela que o João enviou. Continuam fora daqui.
  const proibidos = [/cons[oó]rcio/i, /lovable/i, /user_metadata/i, /microagulhamento/i, /antes e depois/i]
  for (const arquivo of alvos) {
    const texto = readFileSync(arquivo, 'utf8')
    for (const regra of proibidos) {
      assert.equal(regra.test(texto), false, `${arquivo} contém ${regra}`)
    }
  }
})

test('migrations não reescrevem leads e derrubam as políticas de user_metadata', () => {
  const migracoes = readdirSync(join(raiz, 'supabase/migrations')).map((nome) => readFileSync(join(raiz, 'supabase/migrations', nome), 'utf8')).join('\n')
  assert.equal(/update\s+public\.leads/i.test(migracoes), false)
  assert.equal(/delete\s+from\s+public\.leads/i.test(migracoes), false)
  for (const politica of ['leads_select', 'leads_update_admin', 'planos_admin_write', 'grupos_admin_write', 'membros_select', 'membros_admin_write']) {
    assert.match(migracoes, new RegExp(`drop policy if exists ${politica}`, 'i'))
  }
  assert.match(migracoes, /leads_whatsapp_novos_uidx/)
  assert.match(migracoes, /where dedupe_whatsapp/)
  assert.match(migracoes, new RegExp(TEXTO_REGULAMENTO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(migracoes, new RegExp(TEXTO_OPTIN_WHATSAPP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.doesNotMatch(migracoes, /create policy[\s\S]{0,400}user_metadata/i)
})

test('código de aplicação não consulta user_metadata', () => {
  const texto = [...arquivos(join(raiz, 'src')), ...arquivos(join(raiz, 'api'))].map((arquivo) => readFileSync(arquivo, 'utf8')).join('\n')
  assert.equal(texto.includes('user_metadata'), false)
  assert.equal(texto.includes('lovable'), false)
})
