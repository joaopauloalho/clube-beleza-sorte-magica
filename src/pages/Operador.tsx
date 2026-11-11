import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { A_DEFINIR } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import { filtrarElegiveis } from '@/lib/sorteio'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface MembroLinha {
  id: string
  cota: number | null
  status: string
  em_dia: boolean
  data_contemplacao: string | null
  grupo_id: string
  leads: { nome: string; whatsapp: string } | { nome: string; whatsapp: string }[] | null
  planos: { nome: string; preco: number; credito_sorteio: number } | { nome: string; preco: number; credito_sorteio: number }[] | null
  grupos: { nome: string; cobranca_iniciada_em: string | null; ultimo_mes_sorteado: number | null } | { nome: string; cobranca_iniciada_em: string | null; ultimo_mes_sorteado: number | null }[] | null
}

interface CreditoLinha {
  id: string
  membro_id: string
  valor_centavos: number
  chance_real: number
  mes: number
  status: string
}

function um<T>(valor: T | T[] | null): T | null {
  if (!valor) return null
  return Array.isArray(valor) ? valor[0] ?? null : valor
}

export default function Operador() {
  const { session } = useAuth()
  const [membros, setMembros] = useState<MembroLinha[]>([])
  const [creditos, setCreditos] = useState<CreditoLinha[]>([])
  const [grupos, setGrupos] = useState<{ id: string; nome: string }[]>([])
  const [grupoId, setGrupoId] = useState('')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [aviso, setAviso] = useState<string | null>(null)
  const [simulacaoId, setSimulacaoId] = useState('')

  const carregar = useCallback(async () => {
    const [membrosRes, creditosRes, gruposRes] = await Promise.all([
      supabase.from('membros').select('id, cota, status, em_dia, data_contemplacao, grupo_id, leads!membros_lead_id_fkey(nome, whatsapp), planos!membros_plano_id_fkey(nome, preco, credito_sorteio), grupos!membros_grupo_id_fkey(nome, cobranca_iniciada_em, ultimo_mes_sorteado)').order('cota'),
      supabase.from('creditos').select('id, membro_id, valor_centavos, chance_real, mes, status').eq('status', 'a_liberar'),
      supabase.from('grupos').select('id, nome').order('created_at', { ascending: false }),
    ])
    setMembros(membrosRes.data ?? [])
    setCreditos(creditosRes.data ?? [])
    setGrupos(gruposRes.data ?? [])
    setGrupoId((atual) => atual || gruposRes.data?.[0]?.id || '')
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  const elegiveis = useMemo(() => filtrarElegiveis(membros.filter((m) => m.grupo_id === grupoId).map((m) => ({
    id: m.id,
    cota: m.cota ?? 0,
    emDia: m.em_dia,
    jaSorteado: m.status === 'sorteado' || Boolean(m.data_contemplacao),
    status: m.status,
  }))), [membros, grupoId])

  const inadimplentes = membros.filter((m) => m.status === 'inadimplente' || (!m.em_dia && m.status === 'ativo' && um(m.grupos)?.cobranca_iniciada_em))
  const sorteadosParados = membros.filter((m) => m.status === 'sorteado' && !m.em_dia)
  const emCobranca = membros.filter((m) => um(m.grupos)?.cobranca_iniciada_em && m.status !== 'cancelado' && m.status !== 'aguardando_grupo')
  const esperado = emCobranca.reduce((soma, membro) => soma + Number(um(membro.planos)?.preco ?? 0), 0)

  async function sortear() {
    setAviso(null)
    const resposta = await fetch('/api/operador/sorteio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ grupoId, data }),
    })
    const json = await resposta.json().catch(() => ({}))
    setAviso(resposta.ok ? `Sorteio registrado. ${json.sorteados?.length ?? 0} cota(s).` : (json.erro ?? 'O sorteio não foi registrado.'))
    if (resposta.ok) await carregar()
  }

  async function simular() {
    setAviso(null)
    const resposta = await fetch('/api/dev/simular-pagamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ id: simulacaoId }),
    })
    const json = await resposta.json().catch(() => ({}))
    setAviso(resposta.ok ? 'Simulação de checkout transparente aceita em devMode.' : (json.erro ?? 'A simulação foi recusada.'))
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] space-y-5 px-[22px] py-8">
        <h1 className="text-[34px] font-semibold tracking-tight">Operação.</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <Card><CardHeader><CardTitle className="text-base">Mensalidades esperadas</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{formatarReais(esperado)}</p><p className="text-sm text-muted-foreground">{emCobranca.length} integrante(s) em grupo que já pode cobrar.</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Créditos a liberar</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{creditos.length}</p><p className="text-sm text-muted-foreground">{A_DEFINIR.creditoEtapas}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Inadimplentes</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{inadimplentes.length}</p><p className="text-sm text-muted-foreground">Fora do próximo sorteio enquanto não regularizam.</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Sorteio do mês</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo</Label>
                <select id="grupo" className="flex h-12 w-full rounded-xl border border-input bg-white px-3 text-[17px]" value={grupoId} onChange={(event) => setGrupoId(event.target.value)}>
                  {grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" value={data} onChange={(event) => setData(event.target.value)} />
              </div>
              <div className="flex items-end">
                <Button onClick={() => void sortear()} disabled={!grupoId}>Registrar sorteio</Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Elegíveis agora: {elegiveis.length === 0 ? 'nenhuma' : elegiveis.map((item) => `cota ${item.cota}`).join(', ')}. O servidor grava essa lista e sorteia 2, ou todas se restarem menos de 2.</p>
            {aviso && <p className="text-sm" role="status">{aviso}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Créditos a liberar</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {creditos.length === 0 && <p className="text-muted-foreground">Nenhum crédito aguardando liberação.</p>}
            {creditos.map((credito) => (
              <p key={credito.id}>{formatarReais(credito.valor_centavos / 100)} · mês {credito.mes} · a liberar · {A_DEFINIR.servicos}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sorteadas que pararam de pagar</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {sorteadosParados.length === 0 ? <p className="text-muted-foreground">Nenhuma.</p> : sorteadosParados.map((membro) => <p key={membro.id}>Cota {membro.cota} · {um(membro.leads)?.nome}</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Integrantes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cota</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Em dia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membros.map((membro) => (
                  <TableRow key={membro.id}>
                    <TableCell>{um(membro.leads)?.nome}</TableCell>
                    <TableCell>{membro.cota}</TableCell>
                    <TableCell>{um(membro.planos)?.nome}</TableCell>
                    <TableCell>{um(membro.grupos)?.nome}</TableCell>
                    <TableCell>{membro.status}</TableCell>
                    <TableCell>{membro.em_dia ? 'sim' : 'não'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Simular pagamento transparente</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Usa POST /transparents/simulate-payment e só segue se a resposta estiver em devMode. Não autoriza Pix Automático.</p>
            <div className="flex gap-3">
              <Input value={simulacaoId} onChange={(event) => setSimulacaoId(event.target.value)} placeholder="id do checkout transparente" />
              <Button variant="outline" onClick={() => void simular()}>Simular</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
