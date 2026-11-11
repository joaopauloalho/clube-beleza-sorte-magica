import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

const link = 'text-[12px] leading-[44px] text-[#f5f5f7]/80 hover:text-[#f5f5f7] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-sm'

export function SiteHeader() {
  const { user, isOperator, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 h-11 bg-[rgba(22,22,23,0.8)] shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-[20px] backdrop-saturate-[1.8]">
      <nav className="mx-auto flex h-full max-w-[1024px] items-center justify-between gap-3 px-[22px]" aria-label="Principal">
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
