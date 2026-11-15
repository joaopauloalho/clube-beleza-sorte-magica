import { useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Membros } from './operador/Membros'
import { Pagamentos } from './operador/Pagamentos'
import { Sorteios } from './operador/Sorteios'
import { useOperador } from './operador/useOperador'
import { SimularPagamento } from './operador/SimularPagamento'
import { VisaoGeral } from './operador/VisaoGeral'

export default function Operador() {
  const op = useOperador()
  const [escolhido, setEscolhido] = useState('')
  const grupoId = escolhido || op.grupos[0]?.id || ''

  return (
    <div className="min-h-screen bg-[#F7F2EF] text-[#2A1420]">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-[1100px] space-y-5 px-[22px] py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-serif text-[40px] leading-tight">Painel da Giulia</h1>
          {op.grupos.length > 0 && (
            <div>
              <label htmlFor="grupo" className="mb-1 block text-sm text-[#6B5560]">Grupo</label>
              <select id="grupo" className="h-11 rounded-xl border border-[#D9CCC5] bg-white px-3 text-[16px]" value={grupoId} onChange={(e) => setEscolhido(e.target.value)}>
                {op.grupos.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
              </select>
            </div>
          )}
        </div>
        {op.erro && <p role="alert" className="rounded-xl bg-white p-3 text-[#A52751]">{op.erro}</p>}
        {op.carregando ? (
          <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#A52751]" /></div>
        ) : op.grupos.length === 0 ? (
          <p className="rounded-xl bg-white p-4">Ainda não existe grupo. Crie o primeiro grupo no banco para começar.</p>
        ) : (
          <Tabs defaultValue="geral" className="space-y-4">
            <TabsList className="h-auto flex-wrap bg-white">
              <TabsTrigger value="geral">Visão geral</TabsTrigger>
              <TabsTrigger value="membros">Membros e leads</TabsTrigger>
              <TabsTrigger value="sorteios">Sorteios</TabsTrigger>
              <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            </TabsList>
            <TabsContent value="geral"><VisaoGeral op={op} grupoId={grupoId} /></TabsContent>
            <TabsContent value="membros"><Membros op={op} grupoId={grupoId} /></TabsContent>
            <TabsContent value="sorteios"><Sorteios op={op} grupoId={grupoId} /></TabsContent>
            <TabsContent value="pagamentos"><Pagamentos op={op} grupoId={grupoId} /></TabsContent>
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
