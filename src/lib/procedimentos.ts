import { formatarReais } from './format'
import { bonusEmServicos, PLANS } from './plans'

/**
 * Tabela de referência enviada pelo João. Os preços de cada plano são os valores
 * recebidos, não uma conta em cima do desconto. A coluna Material não entra aqui.
 * O item de R$ 180 entra na tela como "Revitalização facial".
 * Toxina botulínica e toxina masculina entram como Botox feminino e Botox masculino.
 */
export interface Procedimento {
  id: string
  nome: string
  /** Rótulo da tabela curta, quando difere do nome do grupo. */
  nomeCurto?: string
  tabela: number
  essencial: number
  radiante: number
  suprema: number
}

export interface GrupoProcedimentos {
  id: string
  nome: string
  itens: readonly Procedimento[]
}

const injetaveis: readonly Procedimento[] = [
  { id: 'toxina-1-area', nome: 'Toxina 1 área', tabela: 399, essencial: 359, radiante: 339, suprema: 319 },
  { id: 'preenchimento', nome: 'Preenchimento', tabela: 1097, essencial: 987, radiante: 932, suprema: 878 },
  { id: 'toxina-botulinica', nome: 'Botox feminino', tabela: 1249, essencial: 1124, radiante: 1062, suprema: 999 },
  { id: 'toxina-masculina', nome: 'Botox masculino', tabela: 1349, essencial: 1214, radiante: 1147, suprema: 1079 },
  { id: 'toxina-full-face', nome: 'Toxina full face', tabela: 1700, essencial: 1530, radiante: 1445, suprema: 1360 },
  { id: 'bioestimulador', nome: 'Bioestimulador', tabela: 1800, essencial: 1620, radiante: 1530, suprema: 1440 },
]

const avulsos: readonly Procedimento[] = [
  { id: 'peim', nome: 'Revitalização facial', tabela: 180, essencial: 162, radiante: 153, suprema: 144 },
  { id: 'limpeza', nome: 'Limpeza de pele', tabela: 220, essencial: 198, radiante: 187, suprema: 176 },
  { id: 'peeling', nome: 'Peeling', tabela: 249, essencial: 224, radiante: 212, suprema: 199 },
  { id: 'mmp', nome: 'Microagulhamento', tabela: 349, essencial: 314, radiante: 297, suprema: 279 },
  { id: 'protocolo-noiva', nome: 'Protocolo noiva', tabela: 449, essencial: 404, radiante: 382, suprema: 359 },
  { id: 'mmp-pdrn', nome: 'Microagulhamento com PDRN', tabela: 449, essencial: 404, radiante: 382, suprema: 359 },
  { id: 'mmp-peeling', nome: 'Microagulhamento + Peeling', tabela: 450, essencial: 405, radiante: 383, suprema: 360 },
  { id: 'skinbooster', nome: 'Skinbooster', tabela: 499, essencial: 449, radiante: 424, suprema: 399 },
]

export const GRUPOS_PROCEDIMENTOS: readonly GrupoProcedimentos[] = [
  { id: 'injetaveis', nome: 'Injetáveis', itens: injetaveis },
  { id: 'avulsos', nome: 'Serviços avulsos', itens: avulsos },
]

const DESTAQUE_IDS = [
  'peeling',
  'peim',
  'mmp',
  'limpeza',
  'toxina-botulinica',
  'toxina-masculina',
  'bioestimulador',
  'preenchimento',
] as const

const porId = new Map(GRUPOS_PROCEDIMENTOS.flatMap((grupo) => grupo.itens.map((item) => [item.id, item] as const)))

export function procedimentoPorId(id: string): Procedimento {
  const item = porId.get(id)
  if (!item) throw new Error(`Procedimento desconhecido: ${id}`)
  return item
}

export function procedimentosEmDestaque(): Procedimento[] {
  return DESTAQUE_IDS.map((id) => {
    const item = procedimentoPorId(id)
    return item.nomeCurto ? { ...item, nome: item.nomeCurto } : item
  })
}

export function precoNoPlano(item: Procedimento, slug: 'essencial' | 'radiante' | 'suprema'): number {
  return item[slug]
}

export function economia(tabela: number, preco: number): number {
  return tabela - preco
}

export function fraseEconomia(tabela: number, preco: number): string | null {
  const valor = economia(tabela, preco)
  if (valor <= 0) return null
  return `você economiza ${formatarReais(valor)}`
}

const GANHO_AO_ASSINAR = {
  essencial: 'peim',
  radiante: 'limpeza',
  suprema: 'mmp',
} as const

const inteiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export interface OfertaPlano {
  slug: 'essencial' | 'radiante' | 'suprema'
  nome: string
  pagaMes: number
  pagaAno: number
  ganhoNome: string
  ganhoTabela: number
  credito: number
  bonus: number
  /** Procedimento da assinatura + crédito. O bônus já está dentro do crédito. */
  soma: number
  /** "quase R$ 2.000" quando a soma fica perto de um milhar redondo. */
  quase: string | null
  desconto: number
}

function quaseMilhar(soma: number): string | null {
  const milhar = Math.round(soma / 1000) * 1000
  if (milhar > 0 && soma !== milhar && Math.abs(soma - milhar) <= 60) return `quase ${inteiro.format(milhar)}`
  return null
}

/** Ganho na assinatura e crédito do sorteio, sem somar o bônus de novo. */
export function ofertaDoPlano(plano: {
  slug: string
  nomeCurto?: string
  mensalidade: number
  total12: number
  credito: number
  desconto: number
}): OfertaPlano {
  const slug = plano.slug as OfertaPlano['slug']
  const ganho = procedimentoPorId(GANHO_AO_ASSINAR[slug])
  const bonus = bonusEmServicos(plano.credito, plano.total12)
  const soma = plano.credito + ganho.tabela
  return {
    slug,
    nome: plano.nomeCurto ?? slug,
    pagaMes: plano.mensalidade,
    pagaAno: plano.total12,
    ganhoNome: ganho.nome,
    ganhoTabela: ganho.tabela,
    credito: plano.credito,
    bonus,
    soma,
    quase: quaseMilhar(soma),
    desconto: plano.desconto,
  }
}

export function fraseDoHero(oferta: OfertaPlano): string {
  return `Assine o ${oferta.nome} e ganhe uma ${oferta.ganhoNome.toLowerCase()} de ${inteiro.format(oferta.ganhoTabela)} na hora.`
}

/** Um ano ilustrativo no Suprema. O que o crédito não cobre entra como pagamento à parte. */
export function exemploAnoSuprema() {
  const plano = PLANS.find((item) => item.slug === 'suprema')
  if (!plano) throw new Error('Plano Suprema ausente')
  const micro = procedimentoPorId('mmp')
  const peeling = procedimentoPorId('peeling')
  const botox = procedimentoPorId('toxina-botulinica')
  const preenchimento = procedimentoPorId('preenchimento')
  const limpeza = procedimentoPorId('limpeza')
  const bio = procedimentoPorId('bioestimulador')
  const usoCredito = botox.suprema + preenchimento.suprema
  const completa = usoCredito - plano.credito
  const aParte = peeling.suprema + completa + limpeza.suprema + bio.suprema
  const investiu = plano.mensalidade * 12 + aParte
  const recebeu = micro.tabela + peeling.tabela + botox.tabela + preenchimento.tabela + limpeza.tabela + bio.tabela
  return {
    mensalidade: plano.mensalidade,
    credito: plano.credito,
    micro,
    peeling,
    botox,
    preenchimento,
    limpeza,
    bio,
    usoCredito,
    completa,
    investiu,
    recebeu,
    economizou: recebeu - investiu,
  }
}

/**
 * O bônus da Suprema, já calculado, comparado com a toxina botulínica.
 * "Metade" só entra quando o bônus cobre de fato cerca de metade do preço de membro.
 */
export function fraseBonusSuprema(bonus: number): string {
  const toxina = procedimentoPorId('toxina-botulinica')
  const metade = toxina.suprema / 2
  const cobreMetade = metade > 0 && Math.abs(bonus - metade) / metade <= 0.02
  const relacao = cobreMetade ? `cobre metade de um ${toxina.nome}` : `entra num ${toxina.nome}`
  return `O bônus de +${formatarReais(bonus)} ${relacao}, que custa ${formatarReais(toxina.suprema)} para quem é Suprema (${formatarReais(toxina.tabela)} na tabela).`
}
