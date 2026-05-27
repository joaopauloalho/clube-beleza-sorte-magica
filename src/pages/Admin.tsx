import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, LogOut, Download, Users, Shuffle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Lead {
  id: string
  nome: string
  email: string
  whatsapp: string
  cpf: string | null
  plano_interesse: string | null
  checkout_id: string | null
  status: string
  created_at: string
}

interface Grupo {
  id: string
  nome: string
  plano_id: string
  vagas_preenchidas: number
  total_vagas: number
  status: string
}

export default function Admin() {
  const { signOut } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlano, setFilterPlano] = useState('all')
  const [raffleOrder, setRaffleOrder] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [leadsRes, gruposRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('grupos').select('*').order('created_at', { ascending: false }),
    ])
    if (leadsRes.data) setLeads(leadsRes.data)
    if (gruposRes.data) setGrupos(gruposRes.data)
    setLoading(false)
  }

  const filteredLeads = leads.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false
    if (filterPlano !== 'all' && l.plano_interesse !== filterPlano) return false
    return true
  })

  function exportCSV() {
    const headers = ['Nome', 'Email', 'WhatsApp', 'Plano', 'Status', 'Data']
    const rows = filteredLeads.map((l) => [
      l.nome, l.email, l.whatsapp,
      l.plano_interesse ?? '',
      l.status,
      new Date(l.created_at).toLocaleDateString('pt-BR'),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function runRaffle() {
    const nums = Array.from({ length: 24 }, (_, i) => i + 1)
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]]
    }
    setRaffleOrder(nums)
    toast({ title: 'Sorteio simulado!', description: 'Ordem gerada via Fisher-Yates.' })
  }

  async function convertToMember(lead: Lead) {
    if (!lead.plano_interesse) {
      toast({ title: 'Erro', description: 'Lead sem plano selecionado.', variant: 'destructive' })
      return
    }

    const { data: plano } = await supabase
      .from('planos').select('id').eq('nome', lead.plano_interesse).single()

    if (!plano) {
      toast({ title: 'Erro', description: 'Plano não encontrado.', variant: 'destructive' })
      return
    }

    const { data: grupo } = await supabase
      .from('grupos')
      .select('id, vagas_preenchidas, total_vagas')
      .eq('plano_id', plano.id)
      .eq('status', 'aberto')
      .lt('vagas_preenchidas', 24)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    let grupoId: string
    let novaPosicao: number

    if (grupo) {
      grupoId = grupo.id
      novaPosicao = grupo.vagas_preenchidas + 1
      await supabase.from('grupos').update({ vagas_preenchidas: novaPosicao }).eq('id', grupoId)
    } else {
      const { data: novoGrupo } = await supabase
        .from('grupos')
        .insert({ nome: `Grupo ${lead.plano_interesse} - ${Date.now()}`, plano_id: plano.id, vagas_preenchidas: 1 })
        .select('id').single()

      if (!novoGrupo) {
        toast({ title: 'Erro', description: 'Falha ao criar grupo.', variant: 'destructive' })
        return
      }
      grupoId = novoGrupo.id
      novaPosicao = 1
    }

    const [membroRes, leadRes] = await Promise.all([
      supabase.from('membros').insert({
        lead_id: lead.id, plano_id: plano.id, grupo_id: grupoId, numero_sorteio: novaPosicao,
      }),
      supabase.from('leads').update({ status: 'membro' }).eq('id', lead.id),
    ])

    if (membroRes.error || leadRes.error) {
      toast({ title: 'Erro', description: 'Falha ao converter.', variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso!', description: `${lead.nome} agora é membro do clube.` })
    fetchData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-purple-700">Admin — Clube de Estética</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Total de Leads</p>
              <p className="text-3xl font-bold">{leads.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Membros Ativos</p>
              <p className="text-3xl font-bold text-pink-600">
                {leads.filter((l) => l.status === 'membro' || l.status === 'ativo').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Grupos Abertos</p>
              <p className="text-3xl font-bold text-purple-600">
                {grupos.filter((g) => g.status === 'aberto').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leads Cadastrados
              </CardTitle>
              <Button size="sm" variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
            <div className="flex gap-3 mt-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="membro">Membro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlano} onValueChange={setFilterPlano}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="Beleza Essencial">Essencial</SelectItem>
                  <SelectItem value="Beleza Radiante">Radiante</SelectItem>
                  <SelectItem value="Beleza Suprema">Suprema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nome}</TableCell>
                      <TableCell className="text-sm">{lead.email}</TableCell>
                      <TableCell className="text-sm">{lead.whatsapp}</TableCell>
                      <TableCell className="text-sm">{lead.plano_interesse ?? '—'}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            lead.status === 'membro'
                              ? 'bg-green-100 text-green-700'
                              : lead.status === 'ativo'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {(lead.status === 'pendente' || lead.status === 'ativo') && (
                          <Button size="sm" onClick={() => convertToMember(lead)}>
                            Tornar Membro
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                        Nenhum lead encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Raffle Simulator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Simulador de Sorteio Interno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runRaffle} variant="outline">
              <Shuffle className="h-4 w-4 mr-2" />
              Simular Sorteio (24 posições)
            </Button>
            {raffleOrder.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-medium">Ordem de contemplação (Fisher-Yates):</p>
                <div className="grid grid-cols-6 gap-2">
                  {raffleOrder.map((num, idx) => (
                    <div key={num} className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">Mês {idx + 1}</p>
                      <p className="font-bold text-purple-700">#{num}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grupos.map((grupo) => (
                <Card key={grupo.id} className="border border-gray-200">
                  <CardContent className="pt-4 space-y-2">
                    <p className="font-medium text-sm truncate">{grupo.nome}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${(grupo.vagas_preenchidas / grupo.total_vagas) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {grupo.vagas_preenchidas}/{grupo.total_vagas} vagas •{' '}
                      <span className={grupo.status === 'aberto' ? 'text-green-600' : 'text-gray-400'}>
                        {grupo.status}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
              {grupos.length === 0 && (
                <p className="text-gray-400 text-sm col-span-3">Nenhum grupo criado ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
