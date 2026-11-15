import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Operador } from './useOperador'

export function SimularPagamento({ chamar }: { chamar: Operador['chamar'] }) {
  const [id, setId] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  async function simular() {
    const r = await chamar('/api/dev/simular-pagamento', { id })
    setAviso(r.erro ?? 'Simulação de checkout transparente aceita em devMode.')
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="text-[#6B5560]">Usa POST /transparents/simulate-payment e só segue em devMode. Não autoriza Pix Automático.</p>
      <div className="flex gap-3">
        <Input aria-label="Id do checkout transparente" value={id} onChange={(e) => setId(e.target.value)} placeholder="id do checkout transparente" />
        <Button variant="outline" onClick={() => void simular()}>Simular</Button>
      </div>
      {aviso && <p role="status">{aviso}</p>}
    </div>
  )
}
