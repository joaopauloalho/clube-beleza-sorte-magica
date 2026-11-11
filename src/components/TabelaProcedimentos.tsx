import { formatarReais } from '@/lib/format'
import type { PlanoPublico } from '@/lib/planos-publicos'
import { fraseEconomia, precoNoPlano, procedimentosEmDestaque } from '@/lib/procedimentos'
import type { PlanSlug } from '@/lib/plans'

const COLUNAS: PlanSlug[] = ['essencial', 'radiante', 'suprema']

const TOM: Record<PlanSlug, string> = {
  essencial: 'bg-white',
  radiante: 'bg-[#fdf2f6]',
  suprema: 'bg-[#f6d5e0]',
}

export function TabelaProcedimentos({ planos }: { planos: readonly PlanoPublico[] }) {
  const itens = procedimentosEmDestaque()

  return (
    <div>
      <div tabIndex={0} aria-label="Preços, role para o lado para ver os planos" className="overflow-x-auto overscroll-x-contain rounded-[28px] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#841f41]">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left text-[15px]">
          <caption className="sr-only">Preço de tabela e preço de cada plano</caption>
          <thead>
            <tr className="text-[13px] text-[#6e6e73]">
              <th className="sticky left-0 z-10 w-[8.5rem] min-w-[8.5rem] bg-white px-3 py-4 font-medium shadow-[4px_0_8px_-6px_rgba(0,0,0,0.25)] sm:w-auto sm:min-w-[13rem] sm:px-5" scope="col">Procedimento</th>
              <th className="min-w-[5.5rem] bg-white px-3 py-4 font-medium" scope="col">Tabela</th>
              {COLUNAS.map((slug) => {
                const plano = planos.find((item) => item.slug === slug)
                return (
                  <th key={slug} className={`min-w-[7.5rem] px-3 py-4 font-medium ${TOM[slug]} ${slug === 'suprema' ? 'text-[#841f41]' : ''}`} scope="col">
                    {plano?.nomeCurto ?? slug}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <th className="sticky left-0 z-10 w-[8.5rem] min-w-[8.5rem] border-t border-[#e8e8ed] bg-white px-3 py-4 text-left font-display text-[15px] font-medium leading-snug text-[#1d1d1f] shadow-[4px_0_8px_-6px_rgba(0,0,0,0.25)] sm:w-auto sm:min-w-[13rem] sm:px-5" scope="row">{item.nome}</th>
                <td className="min-w-[5.5rem] whitespace-nowrap border-t border-[#e8e8ed] bg-white px-3 py-4 tabular-nums text-[#6e6e73]">{formatarReais(item.tabela)}</td>
                {COLUNAS.map((slug) => {
                  const preco = precoNoPlano(item, slug)
                  const economia = fraseEconomia(item.tabela, preco)
                  return (
                    <td key={slug} className={`min-w-[7.5rem] border-t border-[#e8e8ed] px-3 py-4 align-top ${TOM[slug]}`}>
                      <span className="whitespace-nowrap text-[16px] font-medium tabular-nums text-[#1d1d1f]">{formatarReais(preco)}</span>
                      {economia && (
                        <span className={`mt-1 block text-[12px] leading-snug ${slug === 'suprema' ? 'font-medium text-[#a52751]' : 'text-[#6e6e73]'}`}>{economia}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[13px] text-[#6e6e73]">Valores de referência.</p>
    </div>
  )
}
