import { imaginePrimeiraMensalidade, LINHA_SORTEIO } from '@/lib/copy'

export function LinhaDeCredito({
  mensalidade,
  credito,
}: {
  mensalidade: number
  credito: number
}) {
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      <p>{imaginePrimeiraMensalidade(mensalidade, credito)}</p>
      <p className="text-muted-foreground">{LINHA_SORTEIO}</p>
    </div>
  )
}
