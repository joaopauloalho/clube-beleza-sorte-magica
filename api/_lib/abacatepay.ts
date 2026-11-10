import { corpoAssinaturaPix, corpoCliente, corpoProdutoMensal, type AssinaturaPixInput, type ProdutoAssinaturaInput } from './cobranca'

export const ABACATEPAY_BASE_URL = 'https://api.abacatepay.com/v2'

export class AbacatePayError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AbacatePayError'
  }
}

export class ForaDoModoTesteError extends AbacatePayError {
  constructor() {
    super('A AbacatePay respondeu fora do modo de teste (devMode). A chamada foi recusada.')
    this.name = 'ForaDoModoTesteError'
  }
}

type FetchLike = typeof fetch

export function exigirChave(env: NodeJS.ProcessEnv = process.env): string {
  const chave = env.ABACATEPAY_API_KEY?.trim()
  if (!chave) throw new AbacatePayError('ABACATEPAY_API_KEY ausente.')
  return chave
}

export function lerDevMode(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false
  const registro = payload as Record<string, unknown>
  if (registro.devMode === true) return true
  const data = registro.data
  if (data && typeof data === 'object' && (data as Record<string, unknown>).devMode === true) return true
  return false
}

export function exigirDevMode(payload: unknown): void {
  if (!lerDevMode(payload)) throw new ForaDoModoTesteError()
}

export interface CheckoutCriado {
  id: string
  url: string
  devMode: true
  brCode: string | null
  brCodeBase64: string | null
}

export function lerCheckout(payload: unknown): CheckoutCriado {
  exigirDevMode(payload)
  const data = (payload as { data?: Record<string, unknown> }).data ?? (payload as Record<string, unknown>)
  const id = String(data.id ?? data.checkoutId ?? '')
  const url = String(data.url ?? '')
  if (!id || !url) throw new AbacatePayError('A resposta da assinatura não trouxe id e url do checkout.')
  const brCode = typeof data.brCode === 'string' ? data.brCode : null
  const brCodeBase64 = typeof data.brCodeBase64 === 'string' ? data.brCodeBase64 : null
  return { id, url, devMode: true, brCode, brCodeBase64 }
}

export function lerId(payload: unknown): string {
  exigirDevMode(payload)
  const data = (payload as { data?: Record<string, unknown> }).data ?? (payload as Record<string, unknown>)
  const id = String(data.id ?? '')
  if (!id) throw new AbacatePayError('A resposta não trouxe id.')
  return id
}

export function criarClienteAbacate(opcoes: {
  fetchImpl?: FetchLike
  apiKey?: string
  env?: NodeJS.ProcessEnv
} = {}) {
  const fetchImpl = opcoes.fetchImpl ?? fetch
  const apiKey = opcoes.apiKey ?? exigirChave(opcoes.env)

  async function post(caminho: string, body?: unknown): Promise<unknown> {
    const resposta = await fetchImpl(`${ABACATEPAY_BASE_URL}${caminho}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const json = await resposta.json().catch(() => null)
    if (!resposta.ok || (json && typeof json === 'object' && (json as { success?: boolean }).success === false)) {
      const erro = json && typeof json === 'object' ? (json as { error?: unknown }).error : null
      throw new AbacatePayError(typeof erro === 'string' ? erro : `AbacatePay respondeu ${resposta.status} em ${caminho}.`)
    }
    exigirDevMode(json)
    return json
  }

  return {
    criarProduto(input: ProdutoAssinaturaInput) {
      return post('/products/create', corpoProdutoMensal(input)).then(lerId)
    },
    criarCliente(input: { nome: string; email: string; cpf: string; celular: string }) {
      return post('/customers/create', corpoCliente(input)).then(lerId)
    },
    criarAssinaturaPix(input: AssinaturaPixInput) {
      return post('/subscriptions/create', corpoAssinaturaPix(input)).then(lerCheckout)
    },
    /** Só funciona para QR de checkout transparente em devMode. Não autoriza Pix Automático. */
    simularPagamentoTransparente(id: string) {
      return post(`/transparents/simulate-payment?id=${encodeURIComponent(id)}`)
    },
  }
}
