import { CYCLE_MONTHS } from '@/lib/plans'

export function Parcelas({ quantidade = CYCLE_MONTHS, invertido = false }: { quantidade?: number; invertido?: boolean }) {
  return (
    <div className="grid grid-cols-12 gap-px sm:gap-1" aria-label={`${quantidade} parcelas`} role="img">
      {Array.from({ length: quantidade }, (_, indice) => (
        <span
          key={indice}
          className={`h-2.5 rounded-[3px] ${
            invertido
              ? indice === 0 ? 'bg-white' : 'bg-white/25'
              : indice === 0 ? 'bg-[#a52751]' : 'bg-[#f3d0dc]'
          }`}
        />
      ))}
    </div>
  )
}
