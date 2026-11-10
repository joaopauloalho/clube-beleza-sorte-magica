import { z } from 'zod'
import { TEXTO_OPTIN_WHATSAPP, TEXTO_REGULAMENTO } from './copy'
import { PLANS } from './plans'

export const SLUGS = PLANS.map((plan) => plan.slug) as ['essencial', 'radiante', 'suprema']

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function normalizarWhatsapp(valor: string): string {
  let digitos = apenasDigitos(valor)
  if (digitos.startsWith('55') && digitos.length >= 12) digitos = digitos.slice(2)
  return digitos
}

export function whatsappValido(valor: string): boolean {
  return /^[1-9]{2}9\d{8}$/.test(normalizarWhatsapp(valor))
}

export function maskWhatsApp(value: string): string {
  const digits = normalizarWhatsapp(value).slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function maskCPF(value: string): string {
  const digits = apenasDigitos(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/** Dígitos verificadores do CPF. Rejeita sequência repetida. */
export function cpfValido(valor: string): boolean {
  const digitos = apenasDigitos(valor)
  if (!/^\d{11}$/.test(digitos)) return false
  if (/^(\d)\1{10}$/.test(digitos)) return false

  const calcular = (tamanho: number) => {
    let soma = 0
    for (let i = 0; i < tamanho; i += 1) {
      soma += Number(digitos[i]) * (tamanho + 1 - i)
    }
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return calcular(9) === Number(digitos[9]) && calcular(10) === Number(digitos[10])
}

const whatsappSchema = z
  .string()
  .refine(whatsappValido, 'Informe um WhatsApp com DDD. Exemplo: (11) 98888-7777')

const cpfSchema = z.string().refine(cpfValido, 'CPF inválido')

export const listaEsperaSchema = z.object({
  nome: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(120),
  whatsapp: whatsappSchema,
  aceitouRegulamento: z.literal(true, {
    errorMap: () => ({ message: 'É preciso aceitar o regulamento para entrar na lista.' }),
  }),
  optInWhatsapp: z.boolean(),
})

export type ListaEsperaInput = z.infer<typeof listaEsperaSchema>

export const adesaoSchema = z.object({
  plano: z.enum(SLUGS, { errorMap: () => ({ message: 'Selecione um plano' }) }),
  nome: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(120),
  email: z.string().trim().email('E-mail inválido').max(160),
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres').max(72),
  cpf: cpfSchema,
  whatsapp: whatsappSchema,
  aceitouRegulamento: z.literal(true, {
    errorMap: () => ({ message: 'É preciso aceitar o regulamento.' }),
  }),
  optInWhatsapp: z.boolean(),
})

export type AdesaoInput = z.infer<typeof adesaoSchema>

export function textosDeConsentimento(optInWhatsapp: boolean): { tipo: 'regulamento' | 'whatsapp_opt_in'; aceito: boolean; texto: string }[] {
  const itens: { tipo: 'regulamento' | 'whatsapp_opt_in'; aceito: boolean; texto: string }[] = [
    { tipo: 'regulamento', aceito: true, texto: TEXTO_REGULAMENTO },
  ]
  if (optInWhatsapp) {
    itens.push({ tipo: 'whatsapp_opt_in', aceito: true, texto: TEXTO_OPTIN_WHATSAPP })
  }
  return itens
}
