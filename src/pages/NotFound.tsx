import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="font-playfair text-5xl font-bold">Página não encontrada</h1>
        <Button asChild className="bg-gradient-primary text-white"><Link to="/">Voltar ao início</Link></Button>
      </div>
    </div>
  )
}
