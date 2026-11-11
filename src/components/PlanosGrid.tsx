import { Button } from '@/components/ui/button'
import { CTA_PLANO, LINHA_SORTEIO } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import { PLANS, type Plan } from '@/lib/plans'

export function PlanosGrid({
  selecionado,
  onEscolher,
}: {
  selecionado?: string
  onEscolher: (plano: Plan) => void
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {PLANS.map((plano) => {
        const destaque = plano.destaque || selecionado === plano.slug
        return (
          <article
            key={plano.slug}
            className={`flex min-h-[280px] flex-col justify-between rounded-[28px] p-6 md:p-8 ${
              destaque ? 'bg-black text-white' : 'bg-white text-[#1d1d1f]'
            }`}
          >
            <div>
              <p className={`text-[12px] ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                {plano.destaque ? 'Destaque' : '12 meses'}
              </p>
              <h3 className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-tight">{plano.nome.replace('Beleza ', '')}</h3>
              <p className="mt-4 text-[40px] font-semibold leading-none tracking-tight">
                {formatarReais(plano.mensalidade)}
                <span className={`text-[17px] font-normal ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>/mês</span>
              </p>
              <p className={`mt-4 text-[17px] leading-snug ${destaque ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>
                Imagine pagar {formatarReais(plano.mensalidade)} e poder ser sorteada com {formatarReais(plano.credito)}.
              </p>
            </div>
            <Button className="mt-8 w-full" onClick={() => onEscolher(plano)}>
              {CTA_PLANO}
            </Button>
          </article>
        )
      })}
      <p className="text-center text-[14px] text-[#6e6e73] md:col-span-3">{LINHA_SORTEIO}</p>
    </div>
  )
}
