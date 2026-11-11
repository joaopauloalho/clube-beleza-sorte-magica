import { formatarReais } from './format'

/**
 * Textos exatos gravados em consentimentos e pendências que o João ainda não decidiu.
 * O colchete faz parte do texto aceito enquanto o regulamento não existe.
 */
export const A_DEFINIR = {
  regulamento: '[A DEFINIR: regulamento]',
  cancelamento: '[A DEFINIR: política de cancelamento]',
  creditoSomaDesconto:
    '[A DEFINIR: o crédito soma com o desconto de membro ou é usado a preço de tabela?]',
  creditoEtapas: '[A DEFINIR: o crédito é liberado de uma vez ou em etapas?]',
  validadeCredito: '[A DEFINIR: validade do crédito]',
  servicos: '[A DEFINIR: serviços elegíveis]',
  gatewayCnpj: '[A DEFINIR: gateway e exigência de tempo mínimo de CNPJ para Pix Automático]',
  pixLiberacao: '[A DEFINIR: liberação do Pix Automático na AbacatePay]',
  whatsapp: '[A DEFINIR: política de mensagens no WhatsApp]',
  vinculoLead: '[A DEFINIR: vínculo de leads já existentes com a conta do membro]',
} as const

export const TEXTO_REGULAMENTO =
  'Aceito as regras publicadas do Clube Beleza: grupo fechado de 24 pessoas no mesmo plano; cobrança somente por Pix Automático e somente quando o grupo completar 24 pessoas; todo mês 2 integrantes em dia são sorteadas; quem já foi sorteada não concorre de novo; quem para de pagar sai do sorteio; em até 12 meses toda integrante em dia recebe o crédito em serviços da clínica. ' +
  A_DEFINIR.regulamento

export const TEXTO_OPTIN_WHATSAPP =
  'Aceito receber mensagens de WhatsApp sobre a minha participação no Clube Beleza. Este aceite é opcional e separado do regulamento. ' +
  A_DEFINIR.whatsapp

export const CTA_LISTA = 'Quero entrar na lista'
export const CTA_PLANOS = 'Ver os planos'
export const CTA_PLANO = 'Quero este plano'

export const LINHA_SORTEIO =
  'É por sorteio, conforme o regulamento. O crédito só existe se você for sorteada.'

export const LINHA_CHANCE =
  'Cada mês, a chance de quem paga em dia e ainda não foi sorteada aumenta. Quem para de pagar sai do sorteio.'

/** Mensalidade e crédito vêm do plano. A frase não fixa um segundo par de números. */
export function imaginePrimeiraMensalidade(mensalidade: number, credito: number): string {
  return `Imagine pagar ${formatarReais(mensalidade)} na primeira mensalidade e poder ser sorteada no primeiro sorteio do grupo, com ${formatarReais(credito)} em crédito na clínica.`
}

export const PROMESSA_CURTA =
  'A primeira mensalidade só acontece quando o grupo de 24 fecha. Antes disso, ninguém paga.'

export const PASSOS = [
  {
    titulo: '1. Escolha o plano',
    descricao: 'Entre na lista ou reserve uma cota com os seus dados. Ninguém é cobrado neste passo.',
  },
  {
    titulo: '2. O grupo fecha com 24',
    descricao: 'As 24 pessoas ficam no mesmo plano. A vaga só existe dentro desse grupo.',
  },
  {
    titulo: '3. Pix Automático',
    descricao: 'A autorização de cobrança só é criada quando o grupo completa 24 pessoas.',
  },
  {
    titulo: '4. Sorteio mensal',
    descricao: 'Todo mês, 2 pessoas em dia podem receber o crédito. Quem paga em dia segue, e a chance aumenta a cada mês.',
  },
] as const
