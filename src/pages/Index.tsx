import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Gift, Trophy, Sparkles, Star, Users, Shield } from "lucide-react";
import { AnimatedSection, StaggeredChildren } from "@/hooks/use-scroll-animation";
import heroImage from "@/assets/hero-woman.jpg";
import { PLAN_LIST } from "@/lib/plans";

const Index = () => {
  const navigate = useNavigate()

  const steps = [
    { icon: Sparkles, title: "1. Assine o plano", desc: "Escolha o plano ideal para você" },
    { icon: Gift, title: "2. Ganhe na hora", desc: "Receba seu brinde imediatamente" },
    { icon: Trophy, title: "3. Participe dos sorteios", desc: "Todo mês você concorre a créditos" },
    { icon: CheckCircle2, title: "4. Todos ganham", desc: "Garantia de contemplação até o final" }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      text: "Melhor investimento em beleza que já fiz! Ganhei o microagulhamento e já fui sorteada no segundo mês.",
      rating: 5
    },
    {
      name: "Ana Costa",
      text: "Adoro os descontos mensais! Consigo fazer muito mais procedimentos pagando menos. Super recomendo!",
      rating: 5
    },
    {
      name: "Juliana Santos",
      text: "A transparência dos sorteios me conquistou. É tudo muito claro e justo. Estou adorando participar!",
      rating: 5
    }
  ];

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
              Assinou. Ganhou. Embelezou.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in [animation-delay:200ms] opacity-0">
              O primeiro consórcio da beleza com sorteios garantidos, brindes imediatos e descontos exclusivos o ano todo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:400ms] opacity-0">
              <Button
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white shadow-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => navigate('/cadastro')}
              >
                Quero Participar do Clube
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
                <span>+200 mulheres já participam</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% seguro e transparente</span>
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
              Simples, transparente e vantajoso. Veja como transformar sua rotina de beleza:
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
              Todos os planos incluem brindes, sorteios e descontos exclusivos
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
                      <span className="text-3xl font-bold text-primary">R$ {plan.priceLabel}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <CardDescription>Por 12 meses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 group/item">
                        <Gift className="w-5 h-5 text-gold transition-transform duration-300 group-hover/item:scale-110" />
                        <div>
                          <p className="font-semibold">{plan.gift}</p>
                          <p className="text-sm text-muted-foreground">Brinde de R$ {plan.giftValue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 group/item">
                        <Trophy className="w-5 h-5 text-gold transition-transform duration-300 group-hover/item:scale-110" />
                        <div>
                          <p className="font-semibold">R$ {plan.raffle} em créditos</p>
                          <p className="text-sm text-muted-foreground">Para sorteio mensal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 group/item">
                        <Star className="w-5 h-5 text-gold transition-transform duration-300 group-hover/item:scale-110" />
                        <div>
                          <p className="font-semibold">{plan.discount} de desconto</p>
                          <p className="text-sm text-muted-foreground">Em todos os procedimentos</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">Brinde imediato</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">Sorteio mensal</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">Desconto em todos os procedimentos</span>
                      </div>
                      {plan.recommended && (
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-sm">Pode dividir com outra pessoa</span>
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
                      Escolher Este Plano
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Sorteios Transparentes */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Sorteios Justos e Transparentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Nosso sistema garante que todas as participantes sejam contempladas
              </p>
            </AnimatedSection>
            
            <div className="grid md:grid-cols-2 gap-8">
              <AnimatedSection animation="fade-left">
                <Card className="border-primary/20 h-full transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Como funcionam os sorteios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Cada cliente recebe um número fixo de 1 a 24",
                      "Sorteio realizado via plataforma online imparcial",
                      "Resultado aparece na tela em tempo real",
                      "Todos são contemplados até o final do ciclo"
                    ].map((text, idx) => (
                      <div key={idx} className="flex items-start gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 transition-transform duration-300 group-hover:scale-110">
                          {idx + 1}
                        </div>
                        <p className="text-sm">{text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-right">
                <Card className="bg-gradient-subtle border-0 h-full transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Garantias do Clube
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "100% de transparência nos sorteios",
                      "Plataformas certificadas e imparciais",
                      "Todos ganham até o final do ciclo",
                      "Resultados divulgados publicamente"
                    ].map((text, idx) => (
                      <div key={idx} className="flex items-center gap-2 group">
                        <CheckCircle2 className="w-4 h-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-sm">{text}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-rose-light">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              O Que Dizem Nossas Clientes
            </h2>
            <p className="text-lg text-muted-foreground">
              Mais de 200 mulheres já fazem parte do Clube!
            </p>
          </AnimatedSection>
          
          <StaggeredChildren className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={200}>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-2">
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold transition-transform duration-300 hover:scale-125" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
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
                Tudo que você precisa saber sobre o Clube de Estética
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="scale">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>O que acontece se atrasar o pagamento?</AccordionTrigger>
                  <AccordionContent>
                    Em caso de atraso, você continua participando normalmente após regularizar o pagamento. Mantemos sua vaga garantida por até 7 dias de atraso.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Posso dividir o plano com alguém?</AccordionTrigger>
                  <AccordionContent>
                    Sim! No plano Beleza Suprema você pode dividir todos os benefícios com outra pessoa, tornando ainda mais vantajoso.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Posso trocar o brinde?</AccordionTrigger>
                  <AccordionContent>
                    Os brindes são fixos para cada plano, mas você pode usar o valor como crédito para outros procedimentos se preferir.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Preciso continuar pagando depois de ganhar o sorteio?</AccordionTrigger>
                  <AccordionContent>
                    Sim, o pagamento mensal continua durante os 12 meses do ciclo. Isso garante que todos os participantes sejam contemplados.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="transition-all duration-300 hover:bg-muted/50 rounded-lg px-2">
                  <AccordionTrigger>Como recebo o crédito do sorteio?</AccordionTrigger>
                  <AccordionContent>
                    O crédito fica disponível imediatamente após o sorteio e pode ser usado em qualquer procedimento da clínica durante 6 meses.
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
              Você Mais Linda, Mais Maravilhosa
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Não perca a oportunidade de fazer parte do primeiro consórcio da beleza do Brasil.
              Vagas limitadas para o próximo grupo!
            </p>
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white shadow-medium transition-all duration-300 hover:scale-110 hover:shadow-lg"
              onClick={() => navigate('/cadastro')}
            >
              Quero Participar do Clube de Estética
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Index;
