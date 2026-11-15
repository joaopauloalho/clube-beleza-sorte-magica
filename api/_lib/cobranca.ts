import { A_DEFINIR } from '../../src/lib/copy'
import { GROUP_SIZE } from '../../src/lib/plans'

export interface DecisaoCobranca {
  cobrar: boolean
  motivo: 'grupo_incompleto' | 'pix_nao_liberado' | 'liberado'
  aviso: string | null
}

/**
 * A AbacatePay só é chamada com a flag ligada e o grupo em 24.
 * Flag ausente ou diferente de "true" conta como desligada.
 */
export function decidirCobranca(input: {
  vagas: number
  total?: number
  pixAutomaticoLigado: boolean
}): DecisaoCobranca {
  const total = input.total ?? GROUP_SIZE
  if (input.vagas < total) {
    return {
      cobrar: false,
      motivo: 'grupo_incompleto',
      aviso: `O grupo está em ${input.vagas} de ${total}. Ninguém é cobrado antes de completar ${total}.`,
    }
  }
  if (!input.pixAutomaticoLigado) {
    return {
      cobrar: false,
      motivo: 'pix_nao_liberado',
      aviso: A_DEFINIR.pixLiberacao,
    }
  }
  return { cobrar: true, motivo: 'liberado', aviso: null }
}

export function pixAutomaticoLigado(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.ABACATEPAY_PIX_AUTOMATICO_ENABLED === 'true'
}

export interface ProdutoAssinaturaInput {
  externalId: string
  nome: string
  precoCentavos: number
}

/** Produto mensal, sem trialDays. Cupom não entra em Pix. */
export function corpoProdutoMensal(input: ProdutoAssinaturaInput): Record<string, unknown> {
  return {
    externalId: input.externalId,
    name: input.nome,
    price: input.precoCentavos,
    currency: 'BRL',
    cycle: 'MONTHLY',
  }
}

export interface AssinaturaPixInput {
  productId: string
  externalId: string
  customerId: string
  completionUrl: string
  returnUrl: string
}

/**
 * Checkout de assinatura. A assinatura subs_ só existe depois do pagamento
 * (webhook subscription.completed). Um produto, somente PIX, sem cupom e sem trial.
 */
export function corpoAssinaturaPix(input: AssinaturaPixInput): Record<string, unknown> {
  return {
    items: [{ id: input.productId, quantity: 1 }],
    methods: ['PIX'],
    externalId: input.externalId,
    customerId: input.customerId,
    completionUrl: input.completionUrl,
    returnUrl: input.returnUrl,
  }
}

export function corpoCliente(input: {
  nome: string
  email: string
  cpf: string
  celular: string
}): Record<string, unknown> {
  return {
    name: input.nome,
    email: input.email,
    taxId: input.cpf,
    cellphone: input.celular,
  }
}
