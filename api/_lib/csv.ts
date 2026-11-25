/** Célula de CSV para Excel/Sheets em português: separador ; e texto que não vira fórmula. */
export function celulaCsv(valor: string): string {
  let texto = valor ?? ''
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  if (/[;"\r\n]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`
  return texto
}

/** UTF-8 com BOM, separador ; e quebra CRLF, para abrir no Excel em português. */
export function planilha(linhas: readonly (readonly string[])[]): string {
  const corpo = linhas.map((linha) => linha.map((valor) => celulaCsv(valor)).join(';')).join('\r\n')
  return `\uFEFF${corpo}\r\n`
}

export function centavosParaPlanilha(centavos: number): string {
  const sinal = centavos < 0 ? '-' : ''
  const absoluto = Math.abs(centavos)
  const reais = Math.floor(absoluto / 100)
  const cents = String(absoluto % 100).padStart(2, '0')
  return `${sinal}${reais},${cents}`
}

export function dataParaPlanilha(iso: string | null | undefined): string {
  if (!iso) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [ano, mes, dia] = iso.split('-')
    return `${dia}/${mes}/${ano}`
  }
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data)
}
