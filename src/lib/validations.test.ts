import { describe, it, expect } from 'bun:test'
import { maskCPF, cadastroComCheckoutSchema } from './validations'

describe('maskCPF', () => {
  it('formats partial input correctly', () => {
    expect(maskCPF('123')).toBe('123')
    expect(maskCPF('1234')).toBe('123.4')
    expect(maskCPF('123456')).toBe('123.456')
    expect(maskCPF('1234567')).toBe('123.456.7')
    expect(maskCPF('123456789')).toBe('123.456.789')
    expect(maskCPF('1234567890')).toBe('123.456.789-0')
    expect(maskCPF('12345678901')).toBe('123.456.789-01')
  })

  it('strips non-digit input', () => {
    expect(maskCPF('abc.123def')).toBe('123')
  })

  it('truncates at 11 digits', () => {
    expect(maskCPF('123456789012345')).toBe('123.456.789-01')
  })
})

describe('cadastroComCheckoutSchema', () => {
  const valid = {
    nome: 'Maria Silva',
    email: 'maria@exemplo.com',
    whatsapp: '(11) 99999-0000',
    cpf: '123.456.789-01',
    plano: 'Beleza Suprema' as const,
  }

  it('accepts valid input', () => {
    expect(cadastroComCheckoutSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects CPF without mask', () => {
    const result = cadastroComCheckoutSchema.safeParse({ ...valid, cpf: '12345678901' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown plano', () => {
    const result = cadastroComCheckoutSchema.safeParse({ ...valid, plano: 'Beleza Premium' })
    expect(result.success).toBe(false)
  })
})
