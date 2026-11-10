import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Shield, Sparkles, Trophy, Users, type LucideIcon } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraficoChance } from '@/components/GraficoChance'
import { PlanosGrid } from '@/components/PlanosGrid'
import { SiteHeader } from '@/components/SiteHeader'
import { AnimatedSection, StaggeredChildren } from '@/hooks/use-scroll-animation'
import { chanceMensal, elegiveisTeoricos, formatarPercentual } from '@/lib/chance'
import { A_DEFINIR, PASSOS, PROMESSA } from '@/lib/copy'
import heroImage from '@/assets/hero-woman.jpg'

const regras = [
  'Cada grupo tem 24 pessoas no mesmo plano. A cota é um número de 1 a 24.',
  `No mês m, 2 pessoas são sorteadas entre quem ainda não foi sorteada e está em dia. Se ninguém sair, são ${elegiveisTeoricos(1)} no 1º mês.`,
  'Quem já foi sorteada não concorre de novo. Quem para de pagar sai daquele sorteio.',
  'Em até 12 meses, toda integrante que permanecer em dia recebe o crédito em serviços da clínica.',
]

const faq = [
  {
    pergunta: 'Quando a mensalidade começa a ser cobrada?',
    resposta: 'Somente quando o grupo completa 24 pessoas, e somente por Pix Automático. Antes disso ninguém é cobrado.',
  },
  {
    pergunta: 'Qual é a chance no sorteio?',
    resposta: `No mês m, a chance é 2 dividido por (24 − 2 × (m − 1)), se as 24 permanecerem em dia. 1º mês: ${formatarPercentual(chanceMensal(1))}. 6º mês: ${formatarPercentual(chanceMensal(6))}. 11º mês: ${formatarPercentual(chanceMensal(11))}. 12º mês: ${formatarPercentual(chanceMensal(12))}. A chance acumulada de já ter recebido é m/12.`,
  },
  {
    pergunta: 'O crédito soma com o desconto de membro?',
    resposta: A_DEFINIR.creditoSomaDesconto,
  },
  {
    pergunta: 'O crédito é liberado de uma vez ou em etapas?',
    resposta: A_DEFINIR.creditoEtapas,
  },
  {
    pergunta: 'Qual é a validade do crédito e quais serviços entram?',
    resposta: `${A_DEFINIR.validadeCredito} ${A_DEFINIR.servicos}`,
  },
  {
    pergunta: 'Posso cancelar?',
    resposta: A_DEFINIR.cancelamento,
  },
  {
    pergunta: 'Onde leio o regulamento?',
    resposta: A_DEFINIR.regulamento,
  },
  {
    pergunta: 'Pix Automático e o tempo de CNPJ',
    resposta: A_DEFINIR.gatewayCnpj,
  },
]

export default function Index() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteHeader sobreHero />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
        </div>
        <div className="container mx-auto px-4 z-10 pt-24">
          <div className="max-w-3xl">
            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in">
              Sua cota no Clube Beleza
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in [animation-delay:200ms] opacity-0">
              {PROMESSA}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:400ms] opacity-0">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white shadow-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => navigate('/lista-espera')}
              >
                Entrar na lista de espera
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver os planos
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-in [animation-delay:600ms] opacity-0">
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span>Grupos de 24 pessoas</span></div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><span>Cobrança só depois que o grupo fecha</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">Como funciona</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Quatro passos. A cobrança não acontece no primeiro.</p>
          </AnimatedSection>
          <StaggeredChildren className="grid md:grid-cols-4 gap-8" staggerDelay={150}>
            {PASSOS.map((passo, indice) => {
              const Icone = [Sparkles, Users, Shield, Trophy][indice] as LucideIcon
              return (
              <div key={passo.titulo} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-medium group-hover:scale-110 transition-transform duration-300">
                  <Icone className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{passo.titulo}</h3>
                <p className="text-muted-foreground">{passo.descricao}</p>
              </div>
            )})}
          </StaggeredChildren>
        </div>
      </section>

      <section id="planos" className="py-20 bg-rose-light">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">Os três planos</h2>
            <p className="text-lg text-muted-foreground">O crédito completo depende de ser sorteada. A chance vai ao lado do valor.</p>
          </AnimatedSection>
          <PlanosGrid onEscolher={(plano) => navigate(`/adesao?plano=${plano.slug}`)} />
        </div>
      </section>

      <section id="sorteio" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">Regras do sorteio</h2>
              <p className="text-lg text-muted-foreground">A lista de quem podia concorrer fica gravada em cada sorteio.</p>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-8">
              <AnimatedSection animation="fade-left">
                <Card className="border-primary/20 h-full transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" />Como o mês é sorteado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {regras.map((texto, indice) => (
                      <div key={texto} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{indice + 1}</div>
                        <p className="text-sm">{texto}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedSection>
              <AnimatedSection animation="fade-right">
                <Card className="bg-gradient-subtle border-0 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" />Chance acumulada: m/12</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GraficoChance />
                    <p className="text-sm text-muted-foreground mt-4">
                      A linha rosa é a chance daquele mês. A linha dourada é a chance de já ter recebido o crédito até aquele mês, para quem permanece em dia.
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">Dúvidas frequentes</h2>
              <p className="text-lg text-muted-foreground">O que ainda não foi decidido fica marcado. O texto passa por advogado.</p>
            </AnimatedSection>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((item, indice) => (
                <AccordionItem key={item.pergunta} value={`item-${indice}`} className="rounded-lg px-2">
                  <AccordionTrigger>{item.pergunta}</AccordionTrigger>
                  <AccordionContent>{item.resposta}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">Lista de espera, sem cobrança</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Nome, WhatsApp e o aceite do regulamento. A mensagem de WhatsApp é um aceite separado e opcional.
          </p>
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-white shadow-medium"
            onClick={() => navigate('/lista-espera')}
          >
            Quero entrar na lista
          </Button>
        </div>
      </section>
    </div>
  )
}
