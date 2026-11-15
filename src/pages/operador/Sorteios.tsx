import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { chanceDoMes, previsaoDoGrupo, somar } from '@/lib/calendarioDoGrupo'
import { formatarData } from '@/lib/format'
import { chanceDoProximoSorteio, nomeDoMes, resumirGrupo, textoDoCanal } from '@/lib/operador-resumo'
import type { Operador } from './useOperador'

function cotasDoSorteio(sorteados: unknown, op: Operador): number[] {
  if (!Array.isArray(sorteados)) return []
  const cotas = sorteados.map((item) => {
    if (typeof item === 'string') return op.membros.find((m) => m.id === item)?.cota ?? null
    if (item && typeof item === 'object') {
      const o = item as { cota?: unknown; membroId?: unknown; id?: unknown }
      if (typeof o.cota === 'number') return o.cota
      const id = typeof o.membroId === 'string' ? o.membroId : typeof o.id === 'string' ? o.id : null
      return id ? (op.membros.find((m) => m.id === id)?.cota ?? null) : null
    }
    return null
  })
  return cotas.filter((c): c is number => typeof c === 'number')
}

export function Sorteios({ op, grupoId }: { op: Operador; grupoId: string }) {
  const [aviso, setAviso] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [primeiro, setPrimeiro] = useState('')
  const [editando, setEditando] = useState<number | null>(null)
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [refazendo, setRefazendo] = useState(false)
  const [dataDoSorteio, setDataDoSorteio] = useState(() => new Date().toISOString().slice(0, 10))

  const grupo = op.grupos.find((g) => g.id === grupoId)
  const doGrupo = useMemo(() => op.membros.filter((m) => m.grupo_id === grupoId), [op.membros, grupoId])
  const resumo = resumirGrupo(doGrupo)
  const linhas = op.calendarios.filter((c) => c.grupo_id === grupoId).sort((a, b) => a.mes - b.mes)
  const calendario = linhas.length === 12 ? linhas.map((l) => l.quantidade) : null
  const feitos = op.sorteios.filter((s) => s.grupo_id === grupoId)
  const mesesFeitos = feitos.length
  const proximoMes = mesesFeitos + 1
  const proximo = linhas.find((l) => l.mes === proximoMes)
  const conferido = Boolean(proximo?.conferido_em)
  const tamanho = doGrupo.filter((m) => m.status !== 'cancelado' && m.status !== 'aguardando_grupo').length || (grupo?.total_vagas ?? 0)
  const previsao = calendario ? previsaoDoGrupo(calendario, tamanho) : []

  async function executar(rota: string, corpo: unknown, sucesso: string) {
    setOcupado(true)
    setAviso(null)
    const r = await op.chamar(rota, corpo)
    setOcupado(false)
    setAviso(r.erro ?? sucesso)
    return r
  }

  async function salvarEdicao() {
    if (editando == null) return
    const r = await executar('/api/operador/calendario', { acao: 'editar', grupoId, mes: editando, quantidade: Number(quantidade), motivo }, 'Calendário atualizado e registrado na auditoria.')
    if (!r.erro) { setEditando(null); setMotivo('') }
  }

  async function refazer() {
    const r = await executar('/api/operador/calendario', { acao: 'refazer', grupoId, motivo }, 'Meses restantes redistribuídos.')
    if (!r.erro) { setRefazendo(false); setMotivo('') }
  }

  const editavel = (mes: number) => mes > mesesFeitos && mes < 12
  const simulado = editando != null && calendario && Number.isInteger(Number(quantidade)) && Number(quantidade) >= 0
    ? (() => {
        const concorrem = tamanho - somar(calendario.slice(0, editando - 1))
        return { concorrem, chance: chanceDoMes(Number(quantidade), concorrem) }
      })()
    : null

  const ultimo = feitos[feitos.length - 1]
  const textoCanal = ultimo ? textoDoCanal(nomeDoMes(ultimo.mes - 1), cotasDoSorteio(ultimo.sorteados, op), cotasDoSorteio(ultimo.sorteados, op).length, Array.isArray(ultimo.elegiveis) ? ultimo.elegiveis.length : resumo.concorrem) : null

  return (
    <div className="space-y-4">
      {!calendario ? (
        <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
          <CardHeader><CardTitle className="font-serif text-[24px] font-normal">Calendário do grupo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[15px] text-[#6B5560]">O grupo tem {tamanho} cota(s) ativas. O sistema espalha os sorteios do mês 1 ao 11, e o mês 12 fica sem sorteio. Depois você pode mudar mês a mês.</p>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="primeiro">Data do primeiro sorteio</Label>
                <Input id="primeiro" type="date" value={primeiro} onChange={(e) => setPrimeiro(e.target.value)} />
              </div>
              <Button disabled={ocupado || !primeiro || tamanho < 12} onClick={() => void executar('/api/operador/calendario', { acao: 'gerar', grupoId, primeiroSorteio: primeiro }, 'Calendário gerado.')}>Gerar calendário</Button>
            </div>
            {tamanho < 12 && <p className="text-sm text-[#A52751]">O grupo precisa ter pelo menos 12 cotas ativas para gerar o calendário.</p>}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="font-serif text-[24px] font-normal">Calendário do grupo</CardTitle>
            <Button variant="outline" size="sm" onClick={() => { setMotivo(''); setRefazendo(true) }}>Redistribuir meses restantes</Button>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {previsao.map((p) => {
                const linha = linhas[p.mes - 1]
                const feito = p.mes <= mesesFeitos
                return (
                  <li key={p.mes} className={`rounded-xl border p-3 ${p.mes === proximoMes ? 'border-[#A52751] bg-[#F2C9D6]/30' : 'border-[#E4D9D3]'}`}>
                    <div className="flex items-baseline justify-between">
                      <p className="font-medium capitalize">{linha?.data_prevista ? nomeDoMes(new Date(`${linha.data_prevista}T12:00:00`).getMonth()) : `Mês ${p.mes}`}</p>
                      <p className="text-xs text-[#6B5560]">mês {p.mes}</p>
                    </div>
                    <p className="text-[15px]">{p.mes === 12 ? 'Última mensalidade, sem sorteio.' : `${p.sorteadas} sorteada(s)`}</p>
                    {p.mes !== 12 && <p className="text-xs text-[#6B5560]">{feito ? `Feito em ${formatarData(feitos[p.mes - 1]?.data_sorteio)}` : `Chance ${chanceDoProximoSorteio(p.sorteadas, p.concorrem)} (${p.concorrem} concorrendo)`}</p>}
                    {editavel(p.mes) && <Button size="sm" variant="ghost" className="mt-1 px-0 text-[#A52751]" onClick={() => { setQuantidade(String(linha?.quantidade ?? p.sorteadas)); setMotivo(''); setEditando(p.mes) }}>Mudar quantidade</Button>}
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {calendario && proximoMes <= 11 && (
        <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
          <CardHeader><CardTitle className="font-serif text-[24px] font-normal">Dia do sorteio (mês {proximoMes})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[15px]">1. Confira quem pagou na aba Pagamentos. Em atraso agora: <strong>{resumo.emAtraso}</strong>. Concorrem: <strong>{resumo.concorrem}</strong>.</p>
            <p className="text-[15px]">2. Confirme a conferência. Sem isso o sorteio não roda.</p>
            <Button variant="outline" disabled={ocupado || conferido} onClick={() => void executar('/api/operador/calendario', { acao: 'conferir', grupoId }, 'Conferência confirmada. O sorteio está liberado.')}>{conferido ? 'Conferência confirmada' : 'Confirmar conferência'}</Button>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="data-sorteio">Data do sorteio</Label>
                <Input id="data-sorteio" type="date" value={dataDoSorteio} onChange={(e) => setDataDoSorteio(e.target.value)} />
              </div>
              <Button disabled={ocupado || !conferido || (proximo?.quantidade ?? 0) <= 0} onClick={() => void executar('/api/operador/sorteio', { grupoId, data: dataDoSorteio }, 'Sorteio registrado.')}>Sortear {proximo?.quantidade ?? 0} cota(s)</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {aviso && <p role="status" className="rounded-xl bg-white p-3 text-[15px]">{aviso}</p>}

      {textoCanal && (
        <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
          <CardHeader><CardTitle className="font-serif text-[24px] font-normal">Texto para o Canal</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <pre className="whitespace-pre-wrap rounded-xl bg-[#F7F2EF] p-3 font-sans text-[15px]">{textoCanal}</pre>
            <Button variant="outline" size="sm" onClick={() => void navigator.clipboard?.writeText(textoCanal)}>Copiar texto</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={editando != null} onOpenChange={(aberto) => !aberto && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudar o sorteio do mês {editando}</DialogTitle>
            <DialogDescription>Os meses seguintes se ajustam para todo mundo ser sorteada até o mês 11. A mudança fica registrada com o motivo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="qtd">Quantas cotas sorteadas</Label>
              <Input id="qtd" type="number" min={0} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
              {simulado && <p className="text-sm text-[#6B5560]">Concorrem {simulado.concorrem}. Chance real de cada uma: {chanceDoProximoSorteio(Number(quantidade), simulado.concorrem)}.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: decidi fazer 6 sorteios em junho." />
            </div>
            <p className="text-sm text-[#6B5560]">Avise o grupo antes do sorteio: a chance que elas viram no site muda.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button disabled={ocupado || motivo.trim().length < 5} onClick={() => void salvarEdicao()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refazendo} onOpenChange={setRefazendo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redistribuir meses restantes</DialogTitle>
            <DialogDescription>Reparte quem ainda concorre igualmente entre os meses que faltam, até o mês 11. Meses já sorteados não mudam.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo-refazer">Motivo</Label>
            <Textarea id="motivo-refazer" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: duas cotas saíram do grupo." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefazendo(false)}>Cancelar</Button>
            <Button disabled={ocupado || motivo.trim().length < 5} onClick={() => void refazer()}>Redistribuir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
