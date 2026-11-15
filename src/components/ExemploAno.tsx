import { motion, useReducedMotion } from 'motion/react'
import { exemploAnoSuprema } from '@/lib/procedimentos'

const inteiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function ExemploAno() {
  const reduzir = useReducedMotion()
  const ano = exemploAnoSuprema()
  const eventos: Record<number, { curto: string; completo: string }> = {
    1: { curto: 'Micro grátis', completo: `${ano.micro.nome} grátis` },
    3: { curto: 'Sorteada', completo: 'Sorteada' },
    5: { curto: ano.peeling.nome, completo: ano.peeling.nome },
    9: { curto: 'Limpeza', completo: ano.limpeza.nome },
    12: { curto: 'Bio', completo: ano.bio.nome },
  }
  const rotulos = [
    `Mês 1 · ${ano.micro.nome} grátis`,
    `Mês 3 · Sorteada · ${ano.botox.nome} + ${ano.preenchimento.nome} · +${inteiro.format(ano.completa)}`,
    `Mês 5 · ${ano.peeling.nome}`,
    `Mês 9 · ${ano.limpeza.nome}`,
    `Mês 12 · ${ano.bio.nome}`,
  ]
  const totais = [
    { rotulo: 'Investiu', valor: ano.investiu, destaque: false },
    { rotulo: 'Recebeu em procedimentos', valor: ano.recebeu, destaque: false },
    { rotulo: 'Economizou', valor: ano.economizou, destaque: true },
  ]

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
              className={`flex min-h-16 min-w-0 flex-col justify-between rounded-2xl p-2.5 ${sorteio ? 'bg-[#a52751] text-white' : evento ? 'bg-[#F2C9D666] text-[#2A1420]' : 'border border-[#E4D9D3] bg-white text-[#2A1420]'}`}
              aria-label={evento ? `Mês ${mes}: ${evento.completo}` : `Mês ${mes}: mensalidade`}
            >
              <p className="text-[13px] font-medium tabular-nums leading-none">{mes}</p>
              <p className={`mt-2 text-[12px] leading-tight ${evento ? '' : 'text-[#6B5560]'}`}>
                {evento ? (
                  <>
                    <span className="sm:hidden">{evento.curto}</span>
                    <span className="hidden sm:inline">{evento.completo}</span>
                  </>
                ) : (
                  'Mensalidade'
                )}
              </p>
            </motion.li>
          )
        })}
      </ol>
      <ul className="mt-4 space-y-1 text-[13px] leading-snug text-[#6B5560]">
        {rotulos.map((rotulo) => (
          <li key={rotulo}>{rotulo}</li>
        ))}
      </ul>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        {totais.map((item) => (
          <div
            key={item.rotulo}
            className={`rounded-2xl p-3 sm:p-4 ${item.destaque ? 'bg-[#a52751] text-white' : 'border border-[#E4D9D3] bg-white text-[#2A1420]'}`}
          >
            <dd className="text-[22px] font-medium tabular-nums leading-none sm:text-[32px]">{inteiro.format(item.valor)}</dd>
            <dt className={`mt-2 text-[11px] leading-tight sm:text-[13px] ${item.destaque ? 'text-white' : 'text-[#6B5560]'}`}>{item.rotulo}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[12px] leading-snug text-[#6B5560]">Exemplo ilustrativo. O mês do sorteio varia.</p>
    </div>
  )
}
