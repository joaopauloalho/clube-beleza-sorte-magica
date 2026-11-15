import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { formatarReais } from '@/lib/format'
import type { PlanoPublico } from '@/lib/planos-publicos'
import { frasePorDia, type PlanSlug } from '@/lib/plans'

const ORDEM: PlanSlug[] = ['essencial', 'radiante', 'suprema']
const TOM = {
  essencial: { fundo: '#ffffff', tinta: '#2A1420', nome: '#6E1736' },
  radiante: { fundo: '#F2C9D666', tinta: '#2A1420', nome: '#6E1736' },
  suprema: { fundo: '#2A1420', tinta: '#ffffff', nome: '#F2C9D6' },
} as const
const PAUSA_MS = 2800
const TROCA = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }

export function CarrosselEntrada({ planos }: { planos: readonly PlanoPublico[] }) {
  const reduzir = useReducedMotion()
  const animar = reduzir === false
  const base = ORDEM.map((slug) => planos.find((plano) => plano.slug === slug)).filter((plano): plano is PlanoPublico => Boolean(plano))
  const faixa = base.length > 0 ? [...base, base[0]] : []
  const [indice, setIndice] = useState(0)
  const [salto, setSalto] = useState(false)
  const [pausa, setPausa] = useState(false)
  const passo = faixa.length > 1 ? 100 / faixa.length : 100

  useEffect(() => {
    if (!animar || pausa || faixa.length < 2) return
    const id = window.setInterval(() => {
      setSalto(false)
      setIndice((valor) => valor + 1)
    }, PAUSA_MS)
    return () => window.clearInterval(id)
  }, [animar, pausa, faixa.length])

  useEffect(() => {
    if (!animar || indice < faixa.length - 1) return
    const id = window.setTimeout(() => {
      setSalto(true)
      setIndice(0)
    }, TROCA.duration * 1000)
    return () => window.clearTimeout(id)
  }, [animar, indice, faixa.length])

  if (base.length === 0) return null
  const visivel = base[Math.min(indice, base.length - 1)]

  if (!animar) {
    const plano = base[0]
    const tom = TOM[plano.slug]
    return (
      <article className="flex h-full flex-col justify-center rounded-[28px] p-6 md:col-span-5 md:p-8" style={{ backgroundColor: tom.fundo, color: tom.tinta }}>
        <p className="text-[15px] font-medium" style={{ color: tom.nome }}>{plano.nomeCurto}</p>
        <p className="mt-2 font-sans text-[clamp(40px,6vw,56px)] font-medium tabular-nums leading-none tracking-tight">
          {formatarReais(plano.mensalidade)}
          <span className="mt-1 block text-[15px] font-normal opacity-70">/mês</span>
        </p>
        <p className="mt-2 text-[15px] opacity-70">{frasePorDia(plano.mensalidade)}</p>
      </article>
    )
  }

  return (
    <article
      data-carrossel={visivel.nomeCurto}
      tabIndex={0}
      aria-roledescription="carrossel"
      aria-label="Essencial, Radiante e Suprema. O nome, o preço do mês, o preço do dia e o total do ano mudam juntos."
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPausa(false)
      }}
      className="h-full overflow-hidden rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E1736] md:col-span-5"
    >
      <p className="sr-only">
        {base.map((plano) => `${plano.nomeCurto}, ${formatarReais(plano.mensalidade)} por mês, ${frasePorDia(plano.mensalidade)}.`).join(' ')}
      </p>
      <div className="h-full overflow-hidden" aria-hidden="true">
        <motion.div
          className="flex h-full"
          style={{ width: `${faixa.length * 100}%` }}
          animate={{ x: `${-indice * passo}%` }}
          transition={salto ? { duration: 0 } : TROCA}
        >
          {faixa.map((plano, posicao) => {
            const tom = TOM[plano.slug]
            return (
              <div
                key={`${plano.slug}-${posicao}`}
                className="flex h-full shrink-0 flex-col justify-center p-6 md:p-8"
                style={{ width: `${passo}%`, backgroundColor: tom.fundo, color: tom.tinta }}
              >
                <p className="text-[15px] font-medium" style={{ color: tom.nome }}>{plano.nomeCurto}</p>
                <p className="mt-2 font-sans text-[clamp(40px,6vw,56px)] font-medium tabular-nums leading-none tracking-tight">
                  {formatarReais(plano.mensalidade)}
                  <span className="mt-1 block text-[15px] font-normal opacity-70">/mês</span>
                </p>
                <p className="mt-2 text-[15px] opacity-70">{frasePorDia(plano.mensalidade)}</p>
              </div>
            )
          })}
        </motion.div>
      </div>
    </article>
  )
}
