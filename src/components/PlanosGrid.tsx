import { Button } from '@/components/ui/button'
import { CTA_PLANO, LINHA_SORTEIO } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import type { PlanoPublico } from '@/lib/planos-publicos'
import { ofertaDoPlano } from '@/lib/procedimentos'

const inteiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const FUNDO = {
  essencial: 'bg-white text-[#1d1d1f]',
  radiante: 'bg-[#fdf2f6] text-[#1d1d1f]',
  suprema: 'bg-black text-white',
} as const

export function CartaoPlano({
  plano,
  selecionado,
  onEscolher,
}: {
  plano: PlanoPublico
  selecionado?: string
  onEscolher: (plano: PlanoPublico) => void
}) {
  const oferta = ofertaDoPlano(plano)
  const escuro = plano.slug === 'suprema'
  const mudo = escuro ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'
  const rotulo = escuro ? 'text-[#f3d0dc]' : 'text-[#841f41]'
  return (
    <article
      className={`flex min-h-[240px] min-w-0 flex-col justify-between overflow-hidden rounded-[28px] p-3 sm:p-6 ${FUNDO[plano.slug]} ${selecionado === plano.slug ? 'ring-2 ring-[#a52751]' : ''}`}
    >
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-balance text-[18px] leading-tight sm:text-[28px]">{plano.nomeCurto}</h3>
          <span className="inline-flex max-w-full rounded-full bg-[#a52751] px-2 py-0.5 text-center text-[10px] font-medium leading-tight text-white sm:text-[12px]">
            +{inteiro.format(oferta.ganhoTabela + oferta.bonus)} em bônus
          </span>
        </div>
        <p className={`mt-4 text-[12px] ${rotulo}`}>Você paga</p>
        <p className="mt-1 text-[22px] font-medium tabular-nums leading-none sm:text-[36px]">
          {formatarReais(oferta.pagaMes)}
          <span className={`mt-1 block text-[12px] font-normal sm:text-[15px] ${mudo}`}>/mês</span>
        </p>
        <div className={`mt-4 border-t pt-4 ${escuro ? 'border-white/15' : 'border-[#1d1d1f]/10'}`}>
          <p className={`text-[12px] ${rotulo}`}>Você recebe</p>
          <p className="mt-1 text-[26px] font-medium tabular-nums leading-none sm:text-[40px]">{inteiro.format(oferta.soma)}</p>
          {oferta.quase && <p className={`mt-1 text-[13px] ${mudo}`}>{oferta.quase}</p>}
          <p className="mt-3">
            <span className="inline-flex max-w-full rounded-full bg-[#a52751] px-2 py-0.5 text-center text-[10px] font-medium leading-tight text-white sm:text-[11px]">
              Ganhe ao assinar
            </span>
          </p>
          <p className="mt-2 break-words text-[13px] leading-snug sm:text-[15px]">
            {oferta.ganhoNome} · {formatarReais(oferta.ganhoTabela)}
          </p>
          <p className={`mt-1 text-[11px] leading-snug ${mudo}`}>Assinou, já pode usar.</p>
          <p className={`mt-3 text-[12px] ${rotulo}`}>Crédito no seu sorteio</p>
          <p className="mt-1 text-[15px] font-medium tabular-nums sm:text-[20px]">{formatarReais(oferta.credito)}</p>
          <p className={`mt-3 break-words text-[12px] leading-snug sm:text-[14px] ${mudo}`}>
            {Math.round(oferta.desconto * 100)}% de desconto em todos os procedimentos
          </p>
        </div>
      </div>
      <Button className="mt-4 h-auto min-h-11 w-full whitespace-normal px-1 py-2 text-[12px] leading-tight sm:text-sm" onClick={() => onEscolher(plano)}>
        {CTA_PLANO}
      </Button>
    </article>
  )
}

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
      {planos.map((plano) => (
        <CartaoPlano key={plano.slug} plano={plano} selecionado={selecionado} onEscolher={onEscolher} />
      ))}
      <p className="col-span-3 text-center text-[14px] text-[#6e6e73]">{LINHA_SORTEIO}</p>
    </div>
  )
}
