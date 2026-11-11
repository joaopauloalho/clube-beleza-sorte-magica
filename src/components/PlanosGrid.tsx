import { CheckCircle2, Sparkles, Star, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { A_DEFINIR, CTA_PLANO, LINHA_CHANCE } from '@/lib/copy'
import { formatarReais } from '@/lib/format'
import { formatarPercentual } from '@/lib/chance'
import { PLANS, type Plan } from '@/lib/plans'
import { LinhaDeCredito } from '@/components/LinhaDeCredito'
import { AnimatedSection } from '@/hooks/use-scroll-animation'

export function PlanosGrid({
  selecionado,
  onEscolher,
}: {
  selecionado?: string
  onEscolher: (plano: Plan) => void
}) {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {PLANS.map((plano, index) => (
        <AnimatedSection
          key={plano.slug}
          animation={index === 0 ? 'fade-left' : index === 2 ? 'fade-right' : 'fade-up'}
          delay={index * 150}
        >
          <Card className={`relative h-full overflow-hidden transition-all duration-500 hover:shadow-gold hover:-translate-y-2 ${
            plano.destaque || selecionado === plano.slug ? 'ring-2 ring-gold shadow-gold' : ''
          }`}>
            {plano.destaque && (
              <div className="absolute top-0 right-0 bg-gradient-gold text-white px-4 py-1 rounded-bl-lg">
                <span className="text-sm font-semibold">Destaque</span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-playfair text-2xl">{plano.nome}</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">{formatarReais(plano.mensalidade)}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <CardDescription>12 meses · {formatarReais(plano.total12)} no total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Trophy className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <LinhaDeCredito mensalidade={plano.mensalidade} credito={plano.credito} />
                    <p className="text-sm text-muted-foreground">{LINHA_CHANCE} {A_DEFINIR.creditoEtapas}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-semibold">Bônus da clínica: {formatarPercentual(plano.bonusClinica)}</span>
                    <span className="block text-muted-foreground">Sobre os {formatarReais(plano.total12)} pagos em 12 meses.</span>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-semibold">Preço de membro: {formatarPercentual(plano.precoMembro)} a menos</span>
                    <span className="block text-muted-foreground">Enquanto a pessoa não é sorteada. {A_DEFINIR.creditoSomaDesconto}</span>
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" />Grupo de 24 pessoas neste plano</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" />Cobrança só com o grupo completo</div>
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary" />2 pessoas sorteadas por mês, entre quem está em dia</div>
              </div>
              <Button
                className={`w-full transition-all duration-300 hover:scale-105 ${
                  plano.destaque
                    ? 'bg-gradient-gold hover:opacity-90 text-white shadow-gold'
                    : 'bg-gradient-primary hover:opacity-90 text-white'
                }`}
                onClick={() => onEscolher(plano)}
              >
                {CTA_PLANO}
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>
      ))}
    </div>
  )
}
