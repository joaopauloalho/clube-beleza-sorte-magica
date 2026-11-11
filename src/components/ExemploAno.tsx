import { motion, useReducedMotion } from 'motion/react'
import { formatarReais } from '@/lib/format'
import { exemploAnoSuprema } from '@/lib/procedimentos'

const inteiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function ExemploAno() {
  const reduzir = useReducedMotion()
  const ano = exemploAnoSuprema()
  const eventos: Record<number, { curto: string; completo: string }> = {
    1: { curto: 'Micro grátis', completo: `${ano.micro.nome} grátis` },
    2: { curto: ano.peeling.nome, completo: ano.peeling.nome },
    3: { curto: 'Sorteada', completo: 'Sorteada' },
    6: { curto: 'Limpeza', completo: ano.limpeza.nome },
    12: { curto: 'Bio', completo: ano.bio.nome },
  }

  return (
    <div>
      <ol aria-label="Doze meses no plano Suprema" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {Array.from({ length: 12 }, (_, indice) => {
          const mes = indice + 1
          const evento = eventos[mes]
          const sorteio = mes === 3
          return (
            <motion.li
              key={mes}
              initial={reduzir === false ? { opacity: 0.2, y: 8 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={reduzir === false ? { duration: 0.55, delay: indice * 0.08, ease: [0.28, 0.11, 0.32, 1] } : { duration: 0 }}
              className={`flex min-h-16 min-w-0 flex-col justify-between rounded-2xl p-2.5 ${sorteio ? 'bg-[#a52751] text-white' : evento ? 'bg-[#fdf2f6] text-[#1d1d1f]' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}
              aria-label={evento ? `Mês ${mes}: ${evento.completo}` : `Mês ${mes}`}
            >
              <p className="text-[13px] font-medium tabular-nums leading-none">{mes}</p>
              {evento && (
                <p className="mt-2 text-[12px] leading-tight">
                  <span className="sm:hidden">{evento.curto}</span>
                  <span className="hidden sm:inline">{evento.completo}</span>
                </p>
              )}
            </motion.li>
          )
        })}
      </ol>
      <p className="mt-4 text-[13px] leading-snug text-[#6e6e73]">
        Mês 1, {ano.micro.nome} grátis. Mês 2, {ano.peeling.nome}. Mês 3, sorteada: {formatarReais(ano.credito)} de crédito em {ano.botox.nome} ({formatarReais(ano.botox.suprema)}) e {ano.preenchimento.nome} ({formatarReais(ano.preenchimento.suprema)}). Ela completa {formatarReais(ano.completa)}. Mês 6, {ano.limpeza.nome}. Mês 12, {ano.bio.nome}.
      </p>
      <p className="mt-3 text-[15px] tabular-nums leading-snug">
        Investiu {inteiro.format(ano.investiu)} · Recebeu {inteiro.format(ano.recebeu)} em procedimentos · Economizou {inteiro.format(ano.economizou)}
      </p>
      <p className="mt-2 text-[12px] leading-snug text-[#6e6e73]">Exemplo ilustrativo. O mês do sorteio varia.</p>
    </div>
  )
}
