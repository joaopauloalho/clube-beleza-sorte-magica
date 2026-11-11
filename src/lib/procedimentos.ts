import { formatarReais } from './format'
import { bonusEmServicos } from './plans'

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
  { id: 'mmp', nome: 'MMP', tabela: 349, essencial: 314, radiante: 297, suprema: 279 },
  { id: 'protocolo-noiva', nome: 'Protocolo noiva', tabela: 449, essencial: 404, radiante: 382, suprema: 359 },
  { id: 'mmp-pdrn', nome: 'MMP com PDRN', tabela: 449, essencial: 404, radiante: 382, suprema: 359 },
  { id: 'mmp-peeling', nome: 'MMP + Peeling', tabela: 450, essencial: 405, radiante: 383, suprema: 360 },
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

export interface OfertaPlano {
  pagaMes: number
  pagaAno: number
  /** Número grande de "Você recebe". Só entra o que os dados somam. */
  recebe: number
  linhas: string[]
  desconto: number
}

/**
 * O que cada plano mostra em "Você paga" e "Você recebe".
 * Essencial: o João falou em "R$ 100 em crédito, total 280". Enquanto ele não confirma,
 * o crédito mostrado é o do plano (700), não 100 e não 180+100.
 * Radiante: ele quer ler "recebe 1.300". Crédito 1.125 + limpeza 220 = 1.345. A tela usa 1.345.
 * Suprema: ele citou "quase R$ 2.000". Não há serviço incluído confirmado que chegue lá.
 * Pendente até ele indicar o serviço. Não escrever "quase 2.000".
 */
export function ofertaDoPlano(plano: {
  slug: string
  mensalidade: number
  total12: number
  credito: number
  desconto: number
}): OfertaPlano {
  const bonus = bonusEmServicos(plano.credito, plano.total12)
  const credito = `${formatarReais(plano.credito)} em crédito, se for sorteada`
  if (plano.slug === 'essencial') {
    const revitalizacao = procedimentoPorId('peim')
    return {
      pagaMes: plano.mensalidade,
      pagaAno: plano.total12,
      recebe: plano.credito,
      linhas: [
        `${revitalizacao.nome} (${formatarReais(revitalizacao.tabela)} de tabela)`,
        `${credito} (inclui +${formatarReais(bonus)} de bônus)`,
      ],
      desconto: plano.desconto,
    }
  }
  if (plano.slug === 'radiante') {
    const limpeza = procedimentoPorId('limpeza')
    return {
      pagaMes: plano.mensalidade,
      pagaAno: plano.total12,
      recebe: plano.credito + limpeza.tabela,
      linhas: [
        `${limpeza.nome} (${formatarReais(limpeza.tabela)} de tabela)`,
        credito,
      ],
      desconto: plano.desconto,
    }
  }
  return {
    pagaMes: plano.mensalidade,
    pagaAno: plano.total12,
    recebe: plano.credito,
    linhas: [`${credito} (inclui +${formatarReais(bonus)} de bônus)`],
    desconto: plano.desconto,
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
