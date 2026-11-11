import { useNavigate } from 'react-router-dom'
import { Calendar, ClipboardList, Wallet } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ExemploAno } from '@/components/ExemploAno'
import { CarrosselEntrada } from '@/components/CarrosselEntrada'
import { ConviteLista } from '@/components/ConviteLista'
import { PlanosGrid } from '@/components/PlanosGrid'
import { TabelaProcedimentos } from '@/components/TabelaProcedimentos'
import { SiteHeader } from '@/components/SiteHeader'
import { A_DEFINIR, CTA_PLANOS, imaginePrimeiraMensalidade, LINHA_SORTEIO, NOME_DO_CLUBE, PROMESSA_CURTA, REGRA_SORTEIO } from '@/lib/copy'
import { usePlanosPublicos } from '@/lib/use-planos-publicos'
import heroImage from '@/assets/hero-woman.jpg'

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

const linkPlano = 'inline-flex min-h-11 items-center rounded-sm text-[17px] text-[#841f41] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#841f41]'

export default function Index() {
  const navigate = useNavigate()
  const planos = usePlanosPublicos()
  const destaque = planos.find((plano) => plano.destaque) ?? planos[planos.length - 1]

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <SiteHeader />
      <main id="conteudo" className="pb-24 md:pb-16">
        <section className="px-[22px] pb-4 pt-4 md:pt-8">
          <div className="mx-auto grid max-w-[1120px] items-stretch gap-3 md:grid-cols-12 md:gap-4">
            <article className="flex flex-col justify-between rounded-[28px] bg-[#f5f5f7] p-6 md:col-span-7 md:p-10">
              <div>
                <h1 className="text-balance text-[clamp(44px,6vw,76px)] leading-[1.02]">{NOME_DO_CLUBE}.</h1>
                <p className="mt-5 max-w-[34rem] text-pretty text-[clamp(17px,2vw,21px)] leading-snug text-[#6e6e73]">
                  {imaginePrimeiraMensalidade(destaque.mensalidade, destaque.credito)}
                </p>
                <p className="mt-3 max-w-[34rem] text-[14px] leading-snug text-[#6e6e73]">{LINHA_SORTEIO}</p>
              </div>
              <div className="mt-8 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-5">
                <ConviteLista />
                <a href="#planos" className={linkPlano}>{CTA_PLANOS} ›</a>
              </div>
            </article>

            <CarrosselEntrada planos={planos} />

            <article className="overflow-hidden rounded-[28px] md:col-span-7">
              <img
                src={heroImage}
                alt=""
                width={1200}
                height={750}
                fetchPriority="high"
                className="h-full min-h-[240px] w-full object-cover aspect-[4/3] md:aspect-auto md:min-h-[340px]"
              />
            </article>

            <article className="flex flex-col justify-center rounded-[28px] bg-[#f5f5f7] p-6 md:col-span-5 md:p-8">
              <p className="text-balance text-[17px] leading-snug">{REGRA_SORTEIO}</p>
              <p className="mt-3 text-[13px] leading-snug text-[#6e6e73]">{A_DEFINIR.atraso}</p>
            </article>
          </div>
        </section>

        <section id="planos" className="scroll-mt-16 bg-[#f5f5f7] px-3 py-14 sm:px-[22px] md:py-24">
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
              {[
                [ClipboardList, '1', 'Escolha seu plano'],
                [Wallet, '2', 'Pague a mensalidade'],
                [Calendar, '3', 'Todo dia 10 tem sorteio'],
              ].map(([Icone, numero, titulo]) => (
                <li key={numero} className="flex items-center gap-3">
                  <Icone className="h-6 w-6 shrink-0 text-[#a52751] stroke-[1.5]" aria-hidden="true" />
                  <span className="text-[17px] leading-snug"><span className="text-[#a52751]">{numero}</span> {titulo}</span>
                </li>
              ))}
            </ol>
            <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['24', 'pessoas por grupo', '24 pessoas por grupo', false],
                ['2', 'sorteadas todo mês', '2 sorteadas todo mês', false],
                ['3', 'Meses 4 e 8', 'Meses 4 e 8: 3 sorteadas', true],
                ['12', 'todas até o mês 12', 'Todas sorteadas até o mês 12', false],
              ].map(([numero, titulo, rotulo, especial]) => (
                <li
                  key={rotulo}
                  aria-label={rotulo}
                  className={`rounded-2xl p-3 sm:p-4 ${especial ? 'bg-[#a52751] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}
                >
                  <p className="text-[32px] font-medium tabular-nums leading-none sm:text-[40px]">{numero}</p>
                  <p className={`mt-2 text-[12px] leading-tight ${especial ? 'text-white' : 'text-[#6e6e73]'}`}>{titulo}</p>
                </li>
              ))}
            </ol>
            <article className="mt-6 rounded-[28px] bg-[#fdf2f6] p-5">
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
          </div>
        </section>

        <section id="servicos" className="scroll-mt-16 bg-[#f5f5f7] px-[22px] py-14 md:py-24">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="text-balance text-[clamp(32px,5vw,56px)] leading-[1.05]">Procedimentos.</h2>
            <p className="mt-3 max-w-[36rem] text-[17px] leading-snug text-[#6e6e73]">O preço da tabela e o preço de quem está no clube.</p>
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
            <Accordion type="single" collapsible className="mt-8 rounded-[28px] bg-[#f5f5f7] px-5">
              {faq.map((item, indice) => (
                <AccordionItem key={item.pergunta} value={`item-${indice}`} className="border-[#e8e8ed]">
                  <AccordionTrigger className="text-left text-[17px] hover:no-underline">{item.pergunta}</AccordionTrigger>
                  <AccordionContent className="text-[15px] text-[#6e6e73]">{item.resposta}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-8">
              <ConviteLista />
            </div>
          </div>
        </section>

        <section className="px-[22px] pb-8">
          <div className="mx-auto max-w-[1120px] rounded-[28px] bg-black px-6 py-12 text-white md:px-12 md:py-16">
            <h2 className="text-balance text-[clamp(32px,5vw,56px)] leading-[1.05]">Entre na lista.</h2>
            <p className="mt-3 max-w-[32rem] text-[17px] leading-snug text-[#a1a1a6]">{PROMESSA_CURTA}</p>
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
