import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase, supabaseConfigured } from '@/lib/supabase'

export default function Entrar() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)
    if (!supabaseConfigured) {
      setErro('O Supabase ainda não está configurado.')
      return
    }
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setEnviando(false)
    if (error) {
      setErro('E-mail ou senha não conferem.')
      return
    }
    navigate('/area')
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 max-w-md">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="font-playfair text-3xl">Entrar</CardTitle>
            <CardDescription>Área da integrante e, para quem tem papel, o painel de operação.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={entrar}>
              <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="senha">Senha</Label><Input id="senha" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} required /></div>
              {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
              <Button type="submit" className="w-full bg-gradient-primary text-white" disabled={enviando}>Entrar</Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4">Ainda sem cota? <Link className="text-primary underline" to="/adesao">Fazer a adesão</Link></p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
