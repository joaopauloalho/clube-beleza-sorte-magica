import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TEXTO_OPTIN_WHATSAPP, TEXTO_REGULAMENTO } from '@/lib/copy'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import { listaEsperaSchema, maskWhatsApp } from '@/lib/validations'

export default function ListaEspera() {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [aceitou, setAceitou] = useState(false)
  const [optIn, setOptIn] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [status, setStatus] = useState<'criado' | 'ja_cadastrado' | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)
    const validacao = listaEsperaSchema.safeParse({
      nome,
      whatsapp,
      aceitouRegulamento: aceitou,
      optInWhatsapp: optIn,
    })
    if (!validacao.success) {
      setErro(validacao.error.issues[0]?.message ?? 'Confira os dados.')
      return
    }
    if (!supabaseConfigured) {
      setErro('O Supabase ainda não está configurado neste ambiente. Nenhum dado foi enviado.')
      return
    }
    setEnviando(true)
    const { data, error } = await supabase.rpc('registrar_lista_espera', {
      p_nome: validacao.data.nome,
      p_whatsapp: validacao.data.whatsapp,
      p_aceitou_regulamento: true,
      p_opt_in_whatsapp: validacao.data.optInWhatsapp,
    })
    setEnviando(false)
    if (error) {
      setErro('Não foi possível registrar agora. Nenhum cadastro antigo foi alterado.')
      return
    }
    const resposta = data as { ok?: boolean; status?: string; erro?: string }
    if (!resposta?.ok) {
      setErro(resposta?.erro === 'regulamento' ? 'É preciso aceitar o regulamento.' : 'Não foi possível registrar.')
      return
    }
    setStatus(resposta.status === 'ja_cadastrado' ? 'ja_cadastrado' : 'criado')
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-xl">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="font-playfair text-3xl">Lista de espera</CardTitle>
            <CardDescription>Sem pagamento. O grupo só cobra quando completar 24 pessoas.</CardDescription>
          </CardHeader>
          <CardContent>
            {status ? (
              <div className="space-y-4">
                <p className="text-foreground">
                  {status === 'criado'
                    ? 'Cadastro recebido. Guardamos o texto que você aceitou, com a data.'
                    : 'Este WhatsApp já estava na lista. Não criamos outro cadastro e não alteramos o existente.'}
                </p>
                <Button asChild variant="outline"><Link to="/">Voltar ao início</Link></Button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={enviar}>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    inputMode="tel"
                    autoComplete="tel"
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(maskWhatsApp(event.target.value))}
                    placeholder="(11) 98888-7777"
                    required
                  />
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground max-h-40 overflow-auto">{TEXTO_REGULAMENTO}</div>
                <div className="flex items-start gap-3">
                  <Checkbox id="regulamento" checked={aceitou} onCheckedChange={(valor) => setAceitou(valor === true)} />
                  <Label htmlFor="regulamento" className="leading-snug">Aceito o regulamento acima. Este aceite é obrigatório.</Label>
                </div>
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{TEXTO_OPTIN_WHATSAPP}</p>
                  <div className="flex items-start gap-3">
                    <Checkbox id="optin" checked={optIn} onCheckedChange={(valor) => setOptIn(valor === true)} />
                    <Label htmlFor="optin" className="leading-snug">Quero receber mensagens no WhatsApp. Opcional e separado do regulamento.</Label>
                  </div>
                </div>
                {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
                <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={enviando}>
                  {enviando ? 'Enviando…' : 'Entrar na lista'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
