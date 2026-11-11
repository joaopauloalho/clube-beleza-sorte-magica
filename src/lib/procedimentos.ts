import { formatarReais } from './format'
import { bonusEmServicos } from './plans'

/**
 * Tabela de referência enviada pelo João. Os preços de cada plano são os valores
 * recebidos, não uma conta em cima do desconto. A coluna Material não entra aqui.
 * PEIM sessão extra é a revitalização: o nome na tela é "PEIM (revitalização)".
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
  { id: 'toxina-botulinica', nome: 'Toxina botulínica', nomeCurto: 'Toxina botulínica (botox feminino)', tabela: 1249, essencial: 1124, radiante: 1062, suprema: 999 },
  { id: 'toxina-masculina', nome: 'Toxina masculina', tabela: 1349, essencial: 1214, radiante: 1147, suprema: 1079 },
  { id: 'toxina-full-face', nome: 'Toxina full face', tabela: 1700, essencial: 1530, radiante: 1445, suprema: 1360 },
  { id: 'bioestimulador', nome: 'Bioestimulador', tabela: 1800, essencial: 1620, radiante: 1530, suprema: 1440 },
]

const avulsos: readonly Procedimento[] = [
  { id: 'peim', nome: 'PEIM (revitalização)', tabela: 180, essencial: 162, radiante: 153, suprema: 144 },
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

/** O que a Essencial inclui de cara. O valor é a tabela do PEIM, não o preço de membro. */
export function fraseEssencial(mensalidade: number, total12: number, credito: number): string {
  const peim = procedimentoPorId('peim')
  const bonus = bonusEmServicos(credito, total12)
  return `Você paga ${formatarReais(mensalidade)}/mês (${formatarReais(total12)} no ano) e ganha de cara um ${peim.nome} (${formatarReais(peim.tabela)}) + ${formatarReais(bonus)} em crédito.`
}

/**
 * O bônus da Suprema, já calculado, comparado com a toxina botulínica.
 * "Metade" só entra quando o bônus cobre de fato cerca de metade do preço de membro.
 */
export function fraseBonusSuprema(bonus: number): string {
  const toxina = procedimentoPorId('toxina-botulinica')
  const metade = toxina.suprema / 2
  const cobreMetade = metade > 0 && Math.abs(bonus - metade) / metade <= 0.02
  const relacao = cobreMetade ? 'cobre metade de uma toxina botulínica' : 'entra numa toxina botulínica'
  return `O bônus de +${formatarReais(bonus)} ${relacao}, que custa ${formatarReais(toxina.suprema)} para quem é Suprema (${formatarReais(toxina.tabela)} na tabela).`
}
