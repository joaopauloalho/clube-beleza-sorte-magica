const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Lê um valor em reais digitado no padrão brasileiro (1.700,50) ou com ponto decimal (1700.50). */
export function centavosDeTexto(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, '')
  if (!limpo) return null
  let normalizado = limpo
  if (limpo.includes(',')) normalizado = limpo.replace(/\./g, '').replace(',', '.')
  else if (/^\d+\.\d{1,2}$/.test(limpo)) normalizado = limpo
  else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) normalizado = limpo.replace(/\./g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null
  const centavos = Math.round(Number(normalizado) * 100)
  if (!Number.isInteger(centavos) || centavos <= 0) return null
  return centavos
}

export function formatarReais(valor: number): string {
  return moeda.format(valor)
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—'
  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (soData) return `${soData[3]}/${soData[2]}/${soData[1]}`
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return '—'
  return data.toLocaleDateString('pt-BR')
}
