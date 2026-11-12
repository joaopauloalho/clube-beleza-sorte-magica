import { useNavigate } from 'react-router-dom'
import { Calendar, ClipboardList, Wallet } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ExemploAno } from '@/components/ExemploAno'
import { GrupoVivo } from '@/components/GrupoVivo'
import { Logo } from '@/components/Logo'
import { CarrosselEntrada } from '@/components/CarrosselEntrada'
import { ConviteLista } from '@/components/ConviteLista'
import { PlanosGrid } from '@/components/PlanosGrid'
import { TabelaProcedimentos } from '@/components/TabelaProcedimentos'
import { SiteHeader } from '@/components/SiteHeader'
import { DIA_PAGAMENTO, DIA_SORTEIO, fraseDoCiclo } from '@/lib/ciclo'
import { A_DEFINIR, CTA_PLANOS, imaginePrimeiraMensalidade, LINHA_DE_APOIO, LINHA_SORTEIO, PROMESSA_CURTA, REGRA_SORTEIO, NOME_DO_CLUBE, TAGLINE } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import { maiorCredito } from '@/lib/planos-publicos'
import { usePlanosPublicos } from '@/lib/use-planos-publicos'

const faq = [
  { pergunta: 'Quando a mensalidade começa?', resposta: PROMESSA_CURTA },
  { pergunta: 'Como funciona o sorteio?', resposta: `${REGRA_SORTEIO} ${A_DEFINIR.atraso} ${LINHA_SORTEIO}` },
  { pergunta: 'O crédito soma com o desconto de membro?', resposta: A_DEFINIR.creditoSomaDesconto },
  { pergunta: 'O crédito sai de uma vez?', resposta: `${A_DEFINIR.creditoEtapas} ${A_DEFINIR.validadeCredito}` },
  { pergunta: 'Dá para dividir o crédito?', resposta: 'No Essencial e no Radiante, o crédito é de uso individual. No Suprema, dá para dividir com outra pessoa.' },
  { pergunta: 'Quais serviços entram?', resposta: A_DEFINIR.listaServicos },
  { pergunta: 'Posso cancelar?', resposta: A_DEFINIR.cancelamento },
  { pergunta: 'Onde está o regulamento?', resposta: A_DEFINIR.regulamento },
  { pergunta: 'Pix Automático e o CNPJ', resposta: A_DEFINIR.gatewayCnpj },
]

const linkPlano = 'inline-flex min-h-11 items-center rounded-sm text-[17px] text-[#6E1736] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E1736]'

export default function Index() {
  const navigate = useNavigate()
  const planos = usePlanosPublicos()
  const destaque = planos.find((plano) => plano.destaque) ?? planos[planos.length - 1]
  const teto = maiorCredito(planos)

  return (
    <div className="min-h-screen bg-[#F7F2EF] text-[#2A1420]">
      <SiteHeader />
      <main id="conteudo" className="pb-24 md:pb-16">
        <section className="px-[22px] pb-4 pt-4 md:pt-8">
          <div className="mx-auto grid max-w-[1120px] items-stretch gap-3 md:grid-cols-12 md:gap-4">
            <article className="flex flex-col justify-between rounded-[28px] border border-[#E4D9D3] bg-white p-6 md:col-span-7 md:p-10">
              <div>
                <Logo tom="amora" titulo={NOME_DO_CLUBE} className="block h-auto w-full max-w-[320px]" />
                <h1 className="mt-6 text-balance text-[clamp(52px,7.5vw,96px)] leading-[0.98]">{TAGLINE}</h1>
                <p className="mt-4 max-w-[34rem] text-pretty text-[clamp(17px,2vw,21px)] leading-snug text-[#6B5560]">{LINHA_DE_APOIO}</p>
                <p className="mt-4 max-w-[34rem] text-pretty text-[15px] leading-snug text-[#6B5560]">
                  {imaginePrimeiraMensalidade(destaque.mensalidade, destaque.credito)}
                </p>
                <p className="mt-3 max-w-[34rem] text-[14px] leading-snug text-[#6B5560]">{LINHA_SORTEIO}</p>
              </div>
              <div className="mt-8 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-5">
                <ConviteLista />
                <a href="#planos" className={linkPlano}>{CTA_PLANOS} ›</a>
              </div>
            </article>

            <CarrosselEntrada planos={planos} />

            <GrupoVivo className="md:col-span-7" />

            <article id="sorteio" className="scroll-mt-16 flex flex-col justify-center rounded-[28px] border border-[#E4D9D3] bg-white p-6 md:col-span-5 md:p-8">
              <div>
                <p className="text-[17px] leading-snug text-[#6B5560]">{fraseDoCiclo()}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="min-w-[72px] rounded-2xl bg-[#F7F2EF] px-3 py-4">
                    <p className="font-sans text-[28px] font-medium tabular-nums leading-none">{DIA_PAGAMENTO}</p>
                    <p className="mt-1 text-[12px] text-[#6B5560]">pagamento</p>
                  </div>
                  <div className="h-px flex-1 bg-[#F2C9D6]" aria-hidden="true" />
                  <div className="min-w-[72px] rounded-2xl bg-[#a52751] px-3 py-4 text-white">
                    <p className="font-sans text-[28px] font-medium tabular-nums leading-none">{DIA_SORTEIO}</p>
                    <p className="mt-1 text-[12px] text-white">sorteio</p>
                  </div>
                </div>
                <p className="mt-5 font-sans text-[20px] font-medium tabular-nums">até {formatarReais(teto)} em crédito</p>
                <p className="mt-2 text-[14px] leading-snug text-[#6B5560]">{LINHA_SORTEIO}</p>
                <p className="mt-3 text-[13px] leading-snug text-[#6B5560]">{A_DEFINIR.atraso}</p>
              </div>
            </article>
          </div>
        </section>

        <section id="planos" className="scroll-mt-16 bg-[#F7F2EF] px-3 py-14 sm:px-[22px] md:py-24">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="text-balance text-[clamp(32px,5vw,56px)] leading-[1.05]">Três planos.</h2>
            <div className="mt-8">
              <PlanosGrid planos={planos} onEscolher={(plano) => navigate(`/adesao?plano=${plano.slug}`)} />
            </div>
            <div className="mt-8">
              <ConviteLista />
            </div>
          </div>
        </section>

        <section className="px-[22px] py-14 md:py-24">
          <div className="mx-auto max-w-[980px]">
            <h2 className="text-balance text-[clamp(32px,5vw,56px)] leading-[1.05]">Como funciona.</h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {([
                [ClipboardList, '1', 'Escolha seu plano'],
                [Wallet, '2', 'Pague 12 mensalidades'],
                [Calendar, '3', 'Todo dia 10 tem sorteio'],
              ] as const).map(([Icone, numero, titulo]) => (
                <li key={numero} className="flex items-center gap-3">
                  <Icone className="h-6 w-6 shrink-0 text-[#a52751] stroke-[1.5]" aria-hidden="true" />
                  <span className="text-[17px] leading-snug"><span className="text-[#a52751]">{numero}</span> {titulo}</span>
                </li>
              ))}
            </ol>
            <article className="mt-8 rounded-[28px] border border-[#E4D9D3] bg-white p-6 md:p-8">
              <p className="text-[17px] leading-snug text-[#6B5560]">{fraseDoCiclo()}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="min-w-[72px] rounded-2xl bg-[#F7F2EF] px-3 py-4">
                  <p className="font-sans text-[28px] font-medium tabular-nums leading-none">{DIA_PAGAMENTO}</p>
                  <p className="mt-1 text-[12px] text-[#6B5560]">pagamento</p>
                </div>
                <div className="h-px flex-1 bg-[#F2C9D6]" aria-hidden="true" />
                <div className="min-w-[72px] rounded-2xl bg-[#a52751] px-3 py-4 text-white">
                  <p className="font-sans text-[28px] font-medium tabular-nums leading-none">{DIA_SORTEIO}</p>
                  <p className="mt-1 text-[12px] text-white">sorteio</p>
                </div>
              </div>
              <p className="mt-5 font-sans text-[20px] font-medium tabular-nums">até {formatarReais(teto)} em crédito</p>
              <p className="mt-2 text-[14px] leading-snug text-[#6B5560]">{LINHA_SORTEIO}</p>
            </article>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
              <article className="min-w-0 rounded-[28px] border border-[#E4D9D3] bg-white p-4 sm:p-6">
                <p className="text-[22px] font-medium leading-tight sm:text-[28px]">Todo dia 10</p>
                <p className="mt-2 text-[15px] leading-snug text-[#6B5560] sm:text-[17px]">2 sorteadas</p>
              </article>
              <article className="min-w-0 rounded-[28px] bg-[#a52751] p-4 text-white sm:p-6">
                <p className="text-[22px] font-medium leading-tight sm:text-[28px]">Meses 4 e 8</p>
                <p className="mt-2 text-[15px] leading-snug sm:text-[17px]">Sorteio especial: 3 sorteadas</p>
              </article>
            </div>
            <p className="mt-3 text-[13px] leading-snug text-[#6B5560]">24 pessoas por grupo</p>
            <article className="mt-6 rounded-[28px] bg-[#F2C9D666] p-5">
              <p className="inline-flex rounded-full bg-[#a52751] px-2.5 py-0.5 text-[12px] font-medium text-white">Ganhe ao assinar</p>
              <p className="mt-3 text-[17px] leading-snug">Assinou, já ganhou: um procedimento na hora + acesso à tabela de descontos de todos os procedimentos da clínica.</p>
            </article>
          </div>
        </section>

        <section className="px-[22px] pb-14 md:pb-20">
          <div className="mx-auto max-w-[980px]">
            <h2 className="text-balance text-[clamp(28px,4vw,40px)] leading-[1.08]">Um ano no Suprema, por exemplo.</h2>
            <div className="mt-6">
              <ExemploAno />
            </div>
            <div className="mt-8">
              <ConviteLista />
            </div>
          </div>
        </section>

        <section id="servicos" className="scroll-mt-16 bg-[#F7F2EF] px-[22px] py-14 md:py-24">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="text-balance text-[clamp(32px,5vw,56px)] leading-[1.05]">Procedimentos.</h2>
            <p className="mt-3 max-w-[36rem] text-[17px] leading-snug text-[#6B5560]">O preço da tabela e o preço de quem está no clube.</p>
            <div className="mt-8">
              <TabelaProcedimentos planos={planos} />
            </div>
            <div className="mt-8">
              <ConviteLista />
            </div>
          </div>
        </section>

        <section className="px-[22px] py-14 md:py-24">
          <div className="mx-auto max-w-[720px]">
            <h2 className="text-balance text-[clamp(32px,5vw,56px)] leading-[1.05]">Perguntas.</h2>
            <Accordion type="single" collapsible className="mt-8 rounded-[28px] border border-[#E4D9D3] bg-white px-5">
              {faq.map((item, indice) => (
                <AccordionItem key={item.pergunta} value={`item-${indice}`} className="border-[#E4D9D3]">
                  <AccordionTrigger className="text-left text-[17px] hover:no-underline">{item.pergunta}</AccordionTrigger>
                  <AccordionContent className="text-[15px] text-[#6B5560]">{item.resposta}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-8">
              <ConviteLista />
            </div>
          </div>
        </section>

        <section className="px-[22px] pb-8">
          <div className="mx-auto max-w-[1120px] rounded-[28px] bg-[#2A1420] px-6 py-12 text-white md:px-12 md:py-16">
            <h2 className="text-balance text-[clamp(32px,5vw,56px)] leading-[1.05]">Entre na lista.</h2>
            <p className="mt-3 max-w-[32rem] text-[17px] leading-snug text-[#C9B8C0]">{PROMESSA_CURTA}</p>
            <div className="mt-8">
              <ConviteLista />
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[rgba(22,22,23,0.8)] px-[22px] py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[20px] backdrop-saturate-[1.8] md:hidden">
        <ConviteLista className="w-full" />
      </div>
    </div>
  )
}
