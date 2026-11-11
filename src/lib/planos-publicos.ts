import { CYCLE_MONTHS, getPlanByNome, getPlanBySlug, PLANS, type Plan, type PlanSlug } from './plans'

export interface PlanoPublico {
  slug: PlanSlug
  nome: string
  nomeCurto: string
  mensalidade: number
  total12: number
  credito: number
  desconto: number
  destaque: boolean
}

function dePlano(plano: Plan): PlanoPublico {
  return {
    slug: plano.slug,
    nome: plano.nome,
    nomeCurto: plano.nome.replace(/^Beleza\s+/, ''),
    mensalidade: plano.mensalidade,
    total12: plano.total12,
    credito: plano.credito,
    desconto: plano.precoMembro,
    destaque: plano.destaque,
  }
}

export function planosCanonicos(): PlanoPublico[] {
  return PLANS.map(dePlano)
}

export function planoEntrada(planos: readonly PlanoPublico[]): PlanoPublico {
  return planos.find((plano) => plano.slug === 'essencial') ?? planos[0]
}

export function maiorCredito(planos: readonly PlanoPublico[]): number {
  return Math.max(...planos.map((plano) => plano.credito))
}

interface LinhaPlano {
  nome: string
  slug: string | null
  preco: number | string
  credito_sorteio: number | string
  desconto_servicos: string | null
  preco_membro_pct: number | string | null
  destaque: boolean | null
  ativo: boolean | null
}

function descontoDaLinha(linha: LinhaPlano, canonico: Plan | undefined): number {
  const pct = Number(linha.preco_membro_pct)
  if (Number.isFinite(pct) && pct > 0) return pct > 1 ? pct / 100 : pct
  const texto = linha.desconto_servicos?.match(/(\d+(?:[.,]\d+)?)/)
  if (texto) return Number(texto[1].replace(',', '.')) / 100
  return canonico?.precoMembro ?? 0
}

/**
 * Lê public.planos. Enquanto as linhas antigas não tiverem slug
 * (migration ainda não aplicada), mantém o catálogo que essa migration grava.
 */
export async function carregarPlanosPublicos(): Promise<PlanoPublico[]> {
  const { supabase, supabaseConfigured } = await import('./supabase')
  if (!supabaseConfigured) return planosCanonicos()
  const { data, error } = await supabase
    .from('planos')
    .select('nome, slug, preco, credito_sorteio, desconto_servicos, preco_membro_pct, destaque, ativo')
  if (error || !data?.length) return planosCanonicos()

  const linhas = (data as LinhaPlano[]).filter((linha) => linha.ativo !== false && linha.slug)
  if (linhas.length < 3) return planosCanonicos()

  const ordem: PlanSlug[] = ['essencial', 'radiante', 'suprema']
  const montados = ordem.flatMap((slug) => {
    const linha = linhas.find((item) => item.slug === slug)
    const canonico = getPlanBySlug(slug) ?? (linha ? getPlanByNome(linha.nome) : undefined)
    if (!linha) return canonico ? [dePlano(canonico)] : []
    const mensalidade = Number(linha.preco)
    const credito = Number(linha.credito_sorteio)
    if (!Number.isFinite(mensalidade) || !Number.isFinite(credito)) {
      return canonico ? [dePlano(canonico)] : []
    }
    return [{
      slug,
      nome: linha.nome,
      nomeCurto: linha.nome.replace(/^Beleza\s+/, ''),
      mensalidade,
      total12: mensalidade * CYCLE_MONTHS,
      credito,
      desconto: descontoDaLinha(linha, canonico),
      destaque: Boolean(linha.destaque),
    }]
  })

  return montados.length === 3 ? montados : planosCanonicos()
}
