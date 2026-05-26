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

export function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
