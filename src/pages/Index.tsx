import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Gift, Trophy, Sparkles, Star, Users, Shield } from "lucide-react";
import { AnimatedSection, StaggeredChildren } from "@/hooks/use-scroll-animation";
import heroImage from "@/assets/hero-woman.jpg";
import { formatBRL, PLAN_LIST } from "@/lib/plans";
import { DRAW_MONTHS, formatPercent } from "@/lib/sorteio";

const Index = () => {
  const navigate = useNavigate()

  const steps = [
    { icon: Sparkles, title: "1. Entre na lista", desc: "Nome e WhatsApp. Sem cobrança nesta etapa." },
    { icon: Users, title: "2. O grupo fecha", desc: "24 pessoas no mesmo plano. Antes disso, ninguém é cobrado." },
    { icon: Shield, title: "3. Pix Automático", desc: "A mensalidade só começa com o grupo completo. Sem cartão." },
    { icon: Trophy, title: "4. Sorteio do mês", desc: "2 pessoas em dia recebem o crédito. Em até 12 meses, quem segue em dia recebe." }
  ];

  const chanceHighlights = DRAW_MONTHS.filter((month) => month.month === 1 || month.month === 6 || month.month === 12)

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-3xl">
            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in">
              Clube Beleza
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in [animation-delay:200ms] opacity-0">
              Lista de espera para grupos de 24 pessoas. A mensalidade é por Pix Automático e o crédito completo em serviços depende de ser sorteado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:400ms] opacity-0">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white shadow-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => navigate('/cadastro')}
              >
                Entrar na lista de espera
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
              >
                Saiba Como Funciona
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-in [animation-delay:600ms] opacity-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Grupos de 24 pessoas</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Cobrança só com o grupo completo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Como Funciona o Clube
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Lista de espera, grupo fechado e sorteio mensal. Veja a ordem:
            </p>
          </AnimatedSection>
          
          <StaggeredChildren className="grid md:grid-cols-4 gap-8" staggerDelay={150}>
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-medium group-hover:scale-110 group-hover:animate-float transition-transform duration-300">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </StaggeredChildren>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20 bg-rose-light">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Escolha Seu Plano de Beleza
            </h2>
            <p className="text-lg text-muted-foreground">
              Mensalidade, crédito se for sorteado e preço de membro enquanto espera
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLAN_LIST.map((plan, index) => (
              <AnimatedSection
                key={index}
                animation={index === 0 ? "fade-left" : index === 2 ? "fade-right" : "fade-up"}
                delay={index * 150}
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-500 hover:shadow-gold hover:-translate-y-2 ${
                    plan.recommended ? 'ring-2 ring-gold shadow-gold animate-pulse-glow' : ''
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 bg-gradient-gold text-white px-4 py-1 rounded-bl-lg">
                      <span className="text-sm font-semibold">Mais Vantajoso</span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="font-playfair text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">R$ {formatBRL(plan.price)}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <CardDescription>Por 12 meses · R$ {formatBRL(plan.total12)} no total</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 group/item">
                        <Gift className="w-5 h-5 text-gold transition-transform duration-300 group-hover/item:scale-110" />
                        <div>
                          <p className="font-semibold">R$ {formatBRL(plan.credit)} se sorteado</p>
                          <p className="text-sm text-muted-foreground">Crédito em serviços. Bônus da clínica {plan.clinicBonus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 group/item">
                        <Trophy className="w-5 h-5 text-gold transition-transform duration-300 group-hover/item:scale-110" />
                        <div>
                          <p className="font-semibold">R$ {formatBRL(plan.total12)} em 12 meses</p>
                          <p className="text-sm text-muted-foreground">O crédito completo depende do sorteio</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 group/item">
                        <Star className="w-5 h-5 text-gold transition-transform duration-300 group-hover/item:scale-110" />
                        <div>
                          <p className="font-semibold">{plan.memberDiscount} de desconto</p>
                          <p className="text-sm text-muted-foreground">Preço de membro enquanto aguarda o sorteio</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">Sem cobrança até o grupo fechar</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">Sorteio mensal: 2 de quem está em dia</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">Preço de membro enquanto aguarda</span>
                      </div>
                      {plan.recommended && (
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-sm">Crédito completo depende do sorteio</span>
                        </div>
                      )}
                    </div>

                    <Button
                      className={`w-full transition-all duration-300 hover:scale-105 ${
                        plan.recommended
                          ? 'bg-gradient-gold hover:opacity-90 text-white shadow-gold'
                          : 'bg-gradient-primary hover:opacity-90 text-white'
                      }`}
                      onClick={() => navigate(`/cadastro?plano=${plan.slug}`)}
                    >
                      Entrar na lista deste plano
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sorteios */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Chance do sorteio
              </h2>
              <p className="text-lg text-muted-foreground">
                No mês m, 2 pessoas em dia são sorteadas entre 24 − 2×(m−1) elegíveis. A chance acumulada de já ter recebido o crédito é m/12.
              </p>
            </AnimatedSection>
            
            <div className="grid md:grid-cols-2 gap-8">
              <AnimatedSection animation="fade-left">
                <Card className="border-primary/20 h-full transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Chance de cada mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">Quem já foi sorteado não concorre de novo. Quem deixa de pagar sai do sorteio. O crédito completo depende de ser sorteado.</p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="font-medium py-1">Mês</th>
                          <th className="font-medium py-1">Sorteio</th>
                          <th className="font-medium py-1">Chance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DRAW_MONTHS.map((month) => (
                          <tr key={month.month}>
                            <td className="py-1">{month.month}</td>
                            <td className="py-1">{month.winners} de {month.eligible}</td>
                            <td className="py-1">{formatPercent(month.monthlyPercent)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-right">
                <Card className="bg-gradient-subtle border-0 h-full transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Chance acumulada (m/12)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {DRAW_MONTHS.map((month) => (
                      <div key={month.month} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Mês {month.month}</span>
                          <span>{month.month}/12 · {formatPercent(month.cumulativePercent, 1)}</span>
                        </div>
                        <div
                          className="w-full bg-muted rounded-full h-2"
                          role="img"
                          aria-label={`Mês ${month.month}: chance acumulada ${formatPercent(month.cumulativePercent, 1)}`}
                        >
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${month.cumulativePercent}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Marcos da chance */}
      <section className="py-20 bg-rose-light">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Chance ao longo dos 12 meses
            </h2>
            <p className="text-lg text-muted-foreground">
              Mês 1, mês 6 e mês 12. Quem se mantém em dia recebe o crédito até o fim do ciclo.
            </p>
          </AnimatedSection>
          
          <StaggeredChildren className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={200}>
            {chanceHighlights.map((month) => (
              <Card key={month.month} className="border-0 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-2">
                <CardContent className="pt-6">
                  <p className="font-semibold text-sm mb-3">Mês {month.month}</p>
                  <p className="text-muted-foreground mb-4">
                    {month.winners} de {month.eligible} ({formatPercent(month.monthlyPercent)})
                  </p>
                  <p className="font-semibold text-sm">Acumulada: {month.month}/12 ({formatPercent(month.cumulativePercent, 1)})</p>
                </CardContent>
              </Card>
            ))}
          </StaggeredChildren>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Dúvidas Frequentes
              </h2>
              <p className="text-lg text-muted-foreground">
                O que já está definido e o que ainda depende de decisão
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="scale">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Quando começa a cobrança?</AccordionTrigger>
                  <AccordionContent>
                    Ninguém é cobrado enquanto o grupo do plano não tiver 24 pessoas. Se o grupo não completar, ninguém é cobrado. A mensalidade, quando existir, é só por Pix Automático, sem cartão. [A DEFINIR: política de cancelamento]
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Qual é a chance do sorteio?</AccordionTrigger>
                  <AccordionContent>
                    No mês m, 2 pessoas em dia são sorteadas entre 24 − 2×(m−1) elegíveis. No mês 1 são 2 de 24 (8%). No mês 6, 2 de 14 (14%). No mês 11, 2 de 4 (50%). No mês 12, 2 de 2 (100%). A chance acumulada de já ter recebido o crédito é m/12. O crédito completo depende de ser sorteado.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>O crédito soma com o desconto de membro?</AccordionTrigger>
                  <AccordionContent>
                    [A DEFINIR: o crédito soma com o desconto de membro ou é usado a preço de tabela?]
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>O crédito é liberado de uma vez?</AccordionTrigger>
                  <AccordionContent>
                    [A DEFINIR: o crédito é liberado de uma vez ou em etapas?]
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Qual a validade do crédito e quais serviços entram?</AccordionTrigger>
                  <AccordionContent>
                    [A DEFINIR: validade do crédito] [A DEFINIR: serviços elegíveis]
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Posso cancelar ou parar de pagar?</AccordionTrigger>
                  <AccordionContent>
                    Quem deixa de pagar sai do sorteio. A autorização do Pix Automático pode ser revogada no aplicativo do banco. [A DEFINIR: política de cancelamento]
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Onde está o regulamento?</AccordionTrigger>
                  <AccordionContent>
                    [A DEFINIR: regulamento]
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-8" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Qual gateway será usado no Pix Automático?</AccordionTrigger>
                  <AccordionContent>
                    [A DEFINIR: gateway e exigência de tempo mínimo de CNPJ para Pix Automático] Por enquanto a integração fica só em modo de teste e a entrada é a lista de espera.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lista de espera do próximo grupo
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Deixe nome e WhatsApp. O opt-in de mensagem é separado e opcional. Ninguém é cobrado até o grupo do plano completar 24 pessoas.
            </p>
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white shadow-medium transition-all duration-300 hover:scale-110 hover:shadow-lg"
              onClick={() => navigate('/cadastro')}
            >
              Entrar na lista de espera
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Index;
