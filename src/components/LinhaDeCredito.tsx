import { formatarPercentual } from '@/lib/chance'
import { formatarReais } from '@/lib/format'

export function LinhaDeCredito({
  valor,
  chance,
  detalhe,
}: {
  valor: number
  chance: number
  detalhe: string
}) {
  return (
    <p className="text-sm leading-relaxed">
      <span className="font-semibold text-foreground">{formatarReais(valor)}</span>
      {' '}em serviços da clínica. Chance: {formatarPercentual(chance)}. {detalhe}
    </p>
  )
}
