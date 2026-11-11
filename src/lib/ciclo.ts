/** Dias do mês combinados com o João. Mude só aqui. */
export const DIA_PAGAMENTO = 5
export const DIA_SORTEIO = 10

export function fraseDoCiclo(): string {
  return `Pagou no dia ${DIA_PAGAMENTO}, no dia ${DIA_SORTEIO} já pode ser sorteada.`
}
