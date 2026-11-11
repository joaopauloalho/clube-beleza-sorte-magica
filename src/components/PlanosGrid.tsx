import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { CTA_PLANO, LINHA_SORTEIO } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import type { PlanoPublico } from '@/lib/planos-publicos'
import { ofertaDoPlano } from '@/lib/procedimentos'
import { CYCLE_MONTHS } from '@/lib/plans'

const reaisGrandes = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const FUNDO = {
  essencial: 'bg-white text-[#1d1d1f]',
  radiante: 'bg-[#fdf2f6] text-[#1d1d1f]',
  suprema: 'bg-black text-white',
} as const

const FASES = [
  { nome: 'Essencial', fundo: '#ffffff', tinta: '#1d1d1f', rotulo: '#841f41' },
  { nome: 'Radiante', fundo: '#fdf2f6', tinta: '#1d1d1f', rotulo: '#841f41' },
  { nome: 'Suprema', fundo: '#000000', tinta: '#ffffff', rotulo: '#f3d0dc' },
] as const

const TROCA = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }
const PAUSA_MS = 2800

function CartaoEssencial({
  plano,
  selecionado,
  onEscolher,
}: {
  plano: PlanoPublico
  selecionado?: string
  onEscolher: (plano: PlanoPublico) => void
}) {
  const reduzir = useReducedMotion()
  const animar = reduzir === false
  const [fase, setFase] = useState(0)
  const atual = animar ? FASES[fase] : FASES[0]
  const oferta = ofertaDoPlano(plano)
  const corTexto = { duration: 0.3, delay: atual.nome === 'Suprema' ? 0.28 : 0, ease: TROCA.ease }

  useEffect(() => {
    if (!animar) return
    const id = window.setInterval(() => setFase((valor) => (valor + 1) % FASES.length), PAUSA_MS)
    return () => window.clearInterval(id)
  }, [animar])

  return (
    <motion.article
      data-plano="essencial"
      data-fase={atual.nome}
      initial={false}
      animate={{ backgroundColor: atual.fundo, color: atual.tinta }}
      transition={{ backgroundColor: TROCA, color: corTexto }}
      className={`flex min-h-[240px] min-w-0 flex-col justify-between overflow-hidden rounded-[28px] bg-white p-2.5 text-[#1d1d1f] sm:p-6 ${selecionado === plano.slug ? 'ring-2 ring-[#a52751]' : ''}`}
    >
      <div className="min-w-0">
        <h3 className="text-[16px] leading-none sm:text-[28px]">
          <span className="sr-only">Essencial</span>
          <span className="relative block h-[1.2em] overflow-hidden" aria-hidden="true">
            <AnimatePresence initial={false}>
              <motion.span
                key={atual.nome}
                className="absolute left-0 top-0 whitespace-nowrap"
                initial={animar ? { opacity: 0, y: 6, filter: 'blur(4px)' } : false}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
                transition={TROCA}
              >
                {atual.nome}
              </motion.span>
            </AnimatePresence>
          </span>
        </h3>
        <motion.p className="mt-4 text-[12px]" animate={{ color: atual.rotulo }} transition={corTexto}>Você paga</motion.p>
        <p className="mt-1 text-[14px] font-medium tabular-nums leading-tight sm:text-[20px]">
          {formatarReais(oferta.pagaMes)}
          <span className="mt-0.5 block text-[11px] font-normal opacity-70 sm:text-[14px]">/mês</span>
        </p>
        <p className="mt-1 break-words text-[11px] tabular-nums leading-snug opacity-70 sm:text-[13px]">
          × {CYCLE_MONTHS} = {formatarReais(oferta.pagaAno)} no ano
        </p>
        <div className="mt-4 border-t border-current/15 pt-4">
          <motion.p className="text-[12px]" animate={{ color: atual.rotulo }} transition={corTexto}>Você recebe</motion.p>
          <p className="mt-1 text-[18px] font-medium tabular-nums leading-none tracking-tight sm:text-[36px]">{reaisGrandes.format(oferta.recebe)}</p>
          {oferta.linhas.map((linhaRecebe) => (
            <p key={linhaRecebe} className="mt-2 break-words text-[12px] leading-snug opacity-70 sm:text-[14px]">{linhaRecebe}</p>
          ))}
          <p className="mt-2 break-words text-[12px] leading-snug opacity-70 sm:text-[14px]">
            {Math.round(oferta.desconto * 100)}% de desconto em todos os procedimentos
          </p>
        </div>
      </div>
      <Button className="mt-4 h-auto min-h-11 w-full whitespace-normal px-1 py-2 text-[12px] leading-tight sm:text-sm" onClick={() => onEscolher(plano)}>
        {CTA_PLANO}
      </Button>
    </motion.article>
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
  const reduzir = useReducedMotion()

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-5">
      {planos.map((plano, indice) => {
        if (plano.slug === 'essencial') {
          return <CartaoEssencial key={plano.slug} plano={plano} selecionado={selecionado} onEscolher={onEscolher} />
        }
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
