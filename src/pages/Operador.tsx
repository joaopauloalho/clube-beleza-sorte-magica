import { useSearchParams } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Grupos } from './operador/Grupos'
import { Membros } from './operador/Membros'
import { Pagamentos } from './operador/Pagamentos'
import { Sorteios } from './operador/Sorteios'
import { useOperador } from './operador/useOperador'
import { SimularPagamento } from './operador/SimularPagamento'
import { VisaoGeral } from './operador/VisaoGeral'

const ABAS = ['geral', 'grupos', 'membros', 'sorteios', 'pagamentos']

function SemGrupo() {
  return <p className="rounded-xl bg-white p-4">Ainda não existe grupo. Abra a aba Grupos para criar o primeiro.</p>
}

export default function Operador() {
  const op = useOperador()
  const [params, setParams] = useSearchParams()
  const abaPedida = params.get('aba') ?? 'geral'
  const aba = ABAS.includes(abaPedida) ? abaPedida : 'geral'
  const escolhido = params.get('grupo') ?? ''
  const grupoId = op.grupos.some((grupo) => grupo.id === escolhido) ? escolhido : (op.grupos[0]?.id ?? '')

  function atualizar(parcial: { aba?: string; grupo?: string }) {
    const next = new URLSearchParams(params)
    if (parcial.aba) next.set('aba', parcial.aba)
    if (parcial.grupo) next.set('grupo', parcial.grupo)
    setParams(next, { replace: true })
  }

  function abrirCalendario(id: string) {
    atualizar({ aba: 'sorteios', grupo: id })
  }

  return (
    <div className="min-h-screen bg-[#F7F2EF] text-[#2A1420]">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-[1100px] space-y-5 px-[22px] py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-serif text-[40px] leading-tight">Painel da Giulia</h1>
          {op.grupos.length > 0 && (
            <div>
              <label htmlFor="grupo" className="mb-1 block text-sm text-[#6B5560]">Grupo</label>
              <select id="grupo" name="grupo" className="h-11 rounded-xl border border-[#D9CCC5] bg-white px-3 text-[16px] text-[#2A1420] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={grupoId} onChange={(e) => atualizar({ grupo: e.target.value })}>
                {op.grupos.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
              </select>
            </div>
          )}
        </div>
        {op.erro && <p role="alert" className="rounded-xl bg-white p-3 text-[#A52751]">{op.erro}</p>}
        {op.carregando ? (
          <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#A52751] motion-reduce:animate-none" role="status" aria-label="Carregando" /></div>
        ) : (
          <Tabs value={aba} onValueChange={(valor) => atualizar({ aba: valor })} className="space-y-4">
            <TabsList className="h-auto flex-wrap bg-white">
              <TabsTrigger className="min-h-11" value="geral">Visão geral</TabsTrigger>
              <TabsTrigger className="min-h-11" value="grupos">Grupos</TabsTrigger>
              <TabsTrigger className="min-h-11" value="membros">Membros e leads</TabsTrigger>
              <TabsTrigger className="min-h-11" value="sorteios">Sorteios</TabsTrigger>
              <TabsTrigger className="min-h-11" value="pagamentos">Pagamentos</TabsTrigger>
            </TabsList>
            <TabsContent value="geral">{grupoId ? <VisaoGeral op={op} grupoId={grupoId} /> : <SemGrupo />}</TabsContent>
            <TabsContent value="grupos"><Grupos op={op} onAbrirCalendario={abrirCalendario} /></TabsContent>
            <TabsContent value="membros">{grupoId ? <Membros op={op} grupoId={grupoId} /> : <SemGrupo />}</TabsContent>
            <TabsContent value="sorteios">{grupoId ? <Sorteios op={op} grupoId={grupoId} /> : <SemGrupo />}</TabsContent>
            <TabsContent value="pagamentos">{grupoId ? <Pagamentos op={op} grupoId={grupoId} /> : <SemGrupo />}</TabsContent>
          </Tabs>
        )}
        <details className="rounded-xl bg-white p-3 text-sm">
          <summary className="cursor-pointer">Ferramenta de teste (devMode)</summary>
          <SimularPagamento chamar={op.chamar} />
        </details>
      </main>
    </div>
  )
}
