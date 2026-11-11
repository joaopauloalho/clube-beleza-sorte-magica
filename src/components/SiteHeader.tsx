import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

const link = 'text-[12px] leading-[44px] text-[#f5f5f7]/80 hover:text-[#f5f5f7] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-sm'

export function SiteHeader() {
  const { user, isOperator, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-[rgba(22,22,23,0.8)] pt-[env(safe-area-inset-top)] shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-[20px] backdrop-saturate-[1.8]">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-3 focus:py-2 focus:text-[#1d1d1f]">
        Ir para o conteúdo
      </a>
      <nav className="mx-auto flex h-11 max-w-[1024px] items-center justify-between gap-3 px-[22px]" aria-label="Principal">
        <Link to="/" className="text-[12px] font-medium tracking-tight text-[#f5f5f7] hover:no-underline">
          Clube Beleza
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/lista-espera" className={link}>Lista</Link>
          {user ? (
            <>
              <Link to="/area" className={link}>Área</Link>
              {isOperator && <Link to="/operador" className={link}>Operação</Link>}
              <button type="button" className={link} onClick={() => void signOut()}>Sair</button>
            </>
          ) : (
            <Link to="/entrar" className={link}>Entrar</Link>
          )}
        </div>
      </nav>
    </header>
  )
}
