import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="min-h-screen bg-[#F7F2EF] text-[#2A1420]">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-[420px] px-[22px] py-12">
        <h1 className="text-[34px] font-semibold tracking-tight">Entrar.</h1>
        <Card className="mt-8 rounded-[28px] border-0 shadow-none">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={entrar}>
              <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" autoComplete="email" spellCheck={false} className="h-12 rounded-xl text-[17px]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="senha">Senha</Label><Input id="senha" name="password" autoComplete="current-password" className="h-12 rounded-xl text-[17px]" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} required /></div>
              {erro && <p className="text-sm text-destructive" role="alert" aria-live="polite">{erro}</p>}
              <Button type="submit" className="h-12 w-full" disabled={enviando}>Entrar</Button>
            </form>
            <p className="mt-4 text-[14px] text-[#6B5560]">Ainda sem cota? <Link className="text-[#6E1736] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E1736]" to="/adesao">Fazer a adesão ›</Link></p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
