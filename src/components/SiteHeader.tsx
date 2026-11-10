import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export function SiteHeader({ sobreHero = false }: { sobreHero?: boolean }) {
  const { user, isOperator, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className={sobreHero
      ? 'absolute top-0 inset-x-0 z-20'
      : 'border-b border-border bg-background/90 backdrop-blur'}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-playfair text-xl font-semibold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Clube Beleza
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Button variant="ghost" onClick={() => navigate('/lista-espera')}>Lista de espera</Button>
          {user ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/area')}>Minha área</Button>
              {isOperator && <Button variant="ghost" onClick={() => navigate('/operador')}>Operação</Button>}
              <Button variant="outline" onClick={() => void signOut()}>Sair</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => navigate('/entrar')}>Entrar</Button>
          )}
        </nav>
      </div>
    </header>
  )
}
