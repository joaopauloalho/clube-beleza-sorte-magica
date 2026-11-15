import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatarData } from '@/lib/format'
import { linkWhatsapp } from '@/lib/operador-resumo'
import { um, type Operador } from './useOperador'

type Filtro = 'todas' | 'em_dia' | 'atraso' | 'sorteadas' | 'canceladas' | 'leads'

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'em_dia', rotulo: 'Em dia' },
  { id: 'atraso', rotulo: 'Em atraso' },
  { id: 'sorteadas', rotulo: 'Sorteadas' },
  { id: 'canceladas', rotulo: 'Canceladas' },
  { id: 'leads', rotulo: 'Leads' },
]

function situacao(status: string, emDia: boolean, sorteada: boolean): { texto: string; variante: 'default' | 'secondary' | 'outline' | 'destructive' } {
  if (status === 'cancelado') return { texto: 'Cancelada', variante: 'destructive' }
  if (sorteada) return { texto: emDia ? 'Sorteada' : 'Sorteada, em atraso', variante: emDia ? 'default' : 'destructive' }
  if (status === 'aguardando_grupo') return { texto: 'Aguardando grupo', variante: 'outline' }
  return emDia ? { texto: 'Em dia', variante: 'secondary' } : { texto: 'Em atraso', variante: 'destructive' }
}

export function Membros({ op, grupoId }: { op: Operador; grupoId: string }) {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busca, setBusca] = useState('')
  const termo = busca.trim().toLowerCase()

  const linhas = useMemo(() => op.membros.filter((m) => m.grupo_id === grupoId).filter((m) => {
    const sorteada = m.status === 'sorteado' || Boolean(m.data_contemplacao)
    if (filtro === 'em_dia' && !(m.em_dia && m.status !== 'cancelado')) return false
    if (filtro === 'atraso' && !(!m.em_dia && m.status !== 'cancelado' && m.status !== 'aguardando_grupo')) return false
    if (filtro === 'sorteadas' && !sorteada) return false
    if (filtro === 'canceladas' && m.status !== 'cancelado') return false
    return !termo || (um(m.leads)?.nome ?? '').toLowerCase().includes(termo)
  }), [op.membros, grupoId, filtro, termo])

  const idsDeMembros = new Set(op.membros.map((m) => um(m.leads)?.whatsapp).filter(Boolean))
  const soLeads = op.leads.filter((l) => !l.whatsapp || !idsDeMembros.has(l.whatsapp)).filter((l) => !termo || l.nome.toLowerCase().includes(termo))

  return (
    <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
      <CardHeader className="space-y-3">
        <CardTitle className="font-serif text-[24px] font-normal">Membros e leads</CardTitle>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
          {FILTROS.map((f) => (
            <Button key={f.id} size="sm" variant={filtro === f.id ? 'default' : 'outline'} aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>{f.rotulo}</Button>
          ))}
        </div>
        <Input aria-label="Buscar por nome" placeholder="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </CardHeader>
      <CardContent>
        {filtro === 'leads' ? (
          <ul className="divide-y divide-[#E4D9D3]">
            {soLeads.length === 0 && <li className="py-3 text-sm text-[#6B5560]">Nenhum lead sem cota.</li>}
            {soLeads.map((l) => {
              const link = linkWhatsapp(l.whatsapp, `Oi, ${l.nome.split(' ')[0]}! Aqui é a Giulia, do Clube Uniquas.`)
              return (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{l.nome}</p>
                    <p className="text-sm text-[#6B5560]">Entrou em {formatarData(l.created_at)}{l.plano_interesse ? ` · interesse: ${l.plano_interesse}` : ''}</p>
                  </div>
                  {link && <Button asChild size="sm" variant="outline"><a href={link} target="_blank" rel="noreferrer">WhatsApp</a></Button>}
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="divide-y divide-[#E4D9D3]">
            {linhas.length === 0 && <li className="py-3 text-sm text-[#6B5560]">Ninguém nesse filtro.</li>}
            {linhas.map((m) => {
              const sorteada = m.status === 'sorteado' || Boolean(m.data_contemplacao)
              const s = situacao(m.status, m.em_dia, sorteada)
              const lead = um(m.leads)
              const link = linkWhatsapp(lead?.whatsapp, `Oi, ${(lead?.nome ?? '').split(' ')[0]}! Aqui é a Giulia, do Clube Uniquas.`)
              return (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{lead?.nome ?? '—'} <span className="text-[#6B5560]">· cota {m.cota ?? '—'}</span></p>
                    <p className="text-sm text-[#6B5560]">{um(m.planos)?.nome ?? '—'}{m.data_contemplacao ? ` · sorteada em ${formatarData(m.data_contemplacao)}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.variante}>{s.texto}</Badge>
                    {link && <Button asChild size="sm" variant="outline"><a href={link} target="_blank" rel="noreferrer">WhatsApp</a></Button>}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
