export type ClasseFalha = 'saldo_insuficiente' | 'falha'
export type ClasseCancelamento = 'revogada_banco' | 'retentativas' | 'cancelada_cliente' | 'cancelada'

export type AcaoWebhook =
  | { tipo: 'ignorar'; motivo: string }
  | { tipo: 'recusar'; status: number; motivo: string }
  | {
      tipo: 'pagamento'
      status: 'pago'
      externalId: string | null
      subscriptionId: string | null
      checkoutId: string | null
      paymentId: string | null
      valorCentavos: number | null
      competenciaSugerida: number | null
    }
  | {
      tipo: 'falha'
      classe: ClasseFalha
      externalId: string | null
      subscriptionId: string | null
      checkoutId: string | null
      paymentId: string | null
      motivo: string
      competenciaSugerida: number | null
    }
  | {
      tipo: 'cancelamento'
      classe: ClasseCancelamento
      externalId: string | null
      subscriptionId: string | null
      checkoutId: string | null
      motivo: string
      manterEmDiaAteFimDoCiclo: boolean
    }

function comoRegistro(valor: unknown): Record<string, unknown> | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null
  return valor as Record<string, unknown>
}

function texto(valor: unknown): string | null {
  return typeof valor === 'string' && valor.trim() ? valor : null
}

function inteiro(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null
}

const SALDO = /saldo|insufficient|insuficiente|no[_\s-]?funds|\bAM04\b/i

export function classificarFalha(data: Record<string, unknown>): { classe: ClasseFalha; motivo: string } {
  const payment = comoRegistro(data.payment)
  const partes = [
    texto(data.rejectCode),
    texto(data.reason),
    texto(payment?.reason),
    texto(payment?.rejectCode),
    texto(payment?.status),
  ].filter(Boolean) as string[]
  const motivo = partes.join(' | ') || 'cobranca_recusada'
  return {
    classe: SALDO.test(motivo) ? 'saldo_insuficiente' : 'falha',
    motivo,
  }
}

export function classificarCancelamento(cancelledDueTo: string | null, cancelPolicy: string | null): {
  classe: ClasseCancelamento
  manterEmDiaAteFimDoCiclo: boolean
} {
  if (cancelledDueTo === 'pix_automatic_authorization_refused') {
    return { classe: 'revogada_banco', manterEmDiaAteFimDoCiclo: false }
  }
  if (cancelledDueTo === 'max_payment_retries_exceeded') {
    return { classe: 'retentativas', manterEmDiaAteFimDoCiclo: false }
  }
  if (cancelledDueTo && /cliente/i.test(cancelledDueTo)) {
    return { classe: 'cancelada_cliente', manterEmDiaAteFimDoCiclo: cancelPolicy === 'NEXT_CYCLE' }
  }
  return { classe: 'cancelada', manterEmDiaAteFimDoCiclo: cancelPolicy === 'NEXT_CYCLE' }
}

function referencias(data: Record<string, unknown>) {
  const subscription = comoRegistro(data.subscription)
  const checkout = comoRegistro(data.checkout)
  const payment = comoRegistro(data.payment)
  return {
    externalId: texto(checkout?.externalId) ?? texto(payment?.externalId) ?? texto(data.externalId),
    subscriptionId: texto(subscription?.id),
    checkoutId: texto(checkout?.id),
    paymentId: texto(payment?.id),
    valorCentavos: inteiro(payment?.amount) ?? inteiro(subscription?.amount),
    competenciaSugerida: inteiro(data.installmentNumber),
  }
}

/**
 * Traduz um evento de assinatura já autenticado.
 * checkout.completed é ignorado de propósito: a doc diz que a contratação também
 * dispara esse evento, e o estado da assinatura fica só nos eventos subscription.*.
 */
export function interpretarEvento(payload: unknown): AcaoWebhook {
  const raiz = comoRegistro(payload)
  if (!raiz) return { tipo: 'recusar', status: 400, motivo: 'payload_invalido' }
  if (raiz.devMode !== true) return { tipo: 'recusar', status: 422, motivo: 'devMode_obrigatorio' }
  if (!texto(raiz.id)) return { tipo: 'recusar', status: 400, motivo: 'evento_sem_id' }

  const evento = texto(raiz.event) ?? ''
  const data = comoRegistro(raiz.data) ?? {}

  if (!evento.startsWith('subscription.')) {
    return { tipo: 'ignorar', motivo: 'evento_fora_da_assinatura' }
  }

  if (evento === 'subscription.completed' || evento === 'subscription.renewed') {
    return { tipo: 'pagamento', status: 'pago', ...referencias(data) }
  }

  if (evento === 'subscription.payment_failed') {
    const falha = classificarFalha(data)
    return { tipo: 'falha', ...falha, ...referencias(data) }
  }

  if (evento === 'subscription.cancelled') {
    const subscription = comoRegistro(data.subscription)
    const dueTo = texto(subscription?.cancelledDueTo)
    const policy = texto(subscription?.cancelPolicy)
    const classe = classificarCancelamento(dueTo, policy)
    return {
      tipo: 'cancelamento',
      classe: classe.classe,
      motivo: dueTo ?? policy ?? 'cancelada',
      manterEmDiaAteFimDoCiclo: classe.manterEmDiaAteFimDoCiclo,
      externalId: referencias(data).externalId,
      subscriptionId: referencias(data).subscriptionId,
      checkoutId: referencias(data).checkoutId,
    }
  }

  return { tipo: 'ignorar', motivo: `evento_nao_tratado:${evento}` }
}

export interface EfeitoMembro {
  status: string
  emDia: boolean
  assinaturaStatus: string
  pagamentoStatus: 'pago' | 'falhou' | 'saldo_insuficiente' | null
}

/** Traduz o evento para o estado do membro. Quem já foi sorteada não volta para ativo. */
export function efeitoNoMembro(
  acao: AcaoWebhook,
  atual: { status: string; emDia: boolean },
): EfeitoMembro | null {
  const sorteada = atual.status === 'sorteado'
  if (acao.tipo === 'pagamento') {
    return {
      status: sorteada ? 'sorteado' : 'ativo',
      emDia: true,
      assinaturaStatus: 'ativa',
      pagamentoStatus: 'pago',
    }
  }
  if (acao.tipo === 'falha') {
    return {
      status: sorteada ? 'sorteado' : 'inadimplente',
      emDia: false,
      assinaturaStatus: acao.classe === 'saldo_insuficiente' ? 'saldo_insuficiente' : 'falha_cobranca',
      pagamentoStatus: acao.classe === 'saldo_insuficiente' ? 'saldo_insuficiente' : 'falhou',
    }
  }
  if (acao.tipo === 'cancelamento') {
    if (acao.manterEmDiaAteFimDoCiclo) {
      return {
        status: atual.status,
        emDia: atual.emDia,
        assinaturaStatus: 'cancelada_fim_ciclo',
        pagamentoStatus: null,
      }
    }
    const status = acao.classe === 'retentativas'
      ? (sorteada ? 'sorteado' : 'inadimplente')
      : (sorteada ? 'sorteado' : 'cancelado')
    const assinaturaStatus = acao.classe === 'revogada_banco'
      ? 'revogada'
      : acao.classe === 'retentativas'
        ? 'cancelada_retentativas'
        : 'cancelada'
    return { status, emDia: false, assinaturaStatus, pagamentoStatus: null }
  }
  return null
}
