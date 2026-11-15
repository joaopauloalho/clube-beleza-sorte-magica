import { chanceDoMes } from './calendarioDoGrupo'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export function nomeDoMes(indiceDe0a11: number): string {
  return MESES[((indiceDe0a11 % 12) + 12) % 12]
}

export function formatarPercentual(fracao: number): string {
  if (!Number.isFinite(fracao) || fracao <= 0) return '0%'
  const valor = Math.round(fracao * 1000) / 10
  return `${String(valor).replace('.', ',')}%`
}

export interface MembroResumo {
  status: string
  em_dia: boolean
  data_contemplacao: string | null
}

export interface ResumoDoGrupo {
  total: number
  emDia: number
  emAtraso: number
  canceladas: number
  sorteadas: number
  concorrem: number
}

/** Quem concorre: ativa, em dia e ainda não sorteada. Em atraso fica fora até regularizar. */
export function resumirGrupo(membros: readonly MembroResumo[]): ResumoDoGrupo {
  const sorteada = (m: MembroResumo) => m.status === 'sorteado' || Boolean(m.data_contemplacao)
  const ativo = (m: MembroResumo) => m.status !== 'cancelado' && m.status !== 'aguardando_grupo'
  return {
    total: membros.length,
    emDia: membros.filter((m) => ativo(m) && m.em_dia).length,
    emAtraso: membros.filter((m) => ativo(m) && !m.em_dia).length,
    canceladas: membros.filter((m) => m.status === 'cancelado').length,
    sorteadas: membros.filter(sorteada).length,
    concorrem: membros.filter((m) => m.status === 'ativo' && m.em_dia && !sorteada(m)).length,
  }
}

export function chanceDoProximoSorteio(sorteadas: number, concorrem: number): string {
  return formatarPercentual(chanceDoMes(sorteadas, concorrem))
}

export function linkWhatsapp(whatsapp: string | null | undefined, texto: string): string | null {
  let digitos = (whatsapp ?? '').replace(/\D/g, '')
  if (digitos.startsWith('55') && digitos.length >= 12) digitos = digitos.slice(2)
  if (!/^[1-9]{2}9\d{8}$/.test(digitos)) return null
  return `https://wa.me/55${digitos}?text=${encodeURIComponent(texto)}`
}

export function primeiroNome(nome: string | null | undefined): string {
  return (nome ?? '').trim().split(/\s+/)[0] ?? ''
}

/** Mensagem do dia do sorteio para quem ainda não pagou. Tom de aviso, sem pressão. */
export function mensagemUltimaCobranca(nome: string, mensalidadeFormatada: string, mesDoSorteio: string): string {
  return (
    `Oi, ${primeiroNome(nome)}! Aqui é a Giulia, do Clube Uniquas. ` +
    `Hoje à noite é o sorteio de ${mesDoSorteio} e a mensalidade de ${mensalidadeFormatada} ainda não apareceu por aqui. ` +
    `Se você já pagou, me manda o comprovante que eu confiro. Se ainda não, me avisa que eu te passo o Pix e você entra no sorteio de hoje.`
  )
}

/** Texto do Canal: só número de cota, nunca nome. */
export function textoDoCanal(mesDoSorteio: string, cotas: readonly number[], sorteadas: number, concorreram: number): string {
  const lista = [...cotas].sort((a, b) => a - b).map((c) => String(c).padStart(2, '0')).join(', ')
  return (
    `Sorteio de ${mesDoSorteio}, Clube Uniquas.\n` +
    `Cotas sorteadas: ${lista}.\n` +
    `Chance do mês: ${sorteadas} entre ${concorreram} cotas em dia (${chanceDoProximoSorteio(sorteadas, concorreram)}).\n` +
    `O crédito só existe se você for sorteada.`
  )
}
