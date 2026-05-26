import { z } from 'zod'

export const cadastroSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (99) 99999-9999'),
  plano_interesse: z.string().min(1, 'Selecione um plano'),
})

export type CadastroFormData = z.infer<typeof cadastroSchema>

export const cadastroComCheckoutSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (99) 99999-9999'),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Formato: 000.000.000-00'),
  plano: z.enum(['Beleza Essencial', 'Beleza Radiante', 'Beleza Suprema'], {
    errorMap: () => ({ message: 'Selecione um plano' }),
  }),
})

export type CadastroComCheckoutData = z.infer<typeof cadastroComCheckoutSchema>

export function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}
