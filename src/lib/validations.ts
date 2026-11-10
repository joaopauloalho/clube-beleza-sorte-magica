import { z } from 'zod'
import { PLAN_NAMES } from './plans.ts'

export const listaEsperaSchema = z.object({
  nome: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  whatsapp: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (99) 99999-9999'),
  plano: z.enum(PLAN_NAMES, { errorMap: () => ({ message: 'Selecione um plano' }) }),
  aceita_regulamento: z.boolean().refine((value) => value === true, {
    message: 'É preciso aceitar o texto do regulamento para entrar na lista.',
  }),
  optin_whatsapp: z.boolean(),
})

export type ListaEsperaData = z.infer<typeof listaEsperaSchema>

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
