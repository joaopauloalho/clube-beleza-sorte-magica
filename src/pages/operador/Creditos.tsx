import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { A_DEFINIR } from '@/lib/copy'
import { centavosDeTexto, formatarData, formatarReais } from '@/lib/format'
import { GRUPOS_PROCEDIMENTOS } from '@/lib/procedimentos'
import { divideCredito, saldoDoCredito } from '@/lib/saldo-credito'
import { um, type CreditoLinha, type Membro, type Operador } from './useOperador'

function hoje(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function rotulo(status: string, bloqueado: boolean): string {
  if (bloqueado) return 'Bloqueado por atraso'
  if (status === 'liberado') return 'Liberado'
  return 'A liberar'
}

export function Creditos({ op, grupoId }: { op: Operador; grupoId: string }) {
  const [aviso, setAviso] = useState<string | null>(null)
  const [erro, setErro] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [usoDe, setUsoDe] = useState<{ credito: CreditoLinha; membro: Membro } | null>(null)
  const [procedimentoId, setProcedimentoId] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(hoje)
  const [observacao, setObservacao] = useState('')
  const [usadoPor, setUsadoPor] = useState('')
  const [estornando, setEstornando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')

  const doGrupo = op.membros.filter((membro) => membro.grupo_id === grupoId)
  const creditos = op.creditos.filter((credito) => doGrupo.some((membro) => membro.id === credito.membro_id))

  async function executar(corpo: unknown, sucesso: string) {
    setOcupado(true)
    setAviso(null)
    const resposta = await op.chamar('/api/operador/credito', corpo)
    setOcupado(false)
    setErro(Boolean(resposta.erro))
    setAviso(resposta.erro ?? sucesso)
    return resposta
  }

  function abrirUso(credito: CreditoLinha, membro: Membro) {
    setUsoDe({ credito, membro })
    setProcedimentoId('')
    setValor('')
    setData(hoje())
    setObservacao('')
    setUsadoPor('')
  }

  async function confirmarUso() {
    if (!usoDe) return
    const centavos = centavosDeTexto(valor)
    if (centavos == null) {
      setErro(true)
      setAviso('Informe o valor que sai do saldo.')
      return
    }
    const resposta = await executar({
      acao: 'usar',
      creditoId: usoDe.credito.id,
      procedimentoId,
      valorCentavos: centavos,
      data,
      observacao: observacao || null,
      usadoPor: usadoPor || null,
    }, 'Uso registrado. O saldo foi atualizado.')
    if (!resposta.erro) setUsoDe(null)
  }

  async function confirmarEstorno() {
    if (!estornando) return
    const resposta = await executar({ acao: 'estornar', usoId: estornando, motivo }, 'Uso estornado. O saldo voltou.')
    if (!resposta.erro) { setEstornando(null); setMotivo('') }
  }

  const planoDoUso = um(usoDe?.membro.planos)
  const podeDividir = divideCredito(planoDoUso?.slug, planoDoUso?.nome)
  const saldoDoUso = usoDe ? saldoDoCredito(usoDe.credito.valor_centavos, op.usos, usoDe.credito.id) : 0

  return (
    <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
      <CardHeader>
        <CardTitle className="font-serif text-[24px] font-normal">Crédito das sorteadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {aviso && <p role={erro ? 'alert' : 'status'} className="rounded-xl bg-[#F7F2EF] p-3 text-[15px]">{aviso}</p>}
        {creditos.length === 0 && <p className="text-sm text-[#6B5560]">Nenhuma sorteada com crédito neste grupo.</p>}
        <ul className="divide-y divide-[#E4D9D3]">
          {creditos.map((credito) => {
            const membro = doGrupo.find((item) => item.id === credito.membro_id)
            const nome = um(membro?.leads)?.nome ?? 'Integrante'
            const plano = um(membro?.planos)
            const bloqueado = Boolean(credito.bloqueado) || membro?.em_dia === false
            const saldo = saldoDoCredito(credito.valor_centavos, op.usos, credito.id)
            const usos = op.usos.filter((uso) => uso.credito_id === credito.id)
            const podeLiberar = credito.status === 'a_liberar' && !bloqueado
            const podeUsar = credito.status === 'liberado' && !bloqueado && saldo > 0
            return (
              <li key={credito.id} className="space-y-3 py-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="break-words font-medium">{nome} <span className="text-[#6B5560]">· cota {membro?.cota ?? '—'}</span></p>
                    <p className="font-serif text-[32px] leading-none tabular-nums">{formatarReais(saldo / 100)}</p>
                    <p className="text-sm text-[#6B5560]">{rotulo(credito.status, bloqueado)} · de {formatarReais(credito.valor_centavos / 100)} · {plano?.nome ?? '—'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {podeLiberar && (
                      <Button type="button" disabled={ocupado} aria-label={`Liberar crédito de ${nome}`} onClick={() => void executar({ acao: 'liberar', creditoId: credito.id }, `Crédito de ${nome} liberado.`)}>Liberar</Button>
                    )}
                    {podeUsar && (
                      <Button type="button" variant="outline" disabled={ocupado} aria-label={`Registrar uso de ${nome}`} onClick={() => abrirUso(credito, membro as Membro)}>Registrar uso</Button>
                    )}
                  </div>
                </div>
                {bloqueado && (
                  <p className="rounded-xl bg-[#F2C9D6]/40 p-3 text-sm text-[#A52751]">Bloqueado: a mensalidade não está em dia. O crédito volta a poder ser liberado ou usado quando o pagamento regularizar.</p>
                )}
                {usos.length > 0 && (
                  <ul className="space-y-2">
                    {usos.map((uso) => (
                      <li key={uso.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span>
                          {formatarData(uso.data_uso)} · {uso.procedimento_nome}
                          {uso.usado_por ? ` · usado por ${uso.usado_por}` : ''}
                          {uso.observacao ? ` · ${uso.observacao}` : ''}
                        </span>
                        <span className="flex items-center gap-2">
                          {uso.status === 'estornado' ? <Badge variant="outline">Estornado</Badge> : <span>{formatarReais(uso.valor_centavos / 100)}</span>}
                          {uso.status === 'ativo' && (
                            <Button type="button" size="sm" variant="outline" aria-label={`Estornar uso de ${uso.procedimento_nome}`} onClick={() => { setMotivo(''); setEstornando(uso.id) }}>Estornar</Button>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>

      <Dialog open={usoDe != null} onOpenChange={(aberto) => !aberto && setUsoDe(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto overscroll-contain">
          <DialogHeader>
            <DialogTitle>Registrar uso</DialogTitle>
            <DialogDescription>
              {um(usoDe?.membro.leads)?.nome}. Saldo {formatarReais(saldoDoUso / 100)}. O valor sai do saldo e fica na auditoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="procedimento">Procedimento</Label>
              <select id="procedimento" name="procedimento" className="h-11 w-full rounded-md border border-input bg-white px-3 text-base text-[#2A1420] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={procedimentoId} onChange={(evento) => setProcedimentoId(evento.target.value)}>
                <option value="">Escolha</option>
                {GRUPOS_PROCEDIMENTOS.map((grupo) => (
                  <optgroup key={grupo.id} label={grupo.nome}>
                    {grupo.itens.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor-uso">Valor que sai do saldo (R$)</Label>
              <Input id="valor-uso" name="valor" className="h-11 text-base tabular-nums" inputMode="decimal" autoComplete="off" placeholder="0,00" value={valor} onChange={(evento) => setValor(evento.target.value)} />
              <p className="text-sm text-[#6B5560]">{A_DEFINIR.creditoSomaDesconto}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-uso">Data</Label>
              <Input id="data-uso" name="data" className="h-11 text-base" type="date" autoComplete="off" max={hoje()} value={data} onChange={(evento) => setData(evento.target.value)} />
            </div>
            {podeDividir && (
              <div className="space-y-2">
                <Label htmlFor="usado-por">Usado por (opcional)</Label>
                <Input id="usado-por" name="usado-por" className="h-11 text-base" autoComplete="name" maxLength={80} value={usadoPor} onChange={(evento) => setUsadoPor(evento.target.value)} />
                <p className="text-sm text-[#6B5560]">No Suprema o crédito pode ser de outra pessoa. Em branco, foi a titular. Essencial e Radiante são só da titular.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="obs-uso">Observação (opcional)</Label>
              <Textarea id="obs-uso" value={observacao} onChange={(evento) => setObservacao(evento.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUsoDe(null)}>Cancelar</Button>
            <Button type="button" disabled={ocupado || !procedimentoId} onClick={() => void confirmarUso()}>Registrar uso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={estornando != null} onOpenChange={(aberto) => !aberto && setEstornando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estornar uso</DialogTitle>
            <DialogDescription>O valor volta para o saldo. O histórico guarda o estorno.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo-uso">Motivo</Label>
            <Textarea id="motivo-uso" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEstornando(null)}>Cancelar</Button>
            <Button type="button" disabled={ocupado || motivo.trim().length < 5} onClick={() => void confirmarEstorno()}>Estornar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
