import { useNavigate } from 'react-router-dom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ExemploAno } from '@/components/ExemploAno'
import { CarrosselEntrada } from '@/components/CarrosselEntrada'
import { ConviteLista } from '@/components/ConviteLista'
import { PlanosGrid } from '@/components/PlanosGrid'
import { TabelaProcedimentos } from '@/components/TabelaProcedimentos'
import { SiteHeader } from '@/components/SiteHeader'
import { DIA_PAGAMENTO, DIA_SORTEIO, fraseDoCiclo } from '@/lib/ciclo'
import { A_DEFINIR, CTA_PLANOS, imaginePrimeiraMensalidade, LINHA_CHANCE, LINHA_SORTEIO, NOME_DO_CLUBE, PROMESSA_CURTA } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import { maiorCredito } from '@/lib/planos-publicos'
import { usePlanosPublicos } from '@/lib/use-planos-publicos'
import heroImage from '@/assets/hero-woman.jpg'

const faq = [
  { pergunta: 'Quando a mensalidade começa?', resposta: PROMESSA_CURTA },
  { pergunta: 'Como funciona a chance?', resposta: `${LINHA_CHANCE} ${LINHA_SORTEIO}` },
  { pergunta: 'O crédito soma com o desconto de membro?', resposta: A_DEFINIR.creditoSomaDesconto },
  { pergunta: 'O crédito sai de uma vez?', resposta: `${A_DEFINIR.creditoEtapas} ${A_DEFINIR.validadeCredito}` },
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
  const teto = maiorCredito(planos)

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

            <article id="sorteio" className="scroll-mt-16 rounded-[28px] bg-[#f5f5f7] p-6 md:col-span-5 md:p-8">
              <div>
                <p className="text-[17px] leading-snug text-[#6e6e73]">{fraseDoCiclo()}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="min-w-[72px] rounded-2xl bg-white px-3 py-4">
                    <p className="font-sans text-[28px] font-medium tabular-nums leading-none">{DIA_PAGAMENTO}</p>
                    <p className="mt-1 text-[12px] text-[#6e6e73]">pagamento</p>
                  </div>
                  <div className="h-px flex-1 bg-[#f3d0dc]" aria-hidden="true" />
                  <div className="min-w-[72px] rounded-2xl bg-[#a52751] px-3 py-4 text-white">
                    <p className="font-sans text-[28px] font-medium tabular-nums leading-none">{DIA_SORTEIO}</p>
                    <p className="mt-1 text-[12px] text-white">sorteio</p>
                  </div>
                </div>
                <p className="mt-5 font-sans text-[20px] font-medium tabular-nums">até {formatarReais(teto)} em crédito</p>
                <p className="mt-2 text-[14px] leading-snug text-[#6e6e73]">{LINHA_SORTEIO}</p>
              </div>
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
          <div className="mx-auto max-w-[720px]">
            <h2 className="text-balance text-[clamp(32px,5vw,56px)] leading-[1.05]">Um ano no Suprema, por exemplo.</h2>
            <div className="mt-8">
              <ExemploAno />
            </div>
            <div className="mt-8">
              <ConviteLista />
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
            <p className="mt-3 max-w-[36rem] text-[15px] leading-snug text-[#6e6e73]">{LINHA_CHANCE}</p>
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
