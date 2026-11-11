import { useNavigate } from 'react-router-dom'
import { Calendar, Shield, Sparkles, Users } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Parcelas } from '@/components/Parcelas'
import { PlanosGrid } from '@/components/PlanosGrid'
import { ServicosDoClube } from '@/components/ServicosDoClube'
import { SiteHeader } from '@/components/SiteHeader'
import { DIA_PAGAMENTO, DIA_SORTEIO, fraseDoCiclo } from '@/lib/ciclo'
import { A_DEFINIR, CTA_LISTA, imaginePrimeiraMensalidade, LINHA_CHANCE, LINHA_SORTEIO, PASSOS, PROMESSA_CURTA } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import { maiorCredito, planoEntrada } from '@/lib/planos-publicos'
import { CYCLE_MONTHS } from '@/lib/plans'
import { usePlanosPublicos } from '@/lib/use-planos-publicos'
import heroImage from '@/assets/hero-woman.jpg'

const icones = [Sparkles, Users, Shield, Calendar]

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

export default function Index() {
  const navigate = useNavigate()
  const planos = usePlanosPublicos()
  const entrada = planoEntrada(planos)
  const destaque = planos.find((plano) => plano.destaque) ?? planos[planos.length - 1]
  const teto = maiorCredito(planos)

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <SiteHeader />
      <main id="conteudo">
        <section className="px-[22px] pb-6 pt-10 text-center md:pt-20">
          <div className="mx-auto max-w-[980px]">
            <h1 className="text-balance text-[clamp(40px,8vw,80px)] font-semibold leading-[1.05] tracking-[-0.015em]">
              Clube Beleza.
            </h1>
            <p className="mx-auto mt-4 max-w-[40rem] text-pretty text-[clamp(19px,3vw,28px)] font-normal leading-[1.25] text-[#6e6e73]">
              {imaginePrimeiraMensalidade(destaque.mensalidade, destaque.credito)}
            </p>
            <p className="mx-auto mt-3 max-w-[36rem] text-[14px] leading-snug text-[#6e6e73]">{LINHA_SORTEIO}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/lista-espera')}>{CTA_LISTA}</Button>
              <a
                href="#planos"
                className="rounded-sm text-[17px] text-[#841f41] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#841f41]"
              >
                Ver os planos ›
              </a>
            </div>
          </div>

          <article className="mx-auto mt-10 max-w-[420px] rounded-[28px] bg-[#fdf2f6] px-6 py-7 text-left">
            <p className="text-[13px] text-[#841f41]">{entrada.nomeCurto}</p>
            <p className="mt-1 text-[44px] font-semibold tabular-nums leading-none tracking-tight">
              {formatarReais(entrada.mensalidade)}
              <span className="text-[17px] font-normal text-[#6e6e73]">/mês</span>
            </p>
            <div className="mt-5">
              <Parcelas quantidade={CYCLE_MONTHS} />
              <p className="mt-2 text-[13px] tabular-nums text-[#6e6e73]">{CYCLE_MONTHS} parcelas · {formatarReais(entrada.total12)}</p>
            </div>
          </article>
        </section>

        <section id="sorteio" className="scroll-mt-16 px-[22px] py-10">
          <div className="mx-auto max-w-[640px] text-center">
            <p className="text-[17px] text-[#6e6e73]">{fraseDoCiclo()}</p>
            <div className="mx-auto mt-6 flex max-w-[360px] items-center gap-3">
              <div className="min-w-[72px] rounded-2xl bg-[#f5f5f7] px-3 py-4">
                <p className="text-[28px] font-semibold tabular-nums leading-none">{DIA_PAGAMENTO}</p>
                <p className="mt-1 text-[12px] text-[#6e6e73]">pagamento</p>
              </div>
              <div className="h-px flex-1 bg-[#f3d0dc]" aria-hidden="true" />
              <div className="min-w-[72px] rounded-2xl bg-[#a52751] px-3 py-4 text-white">
                <p className="text-[28px] font-semibold tabular-nums leading-none">{DIA_SORTEIO}</p>
                <p className="mt-1 text-[12px] text-white/80">sorteio</p>
              </div>
            </div>
            <p className="mt-5 text-[20px] font-semibold tabular-nums">até {formatarReais(teto)} em crédito</p>
            <p className="mt-2 text-[14px] text-[#6e6e73]">{LINHA_SORTEIO}</p>
          </div>
        </section>

        <img
          src={heroImage}
          alt=""
          width={1200}
          height={750}
          fetchPriority="high"
          className="mx-auto w-full max-w-[980px] rounded-[28px] object-cover aspect-[4/3] md:aspect-[16/8]"
        />

        <section id="planos" className="scroll-mt-16 px-[22px] py-[clamp(48px,8vw,100px)]">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-balance text-center text-[clamp(32px,5vw,56px)] font-semibold leading-[1.06] tracking-[-0.01em]">Três planos.</h2>
            <div className="mt-8">
              <PlanosGrid planos={planos} onEscolher={(plano) => navigate(`/adesao?plano=${plano.slug}`)} />
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-[22px] py-[clamp(48px,8vw,100px)]">
          <div className="mx-auto grid max-w-[980px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {PASSOS.map((passo, indice) => {
              const Icone = icones[indice] ?? Sparkles
              return (
                <article key={passo.titulo} className="min-h-[140px] rounded-[28px] bg-white p-5">
                  <Icone className="h-5 w-5 text-[#a52751]" aria-hidden="true" />
                  <h2 className="mt-5 text-[17px] font-semibold leading-tight tracking-tight">{passo.titulo.replace(/^\d+\.\s*/, '')}</h2>
                </article>
              )
            })}
          </div>
        </section>

        <section id="servicos" className="scroll-mt-16 px-[22px] py-[clamp(48px,8vw,100px)]">
          <div className="mx-auto max-w-[680px]">
            <h2 className="text-balance text-center text-[clamp(32px,5vw,56px)] font-semibold leading-[1.06] tracking-[-0.01em]">Serviços do clube.</h2>
            <div className="mt-8">
              <ServicosDoClube />
            </div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] px-[22px] py-[clamp(48px,8vw,100px)]">
          <div className="mx-auto max-w-[680px]">
            <h2 className="text-balance text-center text-[clamp(32px,5vw,56px)] font-semibold leading-[1.06] tracking-[-0.01em]">Perguntas.</h2>
            <p className="mt-3 text-center text-[15px] text-[#6e6e73]">{LINHA_CHANCE}</p>
            <Accordion type="single" collapsible className="mt-8 rounded-[28px] bg-white px-5">
              {faq.map((item, indice) => (
                <AccordionItem key={item.pergunta} value={`item-${indice}`} className="border-[#e8e8ed]">
                  <AccordionTrigger className="text-left text-[17px] hover:no-underline focus-visible:ring-2 focus-visible:ring-[#841f41]">{item.pergunta}</AccordionTrigger>
                  <AccordionContent className="text-[15px] text-[#6e6e73]">{item.resposta}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="px-[22px] py-[clamp(48px,8vw,90px)] text-center">
          <h2 className="text-balance text-[clamp(32px,5vw,56px)] font-semibold leading-[1.06] tracking-tight">Entre na lista.</h2>
          <p className="mt-3 text-[17px] text-[#6e6e73]">{PROMESSA_CURTA}</p>
          <Button size="lg" className="mt-8" onClick={() => navigate('/lista-espera')}>{CTA_LISTA}</Button>
        </section>
      </main>
    </div>
  )
}
