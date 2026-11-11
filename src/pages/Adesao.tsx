import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { PlanosGrid } from '@/components/PlanosGrid'
import { LinhaDeCredito } from '@/components/LinhaDeCredito'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { A_DEFINIR, LINHA_CHANCE, TEXTO_OPTIN_WHATSAPP, TEXTO_REGULAMENTO } from '@/lib/copy'
import { getPlanBySlug, type Plan } from '@/lib/plans'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { adesaoSchema, maskCPF, maskWhatsApp } from '@/lib/validations'

interface Reserva {
  membro_id: string
  cota: number
  grupo_id: string
  grupo_nome: string
  vagas: number
  total: number
  completo: boolean
  status: string
}

interface Cobranca {
  cobranca: boolean
  motivo: string
  aviso: string | null
  checkoutUrl?: string | null
  brCode?: string | null
  brCodeBase64?: string | null
}

const ERROS: Record<string, string> = {
  email_existente: `Este e-mail já está na base. Nenhum cadastro antigo foi alterado. ${A_DEFINIR.vinculoLead}`,
  whatsapp_existente: 'Este WhatsApp já está na base. Nenhum cadastro antigo foi alterado.',
  cpf_existente: 'Este CPF já está na base. Nenhum cadastro antigo foi alterado.',
  plano_inexistente: 'O plano ainda não está disponível no banco. Rode as migrations antes da adesão.',
  nao_autenticado: 'Entre com o e-mail para reservar a cota.',
  conflito: 'Não foi possível reservar a cota. Nenhum cadastro antigo foi alterado.',
}

export default function Adesao() {
  const [params] = useSearchParams()
  const inicial = getPlanBySlug(params.get('plano'))
  const [passo, setPasso] = useState(inicial ? 2 : 1)
  const [plano, setPlano] = useState<Plan | null>(inicial ?? null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cpf, setCpf] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [aceitou, setAceitou] = useState(false)
  const [optIn, setOptIn] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [cobranca, setCobranca] = useState<Cobranca | null>(null)

  const titulo = useMemo(() => ['Plano', 'Dados', 'Confirmação'][passo - 1], [passo])

  async function reservar(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)
    if (!plano) return
    const validacao = adesaoSchema.safeParse({
      plano: plano.slug,
      nome,
      email,
      senha,
      cpf,
      whatsapp,
      aceitouRegulamento: aceitou,
      optInWhatsapp: optIn,
    })
    if (!validacao.success) {
      setErro(validacao.error.issues[0]?.message ?? 'Confira os dados.')
      return
    }
    if (!supabaseConfigured) {
      setErro('O Supabase ainda não está configurado. Nenhuma cota foi reservada e ninguém foi cobrado.')
      return
    }
    setEnviando(true)
    const cadastro = await supabase.auth.signUp({ email: validacao.data.email, password: validacao.data.senha })
    let sessao = cadastro.data.session
    if (!sessao) {
      const login = await supabase.auth.signInWithPassword({ email: validacao.data.email, password: validacao.data.senha })
      sessao = login.data.session
      if (!sessao && cadastro.error && !login.error) {
        setEnviando(false)
        setErro('A conta foi criada, mas a sessão depende da confirmação do e-mail. Nenhuma cota foi reservada e ninguém foi cobrado.')
        return
      }
    }
    if (!sessao) {
      setEnviando(false)
      setErro(cadastro.error?.message ?? 'Não foi possível entrar. Nenhuma cota foi reservada.')
      return
    }

    const { data, error } = await supabase.rpc('reservar_cota', {
      p_plano_slug: plano.slug,
      p_nome: validacao.data.nome,
      p_cpf: validacao.data.cpf,
      p_whatsapp: validacao.data.whatsapp,
      p_aceitou_regulamento: true,
      p_opt_in_whatsapp: validacao.data.optInWhatsapp,
    })
    if (error || !(data as { ok?: boolean })?.ok) {
      setEnviando(false)
      const codigo = (data as { erro?: string } | null)?.erro
      setErro(ERROS[codigo ?? ''] ?? 'Não foi possível reservar a cota. Nenhum cadastro antigo foi alterado.')
      return
    }
    const reservada = data as Reserva
    setReserva(reservada)

    const resposta = await fetch('/api/adesao/cobranca', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessao.access_token}` },
    })
    const json = await resposta.json().catch(() => null) as (Cobranca & { erro?: string }) | null
    setEnviando(false)
    if (!resposta.ok || !json || json.erro) {
      setCobranca({
        cobranca: false,
        motivo: 'pix_nao_liberado',
        aviso: json?.erro ?? `${A_DEFINIR.pixLiberacao} A cota foi reservada, mas a cobrança não foi criada.`,
      })
    } else {
      setCobranca(json)
    }
    setPasso(3)
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <p className="text-sm text-muted-foreground mb-2">Passo {passo} de 3 · {titulo}</p>
        <h1 className="font-playfair text-4xl font-bold mb-8">Entrar no clube</h1>

        {passo === 1 && (
          <PlanosGrid
            selecionado={plano?.slug}
            onEscolher={(escolhido) => {
              setPlano(escolhido)
              setPasso(2)
            }}
          />
        )}

        {passo === 2 && plano && (
          <Card className="max-w-xl mx-auto shadow-medium">
            <CardHeader>
              <CardTitle className="font-playfair text-2xl">{plano.nome}</CardTitle>
              <CardDescription>O e-mail cria o acesso à área da integrante. A cota só é reservada com a sessão aberta.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={reservar}>
                <div className="space-y-2"><Label htmlFor="nome">Nome</Label><Input id="nome" value={nome} onChange={(event) => setNome(event.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" autoComplete="new-password" value={senha} onChange={(event) => setSenha(event.target.value)} required /></div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" inputMode="numeric" value={cpf} onChange={(event) => setCpf(maskCPF(event.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" inputMode="tel" value={whatsapp} onChange={(event) => setWhatsapp(maskWhatsApp(event.target.value))} required />
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground max-h-36 overflow-auto">{TEXTO_REGULAMENTO}</div>
                <div className="flex items-start gap-3">
                  <Checkbox id="regulamento" checked={aceitou} onCheckedChange={(valor) => setAceitou(valor === true)} />
                  <Label htmlFor="regulamento">Aceito o regulamento. Obrigatório.</Label>
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{TEXTO_OPTIN_WHATSAPP}</p>
                  <div className="flex items-start gap-3">
                    <Checkbox id="optin" checked={optIn} onCheckedChange={(valor) => setOptIn(valor === true)} />
                    <Label htmlFor="optin">Aceite de WhatsApp, opcional e separado.</Label>
                  </div>
                </div>
                {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setPasso(1)}>Voltar</Button>
                  <Button type="submit" className="bg-gradient-primary text-white" disabled={enviando}>
                    {enviando ? 'Reservando…' : 'Reservar cota'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {passo === 3 && plano && reserva && (
          <Card className="max-w-xl mx-auto shadow-medium">
            <CardHeader>
              <CardTitle className="font-playfair text-2xl">Cota reservada</CardTitle>
              <CardDescription>{reserva.grupo_nome} · cota {reserva.cota} · {reserva.vagas} de {reserva.total}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LinhaDeCredito mensalidade={plano.mensalidade} credito={plano.credito} />
              <p className="text-sm text-muted-foreground">{LINHA_CHANCE} {A_DEFINIR.creditoEtapas}</p>
              {cobranca?.cobranca && cobranca.checkoutUrl ? (
                <div className="space-y-3">
                  <p className="text-sm">O grupo fechou. Autorize o Pix Automático no checkout de teste. A assinatura só existe depois do pagamento.</p>
                  {cobranca.brCodeBase64 && (
                    <img
                      src={cobranca.brCodeBase64.startsWith('data:') ? cobranca.brCodeBase64 : `data:image/png;base64,${cobranca.brCodeBase64}`}
                      alt="QR Code do Pix Automático"
                      className="mx-auto w-48 h-48 rounded-lg border"
                    />
                  )}
                  <Button asChild className="w-full bg-gradient-primary text-white">
                    <a href={cobranca.checkoutUrl}>Autorizar Pix Automático</a>
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg bg-secondary p-4 text-sm space-y-2">
                  <p>{cobranca?.aviso ?? A_DEFINIR.pixLiberacao}</p>
                  <p>Nenhuma cobrança foi criada neste passo.</p>
                </div>
              )}
              <Button asChild variant="outline" className="w-full"><a href="/area">Ir para a área da integrante</a></Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
