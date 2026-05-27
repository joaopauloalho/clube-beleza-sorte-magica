import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Sparkles } from 'lucide-react'
import {
  cadastroComCheckoutSchema,
  maskWhatsApp,
  maskCPF,
  type CadastroComCheckoutData,
} from '@/lib/validations'
import { PLAN_LIST, getPlanBySlug, type Plan } from '@/lib/plans'

export default function Cadastro() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const slugParam = searchParams.get('plano') ?? ''
  const statusParam = searchParams.get('status') ?? ''
  const preselectedPlan = getPlanBySlug(slugParam)

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(preselectedPlan ?? null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CadastroComCheckoutData>({
    resolver: zodResolver(cadastroComCheckoutSchema),
    defaultValues: { plano: preselectedPlan?.name },
  })

  const onSubmit = async (data: CadastroComCheckoutData) => {
    setSubmitError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json() as { checkoutUrl?: string; error?: string }
      if (!res.ok) {
        setSubmitError(json.error ?? 'Erro ao processar cadastro. Tente novamente.')
        return
      }
      if (json.checkoutUrl) window.location.href = json.checkoutUrl
    } catch {
      setSubmitError('Erro de conexão. Verifique sua internet e tente novamente.')
    }
  }

  if (statusParam === 'aguardando') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader>
            <Clock className="h-12 w-12 text-purple-500 mx-auto mb-2" />
            <CardTitle className="text-2xl">Cadastro recebido!</CardTitle>
            <CardDescription className="text-base mt-2">
              Assim que o pagamento for confirmado, você receberá um email com o acesso ao seu painel.
              Caso já tenha pago, aguarde alguns instantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white border-b border-pink-100 px-6 py-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-pink-600" />
        <button
          type="button"
          className="font-bold text-pink-700"
          onClick={() => navigate('/')}
        >
          Clube de Estética
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Plan selection */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Escolha seu plano</h1>
          <p className="text-gray-500 text-sm mb-4">
            Você pode mudar de ideia antes de finalizar o pagamento.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLAN_LIST.map((plan) => {
              const isSelected = selectedPlan?.name === plan.name
              return (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan)
                    setValue('plano', plan.name, { shouldValidate: true })
                  }}
                  className={`text-left rounded-xl border-2 p-4 transition-all focus:outline-none ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-pink-300'
                  }`}
                >
                  {plan.recommended && (
                    <Badge className="mb-2 bg-pink-500 text-white text-xs">Mais vantajoso</Badge>
                  )}
                  <p className="font-semibold text-gray-800 text-sm">{plan.name}</p>
                  <p className="text-2xl font-bold text-pink-600 mt-1">R$ {plan.priceLabel}</p>
                  <p className="text-xs text-gray-500">por mês · 12 meses</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-600">🎁 {plan.gift}</p>
                    <p className="text-xs text-gray-600">🏆 R$ {plan.raffle} no sorteio</p>
                    <p className="text-xs text-gray-600">⭐ {plan.discount} de desconto</p>
                  </div>
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-1 text-pink-600 text-xs font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      Selecionado
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {errors.plano && (
            <p className="text-red-500 text-sm mt-2">{errors.plano.message}</p>
          )}
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <Badge className="w-fit bg-amber-100 text-amber-800 mb-2 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Vagas limitadas — 24 por grupo
            </Badge>
            <CardTitle>Seus dados</CardTitle>
            <CardDescription>
              Preencha para garantir sua vaga. Você será redirecionada para o pagamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('plano')} />

              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome completo"
                  {...register('nome')}
                  className={`mt-1 ${errors.nome ? 'border-red-500' : ''}`}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="(99) 99999-9999"
                  value={watch('whatsapp') ?? ''}
                  onChange={(e) =>
                    setValue('whatsapp', maskWhatsApp(e.target.value), { shouldValidate: true })
                  }
                  className={`mt-1 ${errors.whatsapp ? 'border-red-500' : ''}`}
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={watch('cpf') ?? ''}
                  onChange={(e) =>
                    setValue('cpf', maskCPF(e.target.value), { shouldValidate: true })
                  }
                  className={`mt-1 ${errors.cpf ? 'border-red-500' : ''}`}
                />
                {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !selectedPlan}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white"
              >
                {isSubmitting
                  ? 'Processando...'
                  : selectedPlan
                  ? `Ir para pagamento — R$ ${selectedPlan.priceLabel}/mês`
                  : 'Selecione um plano acima'}
              </Button>

              <p className="text-xs text-center text-gray-400">
                Seus dados estão protegidos. Você será redirecionada para o ambiente seguro de pagamento.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
