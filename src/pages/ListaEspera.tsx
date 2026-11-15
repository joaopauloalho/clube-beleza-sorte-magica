import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="min-h-screen bg-[#F7F2EF] text-[#2A1420]">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-[560px] px-[22px] py-10">
        <h1 className="text-[34px] font-semibold leading-tight tracking-tight">Lista.</h1>
        <p className="mt-2 text-[17px] text-[#6B5560]">Sem pagamento agora.</p>
        <Card className="mt-8 rounded-[28px] border-0 shadow-none">
          <CardContent className="pt-6">
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
                  <Input id="nome" name="nome" autoComplete="name" className="h-12 rounded-xl text-[17px]" value={nome} onChange={(event) => setNome(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    name="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(maskWhatsApp(event.target.value))}
                    className="h-12 rounded-xl text-[17px]"
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
                {erro && <p className="text-sm text-destructive" role="alert" aria-live="polite">{erro}</p>}
                <Button type="submit" className="h-12 w-full" disabled={enviando}>
                  {enviando ? 'Enviando…' : 'Quero entrar na lista'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
