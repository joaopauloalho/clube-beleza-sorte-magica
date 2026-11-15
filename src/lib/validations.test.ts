import assert from 'node:assert/strict'
import { test } from 'node:test'
import { TEXTO_OPTIN_WHATSAPP, TEXTO_REGULAMENTO } from './copy'
import { adesaoSchema, cpfValido, listaEsperaSchema, maskCPF, maskWhatsApp, normalizarWhatsapp, textosDeConsentimento } from './validations'

test('CPF e WhatsApp', () => {
  assert.equal(cpfValido('529.982.247-25'), true)
  assert.equal(cpfValido('123.456.789-01'), false)
  assert.equal(cpfValido('111.111.111-11'), false)
  assert.equal(maskCPF('52998224725'), '529.982.247-25')
  assert.equal(normalizarWhatsapp('+55 (11) 98888-7777'), '11988887777')
  assert.equal(maskWhatsApp('11988887777'), '(11) 98888-7777')
})

test('regulamento é obrigatório e o opt-in de WhatsApp é separado', () => {
  const base = {
    nome: 'Ana Lima',
    whatsapp: '(11) 98888-7777',
    aceitouRegulamento: true,
    optInWhatsapp: false,
  }
  assert.equal(listaEsperaSchema.safeParse(base).success, true)
  assert.equal(listaEsperaSchema.safeParse({ ...base, aceitouRegulamento: false }).success, false)
  assert.equal(listaEsperaSchema.safeParse({ ...base, optInWhatsapp: true }).success, true)
  const textos = textosDeConsentimento(true)
  assert.deepEqual(textos.map((item) => item.texto), [TEXTO_REGULAMENTO, TEXTO_OPTIN_WHATSAPP])
  assert.equal(textosDeConsentimento(false).some((item) => item.tipo === 'whatsapp_opt_in'), false)
})

test('adesão exige CPF válido', () => {
  const resultado = adesaoSchema.safeParse({
    plano: 'essencial',
    nome: 'Ana Lima',
    email: 'ana@example.com',
    senha: 'senha-forte',
    cpf: '529.982.247-25',
    whatsapp: '(11) 98888-7777',
    aceitouRegulamento: true,
    optInWhatsapp: false,
  })
  assert.equal(resultado.success, true)
})
