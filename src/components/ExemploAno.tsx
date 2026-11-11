import { motion, useReducedMotion } from 'motion/react'
import { formatarReais } from '@/lib/format'
import { exemploAnoSuprema } from '@/lib/procedimentos'

const inteiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function ExemploAno() {
  const reduzir = useReducedMotion()
  const ano = exemploAnoSuprema()
  const eventos: Record<number, { texto: string; sorteio?: boolean }> = {
    1: { texto: `Assinou e ganhou um ${ano.micro.nome} (${formatarReais(ano.micro.tabela)}), na hora.` },
    3: {
      sorteio: true,
      texto: `Exemplo de sorteio. Sorteada, com ${formatarReais(ano.credito)} em crédito. Usou em ${ano.botox.nome} (${formatarReais(ano.botox.suprema)}) e ${ano.skin.nome} (${formatarReais(ano.skin.suprema)}). Sobra ${formatarReais(ano.restante)} para depois.`,
    },
    4: { texto: `${ano.limpeza.nome}, ${formatarReais(ano.limpeza.suprema)}, pago por ela.` },
    7: { texto: `${ano.limpeza.nome} de novo, ${formatarReais(ano.limpeza.suprema)}, pago por ela.` },
  }

  return (
    <div>
      <ol className="space-y-2">
        {Array.from({ length: 12 }, (_, indice) => {
          const mes = indice + 1
          const evento = eventos[mes]
          return (
            <motion.li
              key={mes}
              initial={reduzir ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={reduzir ? { duration: 0 } : { duration: 0.45, delay: indice * 0.03, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-w-0 gap-3"
            >
              <span
                className={`mt-1.5 shrink-0 rounded-full ${
                  evento?.sorteio
                    ? 'h-3.5 w-3.5 bg-[#a52751] ring-2 ring-[#f3d0dc]'
                    : evento
                      ? 'h-2.5 w-2.5 bg-[#a52751]'
                      : 'h-2.5 w-2.5 bg-[#1d1d1f]/15'
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[14px] leading-snug sm:text-[15px]">
                  <span className="font-medium">Mês {mes}</span>
                  <span className="tabular-nums text-[#6e6e73]"> · {formatarReais(ano.mensalidade)}</span>
                </p>
                {evento && <p className="mt-0.5 text-[13px] leading-snug text-[#6e6e73] sm:text-[14px]">{evento.texto}</p>}
              </div>
            </motion.li>
          )
        })}
      </ol>
      <p className="mt-8 text-[15px] leading-snug sm:text-[17px]">
        Investiu {inteiro.format(ano.investiu)} · Recebeu {inteiro.format(ano.recebeu)} em procedimentos (valor de tabela) · Economizou {inteiro.format(ano.economizou)}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-[#6e6e73]">
        Recebeu soma a tabela. Economizou é essa soma menos os {inteiro.format(ano.investiu)} das mensalidades e os {inteiro.format(ano.aParte)} das duas limpezas, pagas por ela.
      </p>
      <p className="mt-3 text-[13px] leading-snug text-[#6e6e73]">
        Exemplo ilustrativo. O mês do sorteio varia; o crédito é pago no sorteio, conforme o regulamento.
      </p>
      <p className="mt-2 text-[13px] leading-snug text-[#6e6e73]">A mensalidade, quando o grupo fecha, segue por Pix Automático.</p>
    </div>
  )
}
