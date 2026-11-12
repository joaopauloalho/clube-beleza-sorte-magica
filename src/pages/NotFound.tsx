import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F2EF] px-6">
      <div className="text-center">
        <h1 className="text-[40px] font-semibold tracking-tight">Página não encontrada.</h1>
        <Button asChild className="mt-6"><Link to="/">Voltar ao início</Link></Button>
      </div>
    </div>
  )
}
