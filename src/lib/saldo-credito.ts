export interface UsoParaSaldo {
  credito_id?: string
  valor_centavos: number
  status: string
}

/** Saldo = concedido menos usos ativos. Estorno não entra na conta. */
export function saldoDoCredito(
  concedidoCentavos: number,
  usos: readonly UsoParaSaldo[],
  creditoId?: string,
): number {
  const usado = usos.reduce((soma, uso) => {
    if (uso.status !== 'ativo') return soma
    if (creditoId && uso.credito_id && uso.credito_id !== creditoId) return soma
    return soma + uso.valor_centavos
  }, 0)
  return concedidoCentavos - usado
}

export function divideCredito(slug: string | null | undefined, nome: string | null | undefined): boolean {
  if (slug) return slug === 'suprema'
  return (nome ?? '').toLowerCase().includes('suprema')
}
