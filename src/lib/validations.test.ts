import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { listaEsperaSchema, maskCPF } from './validations.ts'

describe('maskCPF', () => {
  it('formata a digitação', () => {
    assert.equal(maskCPF('123'), '123')
    assert.equal(maskCPF('1234'), '123.4')
    assert.equal(maskCPF('123456'), '123.456')
    assert.equal(maskCPF('1234567'), '123.456.7')
    assert.equal(maskCPF('123456789'), '123.456.789')
    assert.equal(maskCPF('1234567890'), '123.456.789-0')
    assert.equal(maskCPF('12345678901'), '123.456.789-01')
  })

  it('ignora o que não é dígito e corta em 11', () => {
    assert.equal(maskCPF('abc.123def'), '123')
    assert.equal(maskCPF('123456789012345'), '123.456.789-01')
  })
})

describe('listaEsperaSchema', () => {
  const valid = {
    nome: 'Maria Silva',
    whatsapp: '(11) 99999-0000',
    plano: 'Beleza Suprema' as const,
    aceita_regulamento: true,
    optin_whatsapp: false,
  }

  it('aceita a lista sem opt-in de WhatsApp', () => {
    assert.equal(listaEsperaSchema.safeParse(valid).success, true)
  })

  it('recusa regulamento não aceito e plano desconhecido', () => {
    assert.equal(listaEsperaSchema.safeParse({ ...valid, aceita_regulamento: false }).success, false)
    assert.equal(listaEsperaSchema.safeParse({ ...valid, plano: 'Beleza Premium' }).success, false)
  })
})
