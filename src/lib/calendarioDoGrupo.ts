/**
 * Calendário de sorteios de um grupo de qualquer tamanho.
 *
 * O padrão espalha o grupo por igual nos meses 1 a 11. As sobras vão para os meses 4, 8, 2, 6, 10 e
 * assim por diante. Para 24 pessoas isso dá exatamente o que o site publica: 2 por mês e 3 nos meses
 * 4 e 8. O mês 12 nunca tem sorteio: é a última mensalidade.
 *
 * A Giulia pode mudar a quantidade de um mês que ainda não foi sorteado. O resto do calendário é
 * refeito para que todas as pessoas do grupo continuem sendo sorteadas até o mês 11.
 */

export const MESES_DO_CALENDARIO = 12
export const ULTIMO_MES_COM_SORTEIO = 11
export const TAMANHO_MINIMO_DO_GRUPO = 12

const ORDEM_DOS_EXTRAS = [4, 8, 2, 6, 10, 1, 5, 9, 3, 7, 11] as const

export function somar(valores: readonly number[]): number {
  return valores.reduce((soma, valor) => soma + valor, 0)
}

/** Espalha `restante` pessoas pelos meses de `aPartirDoMes` até o mês 11. Os outros meses ficam em 0. */
function espalhar(restante: number, aPartirDoMes: number): number[] {
  const meses = Array.from({ length: MESES_DO_CALENDARIO }, () => 0)
  const quantidadeDeMeses = ULTIMO_MES_COM_SORTEIO - aPartirDoMes + 1
  if (restante <= 0 || quantidadeDeMeses <= 0) return meses
  const base = Math.floor(restante / quantidadeDeMeses)
  const extras = restante % quantidadeDeMeses
  for (let mes = aPartirDoMes; mes <= ULTIMO_MES_COM_SORTEIO; mes += 1) meses[mes - 1] = base
  ORDEM_DOS_EXTRAS.filter((mes) => mes >= aPartirDoMes)
    .slice(0, extras)
    .forEach((mes) => {
      meses[mes - 1] += 1
    })
  return meses
}

export function calendarioPadrao(tamanho: number): number[] {
  if (!Number.isInteger(tamanho) || tamanho < TAMANHO_MINIMO_DO_GRUPO) {
    throw new Error(`O grupo precisa ter pelo menos ${TAMANHO_MINIMO_DO_GRUPO} pessoas.`)
  }
  return espalhar(tamanho, 1)
}

export interface EdicaoDeMes {
  mes: number
  quantidade: number
  tamanho: number
  /** Quantos meses já têm sorteio registrado. Esses meses não mudam. */
  mesesJaSorteados: number
}

export function editarMes(calendario: readonly number[], edicao: EdicaoDeMes): number[] {
  const { mes, quantidade, tamanho, mesesJaSorteados } = edicao
  if (!Number.isInteger(mes) || mes < 1 || mes > MESES_DO_CALENDARIO) throw new Error('Mês inválido.')
  if (mes === MESES_DO_CALENDARIO) throw new Error('O mês 12 não tem sorteio: é a última mensalidade.')
  if (mes <= mesesJaSorteados) throw new Error(`O mês ${mes} já foi sorteado e não pode mudar.`)
  if (!Number.isInteger(quantidade) || quantidade < 0) throw new Error('A quantidade precisa ser um número inteiro, de 0 para cima.')

  const concorrem = tamanho - somar(calendario.slice(0, mes - 1))
  if (quantidade > concorrem) throw new Error(`Neste mês só concorrem ${concorrem} pessoas.`)
  const restante = concorrem - quantidade
  if (mes === ULTIMO_MES_COM_SORTEIO && restante > 0) {
    throw new Error('No mês 11 todas as pessoas que sobraram precisam ser sorteadas.')
  }

  const novo = [...calendario.slice(0, mes - 1), quantidade, ...espalhar(restante, mes + 1).slice(mes)]
  return novo
}

export function validarCalendario(
  calendario: readonly number[],
  tamanho: number,
): { ok: true } | { ok: false; erro: string } {
  if (calendario.length !== MESES_DO_CALENDARIO) return { ok: false, erro: 'O calendário tem que ter 12 meses.' }
  if (calendario.some((n) => !Number.isInteger(n) || n < 0)) return { ok: false, erro: 'Quantidade inválida em algum mês.' }
  if (calendario[MESES_DO_CALENDARIO - 1] !== 0) return { ok: false, erro: 'O mês 12 não tem sorteio.' }
  if (somar(calendario) !== tamanho) {
    return { ok: false, erro: `O calendário sorteia ${somar(calendario)} pessoas e o grupo tem ${tamanho}.` }
  }
  return { ok: true }
}

/** Chance real de quem concorre: sorteadas divididas por quem está em dia e ainda não foi sorteada. */
export function chanceDoMes(sorteadas: number, concorrem: number): number {
  if (concorrem <= 0 || sorteadas <= 0) return 0
  return Math.min(1, sorteadas / concorrem)
}

export interface MesPrevisto {
  mes: number
  sorteadas: number
  concorrem: number
  chance: number
}

/** Previsão mês a mês, se ninguém sair do grupo. */
export function previsaoDoGrupo(calendario: readonly number[], tamanho: number): MesPrevisto[] {
  return calendario.map((sorteadas, indice) => {
    const concorrem = tamanho - somar(calendario.slice(0, indice))
    return { mes: indice + 1, sorteadas, concorrem, chance: chanceDoMes(sorteadas, concorrem) }
  })
}
