import { useEffect, useRef } from 'react'
import { formatarReais } from '@/lib/format'
import type { PlanoPublico } from '@/lib/planos-publicos'
import {
  fraseEconomia,
  GRUPOS_PROCEDIMENTOS,
  precoNoPlano,
  procedimentosEmDestaque,
  type Procedimento,
} from '@/lib/procedimentos'
import type { PlanSlug } from '@/lib/plans'

const COLUNAS: PlanSlug[] = ['essencial', 'radiante', 'suprema']

function Grade({ itens, planos }: { itens: readonly Procedimento[]; planos: readonly PlanoPublico[] }) {
  return (
    <div tabIndex={0} aria-label="Preços, role para o lado para ver os planos" className="overflow-x-auto overscroll-x-contain rounded-[28px] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#841f41]">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-[14px]">
        <caption className="sr-only">Preço de tabela e preço de cada plano</caption>
        <thead>
          <tr className="text-[12px] text-[#6e6e73]">
            <th className="sticky left-0 z-10 w-[8.25rem] min-w-[8.25rem] bg-white px-3 py-3 font-medium shadow-[4px_0_8px_-6px_rgba(0,0,0,0.25)] sm:w-auto sm:min-w-[11rem] sm:px-4" scope="col">Procedimento</th>
            <th className="min-w-[4.75rem] px-3 py-3 font-medium" scope="col">Tabela</th>
            {COLUNAS.map((slug) => {
              const plano = planos.find((item) => item.slug === slug)
              return (
                <th key={slug} className={`min-w-[7.25rem] px-3 py-3 font-medium ${slug === 'suprema' ? 'bg-[#fdf2f6] text-[#841f41]' : ''}`} scope="col">
                  {plano?.nomeCurto ?? slug}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id} className="border-t border-[#e8e8ed]">
              <th className="sticky left-0 z-10 w-[8.25rem] min-w-[8.25rem] border-t border-[#e8e8ed] bg-white px-3 py-3 text-left font-medium leading-snug text-[#1d1d1f] shadow-[4px_0_8px_-6px_rgba(0,0,0,0.25)] sm:w-auto sm:min-w-[11rem] sm:px-4" scope="row">{item.nome}</th>
              <td className="min-w-[4.75rem] whitespace-nowrap border-t border-[#e8e8ed] px-3 py-3 tabular-nums text-[#6e6e73]">{formatarReais(item.tabela)}</td>
              {COLUNAS.map((slug) => {
                const preco = precoNoPlano(item, slug)
                const economia = fraseEconomia(item.tabela, preco)
                const destaque = slug === 'suprema'
                return (
                  <td key={slug} className={`min-w-[7.25rem] border-t border-[#e8e8ed] px-3 py-3 align-top ${destaque ? 'bg-[#fdf2f6]' : ''}`}>
                    <span className="whitespace-nowrap tabular-nums font-medium text-[#1d1d1f]">{formatarReais(preco)}</span>
                    {economia && (
                      <span className={`mt-1 block text-[12px] leading-snug ${destaque ? 'font-medium text-[#a52751]' : 'text-[#6e6e73]'}`}>{economia}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TabelaProcedimentos({ planos }: { planos: readonly PlanoPublico[] }) {
  const completa = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const painel = completa.current
    if (!painel) return
    if (window.location.hash === '#tabela-completa') painel.open = true
    const noHash = () => {
      painel.open = window.location.hash === '#tabela-completa'
    }
    window.addEventListener('hashchange', noHash)
    return () => window.removeEventListener('hashchange', noHash)
  }, [])

  return (
    <div>
      <Grade itens={procedimentosEmDestaque()} planos={planos} />
      <details
        id="tabela-completa"
        ref={completa}
        className="scroll-mt-16"
        onToggle={(event) => {
          const url = new URL(window.location.href)
          if (event.currentTarget.open) url.hash = 'tabela-completa'
          else if (url.hash === '#tabela-completa') url.hash = ''
          window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
        }}
      >
        <summary className="mt-6 inline-flex min-h-11 cursor-pointer list-none items-center rounded-sm text-[17px] text-[#841f41] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#841f41] [&::-webkit-details-marker]:hidden">
          Ver tabela completa
        </summary>
        <div className="mt-6 space-y-8">
          {GRUPOS_PROCEDIMENTOS.map((grupo) => (
            <div key={grupo.id}>
              <h3 className="mb-3 text-[22px] leading-tight">{grupo.nome}</h3>
              <Grade itens={grupo.itens} planos={planos} />
            </div>
          ))}
        </div>
      </details>
      <p className="mt-4 text-[13px] text-[#6e6e73]">Valores de referência.</p>
    </div>
  )
}
