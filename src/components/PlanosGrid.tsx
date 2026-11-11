import { Button } from '@/components/ui/button'
import { Parcelas } from '@/components/Parcelas'
import { CTA_PLANO, LINHA_SORTEIO } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import type { PlanoPublico } from '@/lib/planos-publicos'
import { bonusEmServicos, CYCLE_MONTHS, frasePorDia } from '@/lib/plans'

export function PlanosGrid({
  planos,
  selecionado,
  onEscolher,
}: {
  planos: readonly PlanoPublico[]
  selecionado?: string
  onEscolher: (plano: PlanoPublico) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-5">
      {planos.map((plano) => {
        const destaque = plano.destaque || selecionado === plano.slug
        return (
          <article
            key={plano.slug}
            className={`flex min-h-[240px] min-w-0 flex-col justify-between overflow-hidden rounded-[28px] p-3 sm:p-6 ${
              destaque ? 'bg-black text-white' : 'bg-white text-[#1d1d1f]'
            }`}
          >
            <div className="min-w-0">
              <p className={`text-[12px] ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                {plano.destaque ? 'Destaque' : `${CYCLE_MONTHS} meses`}
              </p>
              <h3 className="mt-2 text-balance text-[16px] font-semibold leading-tight tracking-tight sm:text-[28px]">{plano.nomeCurto}</h3>
              {destaque && (
                <p className="mt-3 text-[14px] font-medium leading-tight text-white sm:text-[22px]">
                  +{formatarReais(bonusEmServicos(plano.credito, plano.total12))} em serviços
                </p>
              )}
              <p className="mt-3 text-[16px] font-semibold tabular-nums leading-none tracking-tight sm:text-[36px]">
                {formatarReais(plano.mensalidade)}
                <span className={`mt-1 block text-[11px] font-normal sm:text-[17px] ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>/mês</span>
              </p>
              <p className={`mt-1 text-[11px] leading-tight sm:text-[13px] ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                {frasePorDia(plano.mensalidade)}
              </p>
              <div className="mt-3">
                <Parcelas invertido={destaque} />
                <p className={`mt-1 text-[12px] tabular-nums ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                  {CYCLE_MONTHS}× · {formatarReais(plano.total12)}
                </p>
              </div>
              <p className={`mt-3 text-[13px] leading-snug sm:text-[15px] ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                Crédito {formatarReais(plano.credito)}
              </p>
              {!destaque && (
                <p className="text-[12px] font-medium leading-snug text-[#a52751] sm:text-[15px]">
                  +{formatarReais(bonusEmServicos(plano.credito, plano.total12))} em serviços
                </p>
              )}
              <p className={`text-[13px] leading-snug sm:text-[15px] ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                Desconto {Math.round(plano.desconto * 100)}%
              </p>
            </div>
            <Button className="mt-4 h-auto min-h-11 w-full whitespace-normal px-1 py-2 text-[12px] leading-tight sm:text-sm" onClick={() => onEscolher(plano)}>
              {CTA_PLANO}
            </Button>
          </article>
        )
      })}
      <p className="col-span-3 text-center text-[14px] text-[#6e6e73]">{LINHA_SORTEIO}</p>
    </div>
  )
}
