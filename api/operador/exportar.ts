import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  filtrarIntegrantesParaPlanilha,
  filtrarLeadsSemCota,
  rotuloSituacao,
  sorteadaDaLinha,
  type FiltroDaTela,
} from '../../src/lib/lista-operador'
import { saldoDoCredito, type UsoParaSaldo } from '../../src/lib/saldo-credito'
import { centavosParaPlanilha, dataParaPlanilha, planilha } from '../_lib/csv'
import { mensagemDoBanco, validarPlanilha } from '../_lib/operador-validacao'
import { clienteServico, exigirOperador } from '../_lib/supabase-admin'

interface LeadBruto {
  id: string
  nome: string
  whatsapp: string | null
  email: string | null
  plano_interesse: string | null
  status: string | null
  created_at: string
}

interface MembroBruto {
  id: string
  cota: number | null
  status: string
  em_dia: boolean
  data_contemplacao: string | null
  grupo_id: string
  leads: { nome: string; whatsapp: string | null; email: string | null } | { nome: string; whatsapp: string | null; email: string | null }[] | null
  planos: { nome: string } | { nome: string }[] | null
  grupos: { nome: string } | { nome: string }[] | null
}

interface CreditoBruto {
  id: string
  membro_id: string
  valor_centavos: number
  status: string
  bloqueado: boolean | null
}

function um<T>(valor: T | T[] | null | undefined): T | null {
  if (!valor) return null
  return Array.isArray(valor) ? (valor[0] ?? null) : valor
}

function rotuloLead(status: string | null): string {
  if (status === 'lista_espera') return 'Lista de espera'
  if (status === 'adesao') return 'Adesão'
  if (status === 'pendente') return 'Pendente'
  return status ?? ''
}

function rotuloCredito(status: string): string {
  if (status === 'a_liberar') return 'A liberar'
  if (status === 'liberado') return 'Liberado'
  return status
}

async function planilhaDeLeads(admin: SupabaseClient, busca: string): Promise<string> {
  const [leadsRes, membrosRes] = await Promise.all([
    admin.from('leads').select('id, nome, whatsapp, email, plano_interesse, status, created_at').order('created_at', { ascending: false }),
    admin.from('membros').select('leads!membros_lead_id_fkey(whatsapp)'),
  ])
  if (leadsRes.error) throw new Error(mensagemDoBanco(leadsRes.error.message))
  if (membrosRes.error) throw new Error(mensagemDoBanco(membrosRes.error.message))

  const whatsapps = new Set<string>()
  for (const linha of (membrosRes.data ?? []) as { leads: MembroBruto['leads'] }[]) {
    const whatsapp = um(linha.leads)?.whatsapp
    if (whatsapp) whatsapps.add(whatsapp)
  }

  const leads = filtrarLeadsSemCota((leadsRes.data ?? []) as LeadBruto[], whatsapps, busca)
  const linhas: string[][] = [['Nome', 'WhatsApp', 'E-mail', 'Plano de interesse', 'Situação', 'Entrou em']]
  for (const lead of leads) {
    linhas.push([
      lead.nome,
      lead.whatsapp ?? '',
      lead.email ?? '',
      lead.plano_interesse ?? '',
      rotuloLead(lead.status),
      dataParaPlanilha(lead.created_at),
    ])
  }
  return planilha(linhas)
}

async function planilhaDeIntegrantes(
  admin: SupabaseClient,
  grupoId: string,
  filtro: FiltroDaTela,
  busca: string,
): Promise<string> {
  const [membrosRes, creditosRes, usosRes] = await Promise.all([
    admin.from('membros').select('id, cota, status, em_dia, data_contemplacao, grupo_id, leads!membros_lead_id_fkey(nome, whatsapp, email), planos!membros_plano_id_fkey(nome), grupos!membros_grupo_id_fkey(nome)').eq('grupo_id', grupoId).order('cota'),
    admin.from('creditos').select('id, membro_id, valor_centavos, status, bloqueado'),
    admin.from('usos_credito').select('credito_id, valor_centavos, status'),
  ])
  if (membrosRes.error) throw new Error(mensagemDoBanco(membrosRes.error.message))
  if (creditosRes.error) throw new Error(mensagemDoBanco(creditosRes.error.message))
  if (usosRes.error) throw new Error(mensagemDoBanco(usosRes.error.message))

  const usos = (usosRes.data ?? []) as UsoParaSaldo[]
  const creditos = (creditosRes.data ?? []) as CreditoBruto[]
  const brutos = ((membrosRes.data ?? []) as MembroBruto[]).map((membro) => ({
    ...membro,
    nome: um(membro.leads)?.nome ?? '',
  }))
  const linhasFiltradas = filtrarIntegrantesParaPlanilha(brutos, grupoId, filtro, busca)

  const linhas: string[][] = [[
    'Nome', 'WhatsApp', 'E-mail', 'Plano', 'Grupo', 'Cota', 'Situação', 'Em dia', 'Crédito', 'Saldo', 'Situação do crédito', 'Bloqueado',
  ]]
  for (const membro of linhasFiltradas) {
    const sorteada = sorteadaDaLinha(membro.status, membro.data_contemplacao)
    const doMembro = creditos.filter((credito) => credito.membro_id === membro.id)
    const concedido = doMembro.reduce((soma, credito) => soma + credito.valor_centavos, 0)
    const saldo = doMembro.reduce((soma, credito) => soma + saldoDoCredito(credito.valor_centavos, usos, credito.id), 0)
    const lead = um(membro.leads)
    linhas.push([
      membro.nome,
      lead?.whatsapp ?? '',
      lead?.email ?? '',
      um(membro.planos)?.nome ?? '',
      um(membro.grupos)?.nome ?? '',
      membro.cota == null ? '' : String(membro.cota),
      rotuloSituacao(membro.status, membro.em_dia, sorteada),
      membro.em_dia ? 'Sim' : 'Não',
      doMembro.length === 0 ? '' : centavosParaPlanilha(concedido),
      doMembro.length === 0 ? '' : centavosParaPlanilha(saldo),
      doMembro.map((credito) => rotuloCredito(credito.status)).join(' | '),
      doMembro.length === 0 ? '' : (doMembro.some((credito) => credito.bloqueado) ? 'Sim' : 'Não'),
    ])
  }
  return planilha(linhas)
}

/** CSV de leads ou de integrantes, com os filtros da tela. Só operador. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    await exigirOperador(req.headers.authorization)
    const entrada = validarPlanilha(req.body)
    if (!entrada.ok) return res.status(400).json({ erro: entrada.erro })

    const admin = clienteServico()
    const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    const arquivo = entrada.valor.tipo === 'leads'
      ? { nome: `leads-${hoje}.csv`, corpo: await planilhaDeLeads(admin, entrada.valor.busca) }
      : { nome: `integrantes-${hoje}.csv`, corpo: await planilhaDeIntegrantes(admin, entrada.valor.grupoId as string, entrada.valor.filtro, entrada.valor.busca) }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${arquivo.nome}"`)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(arquivo.corpo)
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500
    return res.status(status).json({ erro: error instanceof Error ? error.message : 'Não consegui gerar a planilha.' })
  }
}
