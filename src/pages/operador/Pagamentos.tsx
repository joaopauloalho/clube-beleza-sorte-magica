import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatarData, formatarReais } from '@/lib/format'
import { linkWhatsapp, mensagemUltimaCobranca, nomeDoMes } from '@/lib/operador-resumo'
import { um, type Membro, type Operador } from './useOperador'

const FORMAS = [
  { id: 'dinheiro', rotulo: 'Dinheiro' },
  { id: 'pix_direto', rotulo: 'Pix direto para a Giulia' },
  { id: 'cartao_presencial', rotulo: 'Cartão na clínica' },
  { id: 'outro', rotulo: 'Outro' },
]

const mesAtual = () => new Date().toISOString().slice(0, 7)

function pagoNoMes(op: Operador, membroId: string, competencia: string) {
  return op.pagamentos.find((p) => p.membro_id === membroId && p.status === 'pago' && (p.competencia ?? p.created_at).slice(0, 7) === competencia)
}

export function Pagamentos({ op, grupoId }: { op: Operador; grupoId: string }) {
  const [competencia, setCompetencia] = useState(mesAtual)
  const [alvo, setAlvo] = useState<Membro | null>(null)
  const [forma, setForma] = useState('dinheiro')
  const [valor, setValor] = useState('')
  const [observacao, setObservacao] = useState('')
  const [estornando, setEstornando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const ativos = op.membros.filter((m) => m.grupo_id === grupoId && m.status !== 'cancelado' && m.status !== 'aguardando_grupo')
  const devendo = ativos.filter((m) => !pagoNoMes(op, m.id, competencia))
  const mesDoSorteio = nomeDoMes(Number(competencia.slice(5, 7)) - 1)

  function abrirBaixa(m: Membro) {
    setAlvo(m)
    setForma('dinheiro')
    setObservacao('')
    setValor(String(Number(um(m.planos)?.preco ?? 0)).replace('.', ','))
  }

  async function confirmarBaixa() {
    if (!alvo) return
    const centavos = Math.round(Number(valor.replace(/\./g, '').replace(',', '.')) * 100)
    setOcupado(true)
    const r = await op.chamar('/api/operador/pagamento-manual', { membroId: alvo.id, competencia, valorCentavos: centavos, forma, observacao: observacao || null })
    setOcupado(false)
    setAviso(r.erro ?? `Mensalidade de ${um(alvo.leads)?.nome ?? 'integrante'} marcada como paga.`)
    if (!r.erro) setAlvo(null)
  }

  async function confirmarEstorno() {
    if (!estornando) return
    setOcupado(true)
    const r = await op.chamar('/api/operador/pagamento-manual', { acao: 'estornar', pagamentoId: estornando, motivo })
    setOcupado(false)
    setAviso(r.erro ?? 'Pagamento estornado.')
    if (!r.erro) { setEstornando(null); setMotivo('') }
  }

  const manuaisDoMes = op.pagamentos.filter((p) => p.origem === 'manual' && p.status === 'pago' && p.grupo_id === grupoId && (p.competencia ?? p.created_at).slice(0, 7) === competencia)

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
        <CardHeader className="space-y-3">
          <CardTitle className="font-serif text-[24px] font-normal">Quem ainda não pagou</CardTitle>
          <div className="max-w-[200px] space-y-2">
            <Label htmlFor="competencia">Mês da mensalidade</Label>
            <Input id="competencia" type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-[#E4D9D3]">
            {devendo.length === 0 && <li className="py-3 text-sm text-[#6B5560]">Todo mundo está pago neste mês.</li>}
            {devendo.map((m) => {
              const lead = um(m.leads)
              const preco = Number(um(m.planos)?.preco ?? 0)
              const link = linkWhatsapp(lead?.whatsapp, mensagemUltimaCobranca(lead?.nome ?? '', formatarReais(preco), mesDoSorteio))
              return (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{lead?.nome ?? '—'} <span className="text-[#6B5560]">· cota {m.cota ?? '—'}</span></p>
                    <p className="text-sm text-[#6B5560]">{formatarReais(preco)} · {m.em_dia ? 'sem pagamento neste mês' : 'em atraso'}</p>
                  </div>
                  <div className="flex gap-2">
                    {link && <Button asChild size="sm" variant="outline"><a href={link} target="_blank" rel="noreferrer">Última cobrança</a></Button>}
                    <Button size="sm" onClick={() => abrirBaixa(m)}>Marcar como pago</Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {aviso && <p role="status" className="rounded-xl bg-white p-3 text-[15px]">{aviso}</p>}

      <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
        <CardHeader><CardTitle className="font-serif text-[24px] font-normal">Pagos à mão neste mês</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y divide-[#E4D9D3]">
            {manuaisDoMes.length === 0 && <li className="py-3 text-sm text-[#6B5560]">Nenhum.</li>}
            {manuaisDoMes.map((p) => {
              const m = op.membros.find((x) => x.id === p.membro_id)
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{um(m?.leads)?.nome ?? '—'}</p>
                    <p className="text-sm text-[#6B5560]">{FORMAS.find((f) => f.id === p.forma_manual)?.rotulo ?? p.forma_manual} · {formatarData(p.created_at)}{p.observacao ? ` · ${p.observacao}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.valor_centavos != null ? formatarReais(p.valor_centavos / 100) : '—'}</Badge>
                    <Button size="sm" variant="outline" onClick={() => { setMotivo(''); setEstornando(p.id) }}>Estornar</Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={alvo != null} onOpenChange={(aberto) => !aberto && setAlvo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como pago</DialogTitle>
            <DialogDescription>{um(alvo?.leads)?.nome} · mensalidade de {competencia.slice(5, 7)}/{competencia.slice(0, 4)}. Fica registrado quem marcou e quando.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Como foi pago</legend>
              {FORMAS.map((f) => (
                <label key={f.id} className="flex items-center gap-2 text-[15px]">
                  <input type="radio" name="forma" value={f.id} checked={forma === f.id} onChange={() => setForma(f.id)} />
                  {f.rotulo}
                </label>
              ))}
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor recebido (R$)</Label>
              <Input id="valor" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obs">Observação {forma === 'outro' ? '(obrigatória)' : '(opcional)'}</Label>
              <Textarea id="obs" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlvo(null)}>Cancelar</Button>
            <Button disabled={ocupado} onClick={() => void confirmarBaixa()}>Confirmar pagamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={estornando != null} onOpenChange={(aberto) => !aberto && setEstornando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estornar pagamento</DialogTitle>
            <DialogDescription>A integrante volta a ficar sem esse mês pago. Se ela já foi sorteada, o crédito fica bloqueado de novo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo-estorno">Motivo</Label>
            <Textarea id="motivo-estorno" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEstornando(null)}>Cancelar</Button>
            <Button disabled={ocupado || motivo.trim().length < 5} onClick={() => void confirmarEstorno()}>Estornar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
