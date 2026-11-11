import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { CTA_PLANO, LINHA_SORTEIO } from '@/lib/copy'
import { formatarReais } from '@/lib/format'

const reaisGrandes = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
import type { PlanoPublico } from '@/lib/planos-publicos'
import { ofertaDoPlano } from '@/lib/procedimentos'
import { CYCLE_MONTHS } from '@/lib/plans'

const FUNDO = {
  essencial: 'bg-white text-[#1d1d1f]',
  radiante: 'bg-[#fdf2f6] text-[#1d1d1f]',
  suprema: 'bg-black text-white',
} as const

export function PlanosGrid({
  planos,
  selecionado,
  onEscolher,
}: {
  planos: readonly PlanoPublico[]
  selecionado?: string
  onEscolher: (plano: PlanoPublico) => void
}) {
  const reduzir = useReducedMotion()

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-5">
      {planos.map((plano, indice) => {
        const oferta = ofertaDoPlano(plano)
        const escuro = plano.slug === 'suprema'
        const mudo = escuro ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'
        const linha = escuro ? 'border-white/15' : 'border-[#1d1d1f]/10'
        return (
          <motion.article
            key={plano.slug}
            initial={reduzir ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={reduzir ? { duration: 0 } : { duration: 0.7, delay: indice * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`flex min-h-[240px] min-w-0 flex-col justify-between overflow-hidden rounded-[28px] p-2.5 sm:p-6 ${FUNDO[plano.slug]} ${selecionado === plano.slug ? 'ring-2 ring-[#a52751]' : ''}`}
          >
            <div className="min-w-0">
              <h3 className="text-balance text-[16px] leading-tight sm:text-[28px]">{plano.nomeCurto}</h3>
              <p className={`mt-4 text-[12px] ${escuro ? 'text-[#f3d0dc]' : 'text-[#841f41]'}`}>Você paga</p>
              <p className="mt-1 text-[14px] font-medium tabular-nums leading-tight sm:text-[20px]">
                {formatarReais(oferta.pagaMes)}
                <span className={`mt-0.5 block text-[11px] font-normal sm:text-[14px] ${mudo}`}>/mês</span>
              </p>
              <p className={`mt-1 break-words text-[11px] tabular-nums leading-snug sm:text-[13px] ${mudo}`}>
                × {CYCLE_MONTHS} = {formatarReais(oferta.pagaAno)} no ano
              </p>
              <div className={`mt-4 border-t pt-4 ${linha}`}>
                <p className={`text-[12px] ${escuro ? 'text-[#f3d0dc]' : 'text-[#841f41]'}`}>Você recebe</p>
                <p className="mt-1 text-[18px] font-medium tabular-nums leading-none tracking-tight sm:text-[36px]">{reaisGrandes.format(oferta.recebe)}</p>
                {oferta.linhas.map((linhaRecebe) => (
                  <p key={linhaRecebe} className={`mt-2 break-words text-[12px] leading-snug sm:text-[14px] ${mudo}`}>{linhaRecebe}</p>
                ))}
                <p className={`mt-2 break-words text-[12px] leading-snug sm:text-[14px] ${mudo}`}>
                  {Math.round(oferta.desconto * 100)}% de desconto em todos os procedimentos
                </p>
              </div>
            </div>
            <Button className="mt-4 h-auto min-h-11 w-full whitespace-normal px-1 py-2 text-[12px] leading-tight sm:text-sm" onClick={() => onEscolher(plano)}>
              {CTA_PLANO}
            </Button>
          </motion.article>
        )
      })}
      <p className="col-span-3 text-center text-[14px] text-[#6e6e73]">{LINHA_SORTEIO}</p>
    </div>
  )
}
