import { useNavigate } from 'react-router-dom'
import { Calendar, Shield, Sparkles, Users } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { PlanosGrid } from '@/components/PlanosGrid'
import { SiteHeader } from '@/components/SiteHeader'
import { A_DEFINIR, CTA_LISTA, imaginePrimeiraMensalidade, LINHA_CHANCE, LINHA_SORTEIO, PASSOS, PROMESSA_CURTA } from '@/lib/copy'
import { PLANS } from '@/lib/plans'
import heroImage from '@/assets/hero-woman.jpg'

const planoDestaque = PLANS.find((plano) => plano.destaque) ?? PLANS[PLANS.length - 1]
const icones = [Sparkles, Users, Shield, Calendar]

const faq = [
  { pergunta: 'Quando a mensalidade começa?', resposta: PROMESSA_CURTA },
  { pergunta: 'Como funciona a chance?', resposta: `${LINHA_CHANCE} ${LINHA_SORTEIO}` },
  { pergunta: 'O crédito soma com o desconto de membro?', resposta: A_DEFINIR.creditoSomaDesconto },
  { pergunta: 'O crédito sai de uma vez?', resposta: `${A_DEFINIR.creditoEtapas} ${A_DEFINIR.validadeCredito}` },
  { pergunta: 'Quais serviços entram?', resposta: A_DEFINIR.servicos },
  { pergunta: 'Posso cancelar?', resposta: A_DEFINIR.cancelamento },
  { pergunta: 'Onde está o regulamento?', resposta: A_DEFINIR.regulamento },
  { pergunta: 'Pix Automático e o CNPJ', resposta: A_DEFINIR.gatewayCnpj },
]

export default function Index() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <SiteHeader />
      <main>
        <section className="px-[22px] pb-8 pt-14 text-center md:pt-24">
          <div className="mx-auto max-w-[980px]">
            <h1 className="text-[clamp(40px,8vw,80px)] font-semibold leading-[1.05] tracking-[-0.015em]">
              Clube Beleza.
            </h1>
            <p className="mx-auto mt-4 max-w-[640px] text-[clamp(19px,3vw,28px)] font-normal leading-[1.2] text-[#86868b]">
              {imaginePrimeiraMensalidade(planoDestaque.mensalidade, planoDestaque.credito)}
            </p>
            <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-snug text-[#6e6e73]">{LINHA_SORTEIO}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/lista-espera')}>{CTA_LISTA}</Button>
              <button
                type="button"
                className="text-[17px] text-[#841f41] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#841f41] rounded-sm"
                onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver os planos ›
              </button>
            </div>
            <p className="mt-6 text-[14px] text-[#6e6e73]">{PROMESSA_CURTA}</p>
          </div>
          <img
            src={heroImage}
            alt=""
            className="mx-auto mt-12 w-full max-w-[980px] rounded-[28px] object-cover aspect-[4/3] md:aspect-[16/8]"
          />
        </section>

        <section className="bg-[#f5f5f7] px-[22px] py-[clamp(60px,10vw,130px)]">
          <div className="mx-auto grid max-w-[980px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {PASSOS.map((passo, indice) => {
              const Icone = icones[indice] ?? Sparkles
              return (
                <article key={passo.titulo} className="min-h-[160px] rounded-[28px] bg-white p-5">
                  <Icone className="h-5 w-5 text-[#a52751]" aria-hidden="true" />
                  <h2 className="mt-6 text-[17px] font-semibold leading-tight tracking-tight">{passo.titulo.replace(/^\d+\.\s*/, '')}</h2>
                  <p className="mt-2 text-[14px] leading-snug text-[#6e6e73]">{passo.descricao}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="planos" className="px-[22px] py-[clamp(60px,10vw,130px)]">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center text-[clamp(32px,5vw,56px)] font-semibold leading-[1.06] tracking-[-0.01em]">Três planos.</h2>
            <div className="mt-10">
              <PlanosGrid onEscolher={(plano) => navigate(`/adesao?plano=${plano.slug}`)} />
            </div>
          </div>
        </section>

        <section id="sorteio" className="bg-[#f5f5f7] px-[22px] py-[clamp(60px,10vw,130px)]">
          <div className="mx-auto max-w-[680px]">
            <h2 className="text-center text-[clamp(32px,5vw,56px)] font-semibold leading-[1.06] tracking-[-0.01em]">O sorteio.</h2>
            <p className="mt-4 text-center text-[17px] text-[#6e6e73]">{LINHA_CHANCE}</p>
            <Accordion type="single" collapsible className="mt-8 rounded-[28px] bg-white px-5">
              {faq.map((item, indice) => (
                <AccordionItem key={item.pergunta} value={`item-${indice}`} className="border-[#e8e8ed]">
                  <AccordionTrigger className="text-left text-[17px] hover:no-underline">{item.pergunta}</AccordionTrigger>
                  <AccordionContent className="text-[15px] text-[#6e6e73]">{item.resposta}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="px-[22px] py-[clamp(60px,10vw,100px)] text-center">
          <h2 className="text-[clamp(32px,5vw,56px)] font-semibold leading-[1.06] tracking-tight">Entre na lista.</h2>
          <p className="mt-3 text-[17px] text-[#6e6e73]">Sem cobrança agora.</p>
          <Button size="lg" className="mt-8" onClick={() => navigate('/lista-espera')}>{CTA_LISTA}</Button>
        </section>
      </main>
    </div>
  )
}
