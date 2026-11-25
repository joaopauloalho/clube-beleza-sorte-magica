import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatarData } from '@/lib/format'
import { filtrarIntegrantes, filtrarLeadsSemCota, rotuloSituacao, sorteadaDaLinha, type FiltroDaTela } from '@/lib/lista-operador'
import { linkWhatsapp } from '@/lib/operador-resumo'
import { Creditos } from './Creditos'
import { um, type Operador } from './useOperador'

type Filtro = FiltroDaTela

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'em_dia', rotulo: 'Em dia' },
  { id: 'atraso', rotulo: 'Em atraso' },
  { id: 'sorteadas', rotulo: 'Sorteadas' },
  { id: 'canceladas', rotulo: 'Canceladas' },
  { id: 'leads', rotulo: 'Leads' },
]

function variante(status: string, emDia: boolean, sorteada: boolean): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'cancelado' || (sorteada && !emDia) || (!sorteada && !emDia && status !== 'aguardando_grupo')) return 'destructive'
  if (sorteada) return 'default'
  if (status === 'aguardando_grupo') return 'outline'
  return 'secondary'
}

export function Membros({ op, grupoId }: { op: Operador; grupoId: string }) {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busca, setBusca] = useState('')
  const [baixando, setBaixando] = useState<'leads' | 'integrantes' | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const linhas = useMemo(() => filtrarIntegrantes(op.membros.map((membro) => ({ ...membro, nome: um(membro.leads)?.nome ?? '' })), grupoId, filtro, busca), [op.membros, grupoId, filtro, busca])

  const soLeads = useMemo(() => {
    const whatsapps = new Set(op.membros.map((membro) => um(membro.leads)?.whatsapp).filter((valor): valor is string => Boolean(valor)))
    return filtrarLeadsSemCota(op.leads, whatsapps, busca)
  }, [op.membros, op.leads, busca])

  async function baixar(tipo: 'leads' | 'integrantes') {
    setBaixando(tipo)
    setAviso(null)
    const resposta = await op.baixarCsv({ tipo, grupoId, filtro, busca })
    setBaixando(null)
    if (resposta.erro) setAviso(resposta.erro)
  }

  return (
    <div className="space-y-4">
    <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="font-serif text-[24px] font-normal">Membros e leads</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={baixando != null || !grupoId} onClick={() => void baixar('integrantes')}>{baixando === 'integrantes' ? 'Baixando…' : 'Baixar integrantes'}</Button>
            <Button type="button" size="sm" variant="outline" disabled={baixando != null} onClick={() => void baixar('leads')}>{baixando === 'leads' ? 'Baixando…' : 'Baixar leads'}</Button>
          </div>
        </div>
        <p className="text-sm text-[#6B5560]">A planilha de integrantes usa este grupo, a busca e o filtro. No filtro Leads, ela traz as integrantes do grupo que a busca encontrar, sem filtrar a situação. A de leads usa a busca e só quem ainda não tem cota.</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
          {FILTROS.map((f) => (
            <Button key={f.id} size="sm" variant={filtro === f.id ? 'default' : 'outline'} aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>{f.rotulo}</Button>
          ))}
        </div>
        <Input aria-label="Buscar por nome" name="busca" autoComplete="off" className="h-11 text-base" maxLength={80} placeholder="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
        {aviso && <p role="alert" className="text-sm text-[#A52751]">{aviso}</p>}
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
              const sorteada = sorteadaDaLinha(m.status, m.data_contemplacao)
              const s = { texto: rotuloSituacao(m.status, m.em_dia, sorteada), variante: variante(m.status, m.em_dia, sorteada) }
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
    {grupoId && <Creditos op={op} grupoId={grupoId} />}
    </div>
  )
}
