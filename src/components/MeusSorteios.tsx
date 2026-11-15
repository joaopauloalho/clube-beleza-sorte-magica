import { formatarData } from '@/lib/format'
import { chanceDoProximoSorteio, nomeDoMes } from '@/lib/operador-resumo'

export interface MesDoCalendario {
  mes: number
  data: string | null
  estado: 'feito' | 'proximo' | 'previsto' | 'sem_sorteio'
  sorteadas: number
  concorrem: number | null
  cotas_sorteadas: number[] | null
}

export interface CalendarioDaCliente {
  ok: boolean
  tamanho: number
  meses: MesDoCalendario[]
}

function rotuloDoMes(m: MesDoCalendario): string {
  if (!m.data) return `Mês ${m.mes}`
  return nomeDoMes(new Date(`${m.data}T12:00:00`).getMonth())
}

/** Só mostra contagens e números de cota. Nunca nome nem situação de outra pessoa. */
export function MeusSorteios({ calendario, minhaCota }: { calendario: CalendarioDaCliente; minhaCota: number | null }) {
  return (
    <ol className="space-y-2">
      {calendario.meses.map((m) => {
        const minha = minhaCota != null && (m.cotas_sorteadas ?? []).includes(minhaCota)
        return (
          <li key={m.mes} className={`rounded-2xl border p-4 ${m.estado === 'proximo' ? 'border-[#A52751] bg-[#F2C9D6]/30' : 'border-[#E4D9D3] bg-white'}`}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium capitalize">{rotuloDoMes(m)}</p>
              <p className="text-xs text-[#6B5560]">{m.data ? formatarData(m.data) : `mês ${m.mes}`}</p>
            </div>
            {m.estado === 'sem_sorteio' && <p className="text-[15px] text-[#6B5560]">Última mensalidade. Sem sorteio neste mês.</p>}
            {m.estado === 'previsto' && <p className="text-[15px]">{m.sorteadas} cota(s) previstas. A chance real é calculada no dia, com quem estiver em dia.</p>}
            {m.estado === 'proximo' && (
              <p className="text-[15px]">
                {m.sorteadas} cota(s) entre {m.concorrem ?? '—'} em dia agora
                {m.concorrem ? <> · chance real <strong>{chanceDoProximoSorteio(m.sorteadas, m.concorrem)}</strong></> : null}
              </p>
            )}
            {m.estado === 'feito' && (
              <p className="text-[15px]">
                Cotas sorteadas: {(m.cotas_sorteadas ?? []).map((c) => String(c).padStart(2, '0')).join(', ') || '—'}
                {minha && <strong className="ml-1 text-[#A52751]">Uma delas é a sua.</strong>}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
