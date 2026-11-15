import { useId, useState } from 'react'
import { estadoDoMes, MESES_DO_CICLO } from '@/lib/calendarioSorteio'
import { LINHA_SORTEIO } from '@/lib/copy'
import { GROUP_SIZE } from '@/lib/plans'

const PASSO = 44
const COLUNAS = 6
const LINHAS = GROUP_SIZE / COLUNAS

const CORES = {
  espera: 'rgba(247, 242, 239, 0.3)',
  antes: '#E58DA8',
  mes: '#FFFFFF',
} as const

function percentual(fracao: number): string {
  return `${Math.round(fracao * 100)}%`
}

/**
 * O grupo de 24 como 24 pontos, mês a mês. Mostra quantas pessoas são sorteadas e a chance real de
 * quem ainda concorre, a partir do calendário publicado (calendarioSorteio.ts).
 */
export function GrupoVivo({ className = '' }: { className?: string }) {
  const [mes, setMes] = useState(1)
  const idMes = useId()
  const { antes, noMes, concorrem, chance } = estadoDoMes(mes)
  const fechado = noMes === 0

  const resumo = fechado
    ? `Mês ${mes} do grupo: as ${GROUP_SIZE} integrantes em dia já foram sorteadas, sem sorteio neste mês.`
    : `Mês ${mes} do grupo: ${antes} já sorteadas, ${noMes} sorteadas neste mês e ${concorrem} concorrendo. Chance de ${percentual(chance)} para quem está em dia.`

  return (
    <article className={`rounded-[28px] bg-[#2A1420] p-6 text-white md:p-8 ${className}`} aria-label="Grupo de 24 pessoas, mês a mês">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <svg viewBox={`0 0 ${COLUNAS * PASSO} ${LINHAS * PASSO}`} role="img" aria-label={resumo} className="block w-full max-w-[340px]">
            {Array.from({ length: GROUP_SIZE }, (_, i) => {
              const estado = i < antes ? 'antes' : i < antes + noMes ? 'mes' : 'espera'
              return (
                <circle
                  key={i}
                  cx={(i % COLUNAS) * PASSO + PASSO / 2}
                  cy={Math.floor(i / COLUNAS) * PASSO + PASSO / 2}
                  r={estado === 'mes' ? 13 : 9}
                  fill={CORES[estado]}
                  style={{ transition: 'r 300ms ease-out, fill 300ms ease-out' }}
                />
              )
            })}
          </svg>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#C9B8C0]">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: CORES.espera }} aria-hidden="true" />ainda concorrem</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: CORES.antes }} aria-hidden="true" />já sorteadas</li>
            <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full" style={{ background: CORES.mes }} aria-hidden="true" />sorteadas no mês</li>
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <div aria-live="polite" className="min-h-[148px]">
            {fechado ? (
              <>
                <h3 className="text-balance text-[32px] leading-[1.05] md:text-[40px]">No mês {mes}, o ciclo fecha.</h3>
                <p className="mt-3 text-[16px] leading-snug text-[#C9B8C0]">
                  Não há sorteio neste mês: as integrantes em dia já foram sorteadas até o mês {mes - 1}.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-balance text-[32px] leading-[1.05] md:text-[40px]">
                  No mês {mes}, {noMes} {noMes === 1 ? 'sorteada' : 'sorteadas'}.
                </h3>
                <p className="mt-3 text-[16px] leading-snug text-[#F7F2EF]">
                  Entre as {concorrem} que ainda concorrem, a chance de quem está em dia é de {percentual(chance)}.
                </p>
                {antes > 0 && <p className="mt-1 text-[14px] leading-snug text-[#C9B8C0]">{antes} já foram sorteadas nos meses anteriores.</p>}
              </>
            )}
          </div>

          <div>
            <label htmlFor={idMes} className="flex items-baseline justify-between gap-3 text-[14px] font-medium text-[#F7F2EF]">
              <span>Mês do grupo</span>
              <span className="tabular-nums text-[#C9B8C0]">{mes} de {MESES_DO_CICLO}</span>
            </label>
            <input
              id={idMes}
              type="range"
              min={1}
              max={MESES_DO_CICLO}
              step={1}
              value={mes}
              onChange={(evento) => setMes(Number(evento.target.value))}
              aria-valuetext={`Mês ${mes} de ${MESES_DO_CICLO}`}
              className="mt-3 h-11 w-full cursor-pointer accent-[#E58DA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            />
          </div>

          <p className="text-[13px] leading-snug text-[#C9B8C0]">{LINHA_SORTEIO}</p>
        </div>
      </div>
    </article>
  )
}
