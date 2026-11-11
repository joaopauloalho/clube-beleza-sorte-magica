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

function CelulaPreco({ item, slug }: { item: ReturnType<typeof procedimentosEmDestaque>[number]; slug: PlanSlug }) {
  const preco = precoNoPlano(item, slug)
  const economia = fraseEconomia(item.tabela, preco)
  return (
    <>
      <span className="whitespace-nowrap text-[16px] font-medium tabular-nums text-[#1d1d1f]">{formatarReais(preco)}</span>
      {economia && (
        <span className={`mt-1 block text-[12px] leading-snug ${slug === 'suprema' ? 'font-medium text-[#a52751]' : 'text-[#6e6e73]'}`}>{economia}</span>
      )}
    </>
  )
}

export function TabelaProcedimentos({ planos }: { planos: readonly PlanoPublico[] }) {
  const itens = procedimentosEmDestaque()
  const nome = (slug: PlanSlug) => planos.find((item) => item.slug === slug)?.nomeCurto ?? slug

  return (
    <div>
      <div className="grid gap-3 md:hidden">
        {itens.map((item) => (
          <article key={item.id} className="rounded-[28px] bg-white p-4">
            <h3 className="text-[17px] leading-snug">{item.nome}</h3>
            <p className="mt-2 text-[13px] text-[#6e6e73]">Tabela <span className="tabular-nums">{formatarReais(item.tabela)}</span></p>
            <div className="mt-3 grid gap-2">
              {COLUNAS.map((slug) => (
                <div key={slug} className={`rounded-2xl px-3 py-2 ${TOM[slug]}`}>
                  <p className={`text-[12px] ${slug === 'suprema' ? 'text-[#841f41]' : 'text-[#6e6e73]'}`}>{nome(slug)}</p>
                  <CelulaPreco item={item} slug={slug} />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-[28px] bg-white md:block">
        <table className="w-full border-separate border-spacing-0 text-left text-[15px]">
          <caption className="sr-only">Preço de tabela e preço de cada plano</caption>
          <thead>
            <tr className="text-[13px] text-[#6e6e73]">
              <th className="sticky left-0 z-10 w-[8.5rem] min-w-[8.5rem] bg-white px-3 py-4 font-medium shadow-[4px_0_8px_-6px_rgba(0,0,0,0.25)] sm:w-auto sm:min-w-[13rem] sm:px-5" scope="col">Procedimento</th>
              <th className="min-w-[5.5rem] bg-white px-3 py-4 font-medium" scope="col">Tabela</th>
              {COLUNAS.map((slug) => (
                <th key={slug} className={`px-3 py-4 font-medium ${TOM[slug]} ${slug === 'suprema' ? 'text-[#841f41]' : ''}`} scope="col">
                  {nome(slug)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <th className="sticky left-0 z-10 w-[8.5rem] min-w-[8.5rem] border-t border-[#e8e8ed] bg-white px-3 py-4 text-left font-display text-[15px] font-medium leading-snug text-[#1d1d1f] shadow-[4px_0_8px_-6px_rgba(0,0,0,0.25)] sm:w-auto sm:min-w-[13rem] sm:px-5" scope="row">{item.nome}</th>
                <td className="min-w-[5.5rem] whitespace-nowrap border-t border-[#e8e8ed] bg-white px-3 py-4 tabular-nums text-[#6e6e73]">{formatarReais(item.tabela)}</td>
                {COLUNAS.map((slug) => (
                  <td key={slug} className={`border-t border-[#e8e8ed] px-3 py-4 align-top ${TOM[slug]}`}>
                    <CelulaPreco item={item} slug={slug} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[13px] text-[#6e6e73]">Valores de referência.</p>
    </div>
  )
}
