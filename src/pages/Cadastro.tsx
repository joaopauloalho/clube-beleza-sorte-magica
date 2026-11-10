import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Sparkles } from 'lucide-react'
import { listaEsperaSchema, maskWhatsApp, type ListaEsperaData } from '@/lib/validations'
import { formatBRL, getPlanBySlug, PLAN_LIST, type Plan } from '@/lib/plans'
import { REGULAMENTO_ACEITE, WHATSAPP_ACEITE } from '@/lib/consent-text'

export default function Cadastro() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const slugParam = searchParams.get('plano') ?? ''
  const preselectedPlan = getPlanBySlug(slugParam)

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(preselectedPlan ?? null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ListaEsperaData>({
    resolver: zodResolver(listaEsperaSchema),
    defaultValues: {
      plano: preselectedPlan?.name,
      aceita_regulamento: false,
      optin_whatsapp: false,
    },
  })

  const onSubmit = async (data: ListaEsperaData) => {
    setSubmitError(null)
    try {
      const res = await fetch('/api/lista-espera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json() as { ok?: boolean; error?: string }
      if (!res.ok) {
        setSubmitError(json.error ?? 'Não foi possível entrar na lista. Tente novamente.')
        return
      }
      setDone(true)
    } catch {
      setSubmitError('Erro de conexão. Verifique sua internet e tente novamente.')
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader>
            <Clock className="h-12 w-12 text-purple-500 mx-auto mb-2" />
            <CardTitle className="text-2xl">Você está na lista de espera</CardTitle>
            <CardDescription className="text-base mt-2">
              Ninguém é cobrado enquanto o grupo deste plano não tiver 24 pessoas. A cobrança, quando existir, será só por Pix Automático.
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Escolha seu plano</h1>
          <p className="text-gray-500 text-sm mb-4">
            A escolha entra na lista de espera. Não há pagamento nesta etapa.
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
                  <p className="text-2xl font-bold text-pink-600 mt-1">R$ {formatBRL(plan.price)}</p>
                  <p className="text-xs text-gray-500">por mês · 12 meses</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-600">Crédito se sorteado: R$ {formatBRL(plan.credit)}</p>
                    <p className="text-xs text-gray-600">Em 12 meses: R$ {formatBRL(plan.total12)} · bônus {plan.clinicBonus}</p>
                    <p className="text-xs text-gray-600">Preço de membro: {plan.memberDiscount} de desconto</p>
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

        <Card>
          <CardHeader>
            <Badge className="w-fit bg-amber-100 text-amber-800 mb-2 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Vagas limitadas — 24 por grupo
            </Badge>
            <CardTitle>Lista de espera</CardTitle>
            <CardDescription>
              Nome e WhatsApp. O aceite do regulamento é obrigatório. O WhatsApp é um opt-in separado e opcional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('plano')} />

              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome completo"
                  {...register('nome')}
                  className={`mt-1 ${errors.nome ? 'border-red-500' : ''}`}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
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

              <div className="flex items-start gap-2">
                <Controller
                  name="aceita_regulamento"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="aceita_regulamento"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  )}
                />
                <Label htmlFor="aceita_regulamento" className="text-xs text-gray-600 font-normal">
                  {REGULAMENTO_ACEITE}
                </Label>
              </div>
              {errors.aceita_regulamento && (
                <p className="text-red-500 text-xs">{errors.aceita_regulamento.message}</p>
              )}

              <div className="flex items-start gap-2">
                <Controller
                  name="optin_whatsapp"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="optin_whatsapp"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  )}
                />
                <Label htmlFor="optin_whatsapp" className="text-xs text-gray-600 font-normal">
                  {WHATSAPP_ACEITE}
                </Label>
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
                  ? 'Enviando...'
                  : selectedPlan
                  ? 'Entrar na lista de espera'
                  : 'Selecione um plano acima'}
              </Button>

              <p className="text-xs text-center text-gray-400">
                Sem cartão e sem Pix nesta etapa. A cobrança só existe com o grupo completo.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
