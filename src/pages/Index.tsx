import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Gift, Trophy, Sparkles, Star, Clock, Users, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-woman.jpg";

const Index = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Em breve entraremos em contato para confirmar sua vaga no Clube de Estética.",
    });
    setFormData({ name: "", email: "", whatsapp: "" });
  };

  const scrollToForm = () => {
    document.getElementById("cadastro")?.scrollIntoView({ behavior: "smooth" });
  };

  const plans = [
    {
      name: "Beleza Essencial",
      price: "49,90",
      gift: "Limpeza de Pele",
      giftValue: "197",
      raffle: "700",
      discount: "10%",
      features: ["Brinde imediato", "Sorteio mensal", "Desconto em todos os procedimentos"],
      recommended: false
    },
    {
      name: "Beleza Radiante",
      price: "69,90",
      gift: "Peeling",
      giftValue: "217",
      raffle: "1.000",
      discount: "15%",
      features: ["Brinde imediato", "Sorteio mensal", "Desconto em todos os procedimentos"],
      recommended: false
    },
    {
      name: "Beleza Suprema",
      price: "99,90",
      gift: "Microagulhamento",
      giftValue: "327",
      raffle: "1.500",
      discount: "20%",
      features: ["Brinde imediato", "Sorteio mensal", "Desconto em todos os procedimentos", "Pode dividir com outra pessoa"],
      recommended: true
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
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in animation-delay-200">
              O primeiro consórcio da beleza com sorteios garantidos, brindes imediatos e descontos exclusivos o ano todo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animation-delay-400">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-white shadow-medium"
                onClick={scrollToForm}
              >
                Quero Participar do Clube
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
              >
                Saiba Como Funciona
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
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
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Como Funciona o Clube
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simples, transparente e vantajoso. Veja como transformar sua rotina de beleza:
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: "1. Assine o plano", desc: "Escolha o plano ideal para você" },
              { icon: Gift, title: "2. Ganhe na hora", desc: "Receba seu brinde imediatamente" },
              { icon: Trophy, title: "3. Participe dos sorteios", desc: "Todo mês você concorre a créditos" },
              { icon: CheckCircle2, title: "4. Todos ganham", desc: "Garantia de contemplação até o final" }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-medium group-hover:scale-110 transition-transform">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20 bg-rose-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Escolha Seu Plano de Beleza
            </h2>
            <p className="text-lg text-muted-foreground">
              Todos os planos incluem brindes, sorteios e descontos exclusivos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all hover:shadow-gold ${
                  plan.recommended ? 'ring-2 ring-gold shadow-gold' : ''
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
                    <span className="text-3xl font-bold text-primary">R$ {plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <CardDescription>Por 12 meses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-gold" />
                      <div>
                        <p className="font-semibold">{plan.gift}</p>
                        <p className="text-sm text-muted-foreground">Brinde de R$ {plan.giftValue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-gold" />
                      <div>
                        <p className="font-semibold">R$ {plan.raffle} em créditos</p>
                        <p className="text-sm text-muted-foreground">Para sorteio mensal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-gold" />
                      <div>
                        <p className="font-semibold">{plan.discount} de desconto</p>
                        <p className="text-sm text-muted-foreground">Em todos os procedimentos</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      plan.recommended 
                        ? 'bg-gradient-gold hover:opacity-90 text-white shadow-gold' 
                        : 'bg-gradient-primary hover:opacity-90 text-white'
                    }`}
                    onClick={scrollToForm}
                  >
                    Escolher Este Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sorteios Transparentes */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Sorteios Justos e Transparentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Nosso sistema garante que todas as participantes sejam contempladas
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Como funcionam os sorteios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <p className="text-sm">Cada cliente recebe um número fixo de 1 a 24</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <p className="text-sm">Sorteio realizado via plataforma online imparcial</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <p className="text-sm">Resultado aparece na tela em tempo real</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      4
                    </div>
                    <p className="text-sm">Todos são contemplados até o final do ciclo</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-subtle border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Garantias do Clube
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">100% de transparência nos sorteios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Plataformas certificadas e imparciais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Todos ganham até o final do ciclo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Resultados divulgados publicamente</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-rose-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              O Que Dizem Nossas Clientes
            </h2>
            <p className="text-lg text-muted-foreground">
              Mais de 200 mulheres já fazem parte do Clube!
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
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
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Dúvidas Frequentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Tudo que você precisa saber sobre o Clube de Estética
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>O que acontece se atrasar o pagamento?</AccordionTrigger>
                <AccordionContent>
                  Em caso de atraso, você continua participando normalmente após regularizar o pagamento. Mantemos sua vaga garantida por até 7 dias de atraso.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Posso dividir o plano com alguém?</AccordionTrigger>
                <AccordionContent>
                  Sim! No plano Beleza Suprema você pode dividir todos os benefícios com outra pessoa, tornando ainda mais vantajoso.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Posso trocar o brinde?</AccordionTrigger>
                <AccordionContent>
                  Os brindes são fixos para cada plano, mas você pode usar o valor como crédito para outros procedimentos se preferir.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Preciso continuar pagando depois de ganhar o sorteio?</AccordionTrigger>
                <AccordionContent>
                  Sim, o pagamento mensal continua durante os 12 meses do ciclo. Isso garante que todos os participantes sejam contemplados.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Como recebo o crédito do sorteio?</AccordionTrigger>
                <AccordionContent>
                  O crédito fica disponível imediatamente após o sorteio e pode ser usado em qualquer procedimento da clínica durante 6 meses.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Formulário de Cadastro */}
      <section id="cadastro" className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-gold">
              <CardHeader className="text-center">
                <Badge className="mx-auto mb-4 bg-gold text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Vagas Limitadas - Apenas 24 por grupo
                </Badge>
                <CardTitle className="font-playfair text-3xl md:text-4xl">
                  Garanta Sua Vaga Agora
                </CardTitle>
                <CardDescription className="text-lg">
                  Novo grupo abre em breve! Seja uma das primeiras.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-gold hover:opacity-90 text-white shadow-gold"
                  >
                    Quero Garantir Minha Vaga Agora
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Ao cadastrar, você concorda com nossos termos e condições.
                    Seus dados estão seguros e não serão compartilhados.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Você Mais Linda, Mais Maravilhosa
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Não perca a oportunidade de fazer parte do primeiro consórcio da beleza do Brasil.
            Vagas limitadas para o próximo grupo!
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 text-white shadow-medium"
            onClick={scrollToForm}
          >
            Quero Participar do Clube de Estética
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;