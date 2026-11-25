import { GRUPOS_PROCEDIMENTOS } from '../../src/lib/procedimentos'
import type { FiltroDaTela } from '../../src/lib/lista-operador'

export const FORMAS_DE_PAGAMENTO = ['dinheiro', 'pix_direto', 'cartao_presencial', 'outro'] as const
export type FormaDePagamento = (typeof FORMAS_DE_PAGAMENTO)[number]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string }

function registro(corpo: unknown): Record<string, unknown> {
  return corpo && typeof corpo === 'object' && !Array.isArray(corpo) ? (corpo as Record<string, unknown>) : {}
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

export function ehUuid(valor: unknown): valor is string {
  return typeof valor === 'string' && UUID.test(valor)
}

/** Aceita AAAA-MM ou AAAA-MM-DD e devolve o primeiro dia do mês. */
export function competenciaDoMes(valor: unknown): string | null {
  const bruto = texto(valor)
  const m = /^(\d{4})-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?$/.exec(bruto)
  if (!m) return null
  return `${m[1]}-${m[2]}-01`
}

export interface PagamentoManual {
  membroId: string
  competencia: string
  valorCentavos: number
  forma: FormaDePagamento
  observacao: string | null
}

export function validarPagamentoManual(corpo: unknown): Resultado<PagamentoManual> {
  const c = registro(corpo)
  if (!ehUuid(c.membroId)) return { ok: false, erro: 'Escolha a integrante.' }
  const competencia = competenciaDoMes(c.competencia)
  if (!competencia) return { ok: false, erro: 'Informe o mês da mensalidade.' }
  const valor = typeof c.valorCentavos === 'number' ? c.valorCentavos : Number.NaN
  if (!Number.isInteger(valor) || valor <= 0 || valor > 1_000_000) return { ok: false, erro: 'Valor inválido.' }
  const forma = c.forma as FormaDePagamento
  if (!FORMAS_DE_PAGAMENTO.includes(forma)) return { ok: false, erro: 'Escolha como a mensalidade foi paga.' }
  const observacao = texto(c.observacao) || null
  if (forma === 'outro' && !observacao) return { ok: false, erro: 'Explique, em poucas palavras, como foi paga.' }
  if (observacao && observacao.length > 300) return { ok: false, erro: 'A observação passa de 300 caracteres.' }
  return { ok: true, valor: { membroId: c.membroId, competencia, valorCentavos: valor, forma, observacao } }
}

export interface Estorno {
  pagamentoId: string
  motivo: string
}

export function validarEstorno(corpo: unknown): Resultado<Estorno> {
  const c = registro(corpo)
  if (!ehUuid(c.pagamentoId)) return { ok: false, erro: 'Pagamento inválido.' }
  const motivo = texto(c.motivo)
  if (motivo.length < 5) return { ok: false, erro: 'Diga o motivo do estorno (mínimo 5 letras).' }
  if (motivo.length > 300) return { ok: false, erro: 'O motivo passa de 300 caracteres.' }
  return { ok: true, valor: { pagamentoId: c.pagamentoId, motivo } }
}

export type AcaoDoCalendario =
  | { acao: 'gerar'; grupoId: string; primeiroSorteio: string }
  | { acao: 'editar'; grupoId: string; mes: number; quantidade: number; motivo: string }
  | { acao: 'refazer'; grupoId: string; motivo: string }
  | { acao: 'conferir'; grupoId: string }

export function validarAcaoDoCalendario(corpo: unknown): Resultado<AcaoDoCalendario> {
  const c = registro(corpo)
  if (!ehUuid(c.grupoId)) return { ok: false, erro: 'Grupo inválido.' }
  const grupoId = c.grupoId
  if (c.acao === 'conferir') return { ok: true, valor: { acao: 'conferir', grupoId } }
  if (c.acao === 'gerar') {
    const data = texto(c.primeiroSorteio)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(data))) {
      return { ok: false, erro: 'Informe a data do primeiro sorteio.' }
    }
    return { ok: true, valor: { acao: 'gerar', grupoId, primeiroSorteio: data } }
  }
  if (c.acao === 'editar' || c.acao === 'refazer') {
    const motivo = texto(c.motivo)
    if (motivo.length < 5) return { ok: false, erro: 'Diga o motivo da mudança (mínimo 5 letras).' }
    if (motivo.length > 300) return { ok: false, erro: 'O motivo passa de 300 caracteres.' }
    if (c.acao === 'refazer') return { ok: true, valor: { acao: 'refazer', grupoId, motivo } }
    const mes = typeof c.mes === 'number' ? c.mes : Number.NaN
    const quantidade = typeof c.quantidade === 'number' ? c.quantidade : Number.NaN
    if (!Number.isInteger(mes) || mes < 1 || mes > 11) return { ok: false, erro: 'Mês inválido.' }
    if (!Number.isInteger(quantidade) || quantidade < 0) return { ok: false, erro: 'Quantidade inválida.' }
    return { ok: true, valor: { acao: 'editar', grupoId, mes, quantidade, motivo } }
  }
  return { ok: false, erro: 'Ação desconhecida.' }
}

const MENSAGENS: Record<string, string> = {
  grupo_inexistente: 'Grupo não encontrado.',
  calendario_invalido: 'O calendário enviado é inválido.',
  mes_12_sem_sorteio: 'O mês 12 não tem sorteio.',
  mes_ja_sorteado: 'Esse mês já foi sorteado e não pode mudar.',
  conta_nao_fecha: 'A conta não fecha: os meses que faltam precisam sortear exatamente as pessoas que ainda concorrem.',
  motivo_obrigatorio: 'Diga o motivo da mudança (mínimo 5 letras).',
  calendario_nao_definido: 'Este grupo ainda não tem calendário de sorteios.',
  ciclo_encerrado: 'O ciclo de sorteios deste grupo acabou.',
  mes_sem_sorteio: 'Este mês não tem sorteio no calendário.',
  conferencia_pendente: 'Confirme a conferência dos pagamentos antes de sortear.',
  cobranca_nao_iniciada: 'A cobrança deste grupo ainda não começou.',
  sem_elegiveis: 'Ninguém em dia para sortear.',
  quantidade_incorreta: 'A quantidade sorteada não bate com o calendário.',
  elegibilidade_mudou: 'Alguém mudou de situação durante o sorteio. Confira de novo e tente outra vez.',
  membro_inexistente: 'Integrante não encontrada.',
  membro_cancelado: 'Essa integrante está cancelada.',
  ja_pago_na_competencia: 'Esse mês já está pago para essa integrante.',
  observacao_obrigatoria: 'Explique, em poucas palavras, como foi paga.',
  observacao_longa: 'A observação passa de 300 caracteres.',
  forma_invalida: 'Forma de pagamento inválida.',
  valor_invalido: 'Valor inválido.',
  pagamento_inexistente: 'Pagamento não encontrado.',
  so_pagamento_manual: 'Só dá para estornar pagamento lançado à mão. Pagamentos do Pix vêm do banco.',
  pagamento_nao_esta_pago: 'Esse pagamento não está como pago.',
  credito_inexistente: 'Crédito não encontrado.',
  ja_liberado: 'Esse crédito já está liberado.',
  credito_bloqueado_por_atraso: 'O crédito está bloqueado porque a mensalidade não está em dia.',
  status_invalido: 'Esse crédito não pode ser liberado agora.',
  credito_nao_liberado: 'Libere o crédito antes de registrar um uso.',
  uso_individual: 'Neste plano o crédito é só da titular.',
  saldo_insuficiente: 'O valor passa do saldo. O saldo não pode ficar negativo.',
  procedimento_invalido: 'Escolha um procedimento da lista.',
  data_invalida: 'Informe a data do procedimento.',
  data_futura: 'A data não pode ser no futuro.',
  usado_por_invalido: 'O nome de quem usou precisa ter entre 2 e 80 letras.',
  uso_inexistente: 'Uso não encontrado.',
  uso_ja_estornado: 'Esse uso já foi estornado.',
  grupo_com_integrantes: 'Não dá para apagar um grupo que tem integrantes.',
  nome_invalido: 'O nome precisa ter entre 2 e 80 letras.',
  plano_inexistente: 'Escolha um plano.',
  ator_obrigatorio: 'Não foi possível identificar quem fez a ação.',
}

const PROCEDIMENTOS = new Set(GRUPOS_PROCEDIMENTOS.flatMap((grupo) => grupo.itens.map((item) => item.id)))

const FILTROS: readonly FiltroDaTela[] = ['todas', 'em_dia', 'atraso', 'sorteadas', 'canceladas', 'leads']

export function dataIso(valor: unknown): string | null {
  const bruto = texto(valor)
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bruto)
  if (!partes) return null
  const ano = Number(partes[1])
  const mes = Number(partes[2])
  const dia = Number(partes[3])
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) return null
  return bruto
}

function hojeEmSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function validarLiberarCredito(corpo: unknown): Resultado<{ creditoId: string }> {
  const c = registro(corpo)
  if (!ehUuid(c.creditoId)) return { ok: false, erro: 'Crédito inválido.' }
  return { ok: true, valor: { creditoId: c.creditoId } }
}

export interface UsoDeCredito {
  creditoId: string
  procedimentoId: string
  valorCentavos: number
  data: string
  observacao: string | null
  usadoPor: string | null
}

export function validarUsoCredito(corpo: unknown): Resultado<UsoDeCredito> {
  const c = registro(corpo)
  if (!ehUuid(c.creditoId)) return { ok: false, erro: 'Crédito inválido.' }
  const procedimentoId = texto(c.procedimentoId)
  if (!PROCEDIMENTOS.has(procedimentoId)) return { ok: false, erro: 'Escolha um procedimento da lista.' }
  const valor = typeof c.valorCentavos === 'number' ? c.valorCentavos : Number.NaN
  if (!Number.isInteger(valor) || valor <= 0 || valor > 10_000_000) return { ok: false, erro: 'Valor inválido.' }
  const data = dataIso(c.data)
  if (!data) return { ok: false, erro: 'Informe a data do procedimento.' }
  if (data > hojeEmSaoPaulo()) return { ok: false, erro: 'A data não pode ser no futuro.' }
  const observacao = texto(c.observacao) || null
  if (observacao && observacao.length > 300) return { ok: false, erro: 'A observação passa de 300 caracteres.' }
  const usadoPor = texto(c.usadoPor) || null
  if (usadoPor && (usadoPor.length < 2 || usadoPor.length > 80)) {
    return { ok: false, erro: 'O nome de quem usou precisa ter entre 2 e 80 letras.' }
  }
  return { ok: true, valor: { creditoId: c.creditoId, procedimentoId, valorCentavos: valor, data, observacao, usadoPor } }
}

export interface EstornoDeUso {
  usoId: string
  motivo: string
}

export function validarEstornoDeUso(corpo: unknown): Resultado<EstornoDeUso> {
  const c = registro(corpo)
  if (!ehUuid(c.usoId)) return { ok: false, erro: 'Uso inválido.' }
  const motivo = texto(c.motivo)
  if (motivo.length < 5) return { ok: false, erro: 'Diga o motivo do estorno (mínimo 5 letras).' }
  if (motivo.length > 300) return { ok: false, erro: 'O motivo passa de 300 caracteres.' }
  return { ok: true, valor: { usoId: c.usoId, motivo } }
}

function nomeDeGrupo(valor: unknown): Resultado<string> {
  const nome = texto(valor)
  if (nome.length < 2 || nome.length > 80) return { ok: false, erro: 'O nome precisa ter entre 2 e 80 letras.' }
  return { ok: true, valor: nome }
}

export function validarCriarGrupo(corpo: unknown): Resultado<{ nome: string; planoId: string }> {
  const c = registro(corpo)
  const nome = nomeDeGrupo(c.nome)
  if (!nome.ok) return nome
  if (!ehUuid(c.planoId)) return { ok: false, erro: 'Escolha um plano.' }
  return { ok: true, valor: { nome: nome.valor, planoId: c.planoId } }
}

export function validarRenomearGrupo(corpo: unknown): Resultado<{ grupoId: string; nome: string }> {
  const c = registro(corpo)
  if (!ehUuid(c.grupoId)) return { ok: false, erro: 'Grupo inválido.' }
  const nome = nomeDeGrupo(c.nome)
  if (!nome.ok) return nome
  return { ok: true, valor: { grupoId: c.grupoId, nome: nome.valor } }
}

export function validarExcluirGrupo(corpo: unknown): Resultado<{ grupoId: string; motivo: string }> {
  const c = registro(corpo)
  if (!ehUuid(c.grupoId)) return { ok: false, erro: 'Grupo inválido.' }
  const motivo = texto(c.motivo)
  if (motivo.length < 5) return { ok: false, erro: 'Diga o motivo (mínimo 5 letras).' }
  if (motivo.length > 300) return { ok: false, erro: 'O motivo passa de 300 caracteres.' }
  return { ok: true, valor: { grupoId: c.grupoId, motivo } }
}

export interface PedidoDePlanilha {
  tipo: 'leads' | 'integrantes'
  grupoId: string | null
  filtro: FiltroDaTela
  busca: string
}

export function validarPlanilha(corpo: unknown): Resultado<PedidoDePlanilha> {
  const c = registro(corpo)
  if (c.tipo !== 'leads' && c.tipo !== 'integrantes') return { ok: false, erro: 'Escolha leads ou integrantes.' }
  const filtro = FILTROS.includes(c.filtro as FiltroDaTela) ? (c.filtro as FiltroDaTela) : 'todas'
  const busca = texto(c.busca).slice(0, 80)
  if (c.tipo === 'integrantes') {
    if (!ehUuid(c.grupoId)) return { ok: false, erro: 'Escolha o grupo.' }
    return { ok: true, valor: { tipo: 'integrantes', grupoId: c.grupoId, filtro, busca } }
  }
  return { ok: true, valor: { tipo: 'leads', grupoId: null, filtro, busca } }
}

/** Traduz o código que o banco devolve (raise exception 'codigo') para uma frase para a Giulia. */
export function mensagemDoBanco(mensagem: string | null | undefined): string {
  const codigo = (mensagem ?? '').replace(/^.*?(\b[a-z0-9_]+)\s*$/i, '$1').trim()
  return MENSAGENS[codigo] ?? 'Não foi possível concluir. Tente de novo.'
}
