import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CTA_LISTA } from '@/lib/copy'

/** O mesmo convite, em cada etapa da página. O destino é a lista, sem outro passo. */
export function ConviteLista({ className = '' }: { className?: string }) {
  return (
    <Button asChild size="lg" className={className}>
      <Link to="/lista-espera">{CTA_LISTA}</Link>
    </Button>
  )
}
