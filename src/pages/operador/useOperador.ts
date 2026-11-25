import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

export function um<T>(valor: T | T[] | null | undefined): T | null {
  if (!valor) return null
  return Array.isArray(valor) ? (valor[0] ?? null) : valor
}

export interface Membro {
  id: string
  cota: number | null
  status: string
  em_dia: boolean
  data_contemplacao: string | null
  grupo_id: string
  created_at: string
  leads: { nome: string; whatsapp: string; email: string | null } | { nome: string; whatsapp: string; email: string | null }[] | null
  planos: { nome: string; preco: number; credito_sorteio: number; slug: string | null } | { nome: string; preco: number; credito_sorteio: number; slug: string | null }[] | null
}

export interface Lead {
  id: string
  nome: string
  whatsapp: string | null
  plano_interesse: string | null
  status: string | null
  created_at: string
}

export interface GrupoLinha {
  id: string
  nome: string
  plano_id: string | null
  total_vagas: number | null
  vagas_preenchidas: number | null
  status: string | null
  cobranca_iniciada_em: string | null
  ultimo_mes_sorteado: number | null
  planos: { nome: string; slug: string | null } | { nome: string; slug: string | null }[] | null
}

export interface PlanoOpcao {
  id: string
  nome: string
  slug: string | null
}

export interface CalendarioLinha {
  grupo_id: string
  mes: number
  quantidade: number
  data_prevista: string | null
  conferido_em: string | null
}

export interface SorteioLinha {
  id: string
  grupo_id: string
  mes: number
  data_sorteio: string
  sorteados: unknown
  elegiveis: unknown
}

export interface PagamentoLinha {
  id: string
  membro_id: string
  grupo_id: string | null
  competencia: string | null
  valor_centavos: number | null
  status: string
  origem: string | null
  forma_manual: string | null
  observacao: string | null
  created_at: string
}

export interface CreditoLinha {
  id: string
  membro_id: string
  valor_centavos: number
  mes: number
  status: string
  bloqueado: boolean | null
}

export interface UsoCreditoLinha {
  id: string
  credito_id: string
  membro_id: string
  procedimento_id: string
  procedimento_nome: string
  valor_centavos: number
  data_uso: string
  observacao: string | null
  usado_por: string | null
  status: string
  created_at: string
}

export function useOperador() {
  const { session } = useAuth()
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [membros, setMembros] = useState<Membro[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [grupos, setGrupos] = useState<GrupoLinha[]>([])
  const [calendarios, setCalendarios] = useState<CalendarioLinha[]>([])
  const [sorteios, setSorteios] = useState<SorteioLinha[]>([])
  const [pagamentos, setPagamentos] = useState<PagamentoLinha[]>([])
  const [creditos, setCreditos] = useState<CreditoLinha[]>([])
  const [usos, setUsos] = useState<UsoCreditoLinha[]>([])
  const [planos, setPlanos] = useState<PlanoOpcao[]>([])

  const carregar = useCallback(async () => {
    const [m, l, g, c, s, p, cr, u, pl] = await Promise.all([
      supabase.from('membros').select('id, cota, status, em_dia, data_contemplacao, grupo_id, created_at, leads!membros_lead_id_fkey(nome, whatsapp, email), planos!membros_plano_id_fkey(nome, preco, credito_sorteio, slug)').order('cota'),
      supabase.from('leads').select('id, nome, whatsapp, plano_interesse, status, created_at').order('created_at', { ascending: false }),
      supabase.from('grupos').select('id, nome, plano_id, total_vagas, vagas_preenchidas, status, cobranca_iniciada_em, ultimo_mes_sorteado, planos!grupos_plano_id_fkey(nome, slug)').order('created_at', { ascending: false }),
      supabase.from('calendario_sorteio').select('grupo_id, mes, quantidade, data_prevista, conferido_em').order('mes'),
      supabase.from('sorteios').select('id, grupo_id, mes, data_sorteio, sorteados, elegiveis').order('mes'),
      supabase.from('pagamentos').select('id, membro_id, grupo_id, competencia, valor_centavos, status, origem, forma_manual, observacao, created_at').order('created_at', { ascending: false }),
      supabase.from('creditos').select('id, membro_id, valor_centavos, mes, status, bloqueado'),
      supabase.from('usos_credito').select('id, credito_id, membro_id, procedimento_id, procedimento_nome, valor_centavos, data_uso, observacao, usado_por, status, created_at').order('created_at', { ascending: false }),
      supabase.from('planos').select('id, nome, slug').eq('ativo', true).order('preco'),
    ])
    const falha = [m, l, g, c, s, p, cr, u, pl].find((r) => r.error)
    setErro(falha?.error ? 'Não consegui carregar tudo. Tente atualizar a página.' : null)
    setMembros((m.data as Membro[] | null) ?? [])
    setLeads((l.data as Lead[] | null) ?? [])
    setGrupos((g.data as GrupoLinha[] | null) ?? [])
    setCalendarios((c.data as CalendarioLinha[] | null) ?? [])
    setSorteios((s.data as SorteioLinha[] | null) ?? [])
    setPagamentos((p.data as PagamentoLinha[] | null) ?? [])
    setCreditos((cr.data as CreditoLinha[] | null) ?? [])
    setUsos((u.data as UsoCreditoLinha[] | null) ?? [])
    setPlanos((pl.data as PlanoOpcao[] | null) ?? [])
    setCarregando(false)
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  /** POST autenticado nas rotas do operador. Devolve a mensagem de erro em português ou null. */
  const chamar = useCallback(async (rota: string, corpo: unknown): Promise<{ erro: string | null; dados: Record<string, unknown> }> => {
    const resposta = await fetch(rota, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify(corpo),
    })
    const dados = (await resposta.json().catch(() => ({}))) as Record<string, unknown>
    if (!resposta.ok) return { erro: typeof dados.erro === 'string' ? dados.erro : 'Não deu certo. Tente de novo.', dados }
    await carregar()
    return { erro: null, dados }
  }, [session?.access_token, carregar])

  const baixarCsv = useCallback(async (corpo: { tipo: 'leads' | 'integrantes'; grupoId?: string; filtro: string; busca: string }): Promise<{ erro: string | null }> => {
    const resposta = await fetch('/api/operador/exportar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify(corpo),
    })
    if (!resposta.ok) {
      const dados = (await resposta.json().catch(() => ({}))) as { erro?: string }
      return { erro: dados.erro ?? 'Não consegui gerar a planilha.' }
    }
    const nome = /filename="([^"]+)"/.exec(resposta.headers.get('Content-Disposition') ?? '')?.[1] ?? 'planilha.csv'
    const blob = await resposta.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nome
    link.click()
    URL.revokeObjectURL(url)
    return { erro: null }
  }, [session?.access_token])

  return { carregando, erro, membros, leads, grupos, calendarios, sorteios, pagamentos, creditos, usos, planos, carregar, chamar, baixarCsv }
}

export type Operador = ReturnType<typeof useOperador>
