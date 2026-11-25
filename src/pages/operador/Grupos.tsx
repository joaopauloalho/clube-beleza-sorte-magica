import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { rotuloMesDoCiclo, rotuloStatusGrupo } from '@/lib/lista-operador'
import { um, type GrupoLinha, type Operador } from './useOperador'

export function Grupos({ op, onAbrirCalendario }: { op: Operador; onAbrirCalendario: (grupoId: string) => void }) {
  const [aviso, setAviso] = useState<string | null>(null)
  const [erro, setErro] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [planoId, setPlanoId] = useState('')
  const [renomeando, setRenomeando] = useState<GrupoLinha | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [excluindo, setExcluindo] = useState<GrupoLinha | null>(null)
  const [motivo, setMotivo] = useState('')
  const [abertos, setAbertos] = useState<Record<string, boolean>>({})

  const planos = useMemo(() => {
    const ordem = ['essencial', 'radiante', 'suprema']
    const posicao = (slug: string | null) => {
      const indice = ordem.indexOf(slug ?? '')
      return indice === -1 ? ordem.length : indice
    }
    return [...op.planos].sort((a, b) => posicao(a.slug) - posicao(b.slug))
  }, [op.planos])

  async function executar(corpo: unknown, sucesso: string) {
    setOcupado(true)
    setAviso(null)
    const resposta = await op.chamar('/api/operador/grupos', corpo)
    setOcupado(false)
    setErro(Boolean(resposta.erro))
    setAviso(resposta.erro ?? sucesso)
    return resposta
  }

  async function criar() {
    const resposta = await executar({ acao: 'criar', nome, planoId }, 'Grupo criado. A adesão entra no grupo aberto mais antigo deste plano.')
    if (!resposta.erro) { setCriando(false); setNome(''); setPlanoId('') }
  }

  async function renomear() {
    if (!renomeando) return
    const resposta = await executar({ acao: 'renomear', grupoId: renomeando.id, nome: novoNome }, 'Nome atualizado.')
    if (!resposta.erro) setRenomeando(null)
  }

  async function excluir() {
    if (!excluindo) return
    const resposta = await executar({ acao: 'excluir', grupoId: excluindo.id, motivo }, 'Grupo apagado.')
    if (!resposta.erro) { setExcluindo(null); setMotivo('') }
  }

  return (
    <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="font-serif text-[24px] font-normal">Grupos</CardTitle>
        <Button type="button" onClick={() => { setNome(''); setPlanoId(planos[0]?.id ?? ''); setCriando(true) }}>Novo grupo</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-[#6B5560]">24 vagas. A adesão preenche o grupo aberto mais antigo do plano.</p>
        {aviso && <p role={erro ? 'alert' : 'status'} className="rounded-xl bg-[#F7F2EF] p-3 text-[15px]">{aviso}</p>}
        {op.grupos.length === 0 && <p className="text-sm text-[#6B5560]">Nenhum grupo ainda. Crie o primeiro para a adesão ter onde entrar.</p>}
        <ul className="divide-y divide-[#E4D9D3]">
          {op.grupos.map((grupo) => {
            const integrantes = op.membros.filter((membro) => membro.grupo_id === grupo.id)
            const vagas = grupo.vagas_preenchidas ?? integrantes.length
            const total = grupo.total_vagas ?? 24
            const vazio = vagas === 0 && integrantes.length === 0
            const plano = um(grupo.planos)?.nome
            const aberto = Boolean(abertos[grupo.id])
            return (
              <li key={grupo.id} className="space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="break-words font-serif text-[28px] leading-tight">{grupo.nome}</p>
                    <p className="mt-2 text-sm text-[#6B5560]">{plano ?? 'Sem plano'} · {vagas} de {total} · {rotuloMesDoCiclo(grupo.ultimo_mes_sorteado, grupo.cobranca_iniciada_em)}</p>
                  </div>
                  <Badge variant={grupo.status === 'completo' ? 'default' : 'secondary'}>{rotuloStatusGrupo(grupo.status)}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" aria-expanded={aberto} aria-controls={`integrantes-${grupo.id}`} onClick={() => setAbertos((atual) => ({ ...atual, [grupo.id]: !atual[grupo.id] }))}>
                    {aberto ? 'Ocultar integrantes' : 'Ver integrantes'}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => onAbrirCalendario(grupo.id)}>Calendário de sorteio</Button>
                  <Button type="button" size="sm" variant="outline" aria-label={`Renomear ${grupo.nome}`} onClick={() => { setNovoNome(grupo.nome); setRenomeando(grupo) }}>Renomear</Button>
                  {vazio && <Button type="button" size="sm" variant="outline" aria-label={`Apagar ${grupo.nome}`} onClick={() => { setMotivo(''); setExcluindo(grupo) }}>Apagar</Button>}
                </div>
                {aberto && (
                  <ul id={`integrantes-${grupo.id}`} className="rounded-xl bg-[#F7F2EF] p-3">
                    {integrantes.length === 0 && <li className="text-sm text-[#6B5560]">Nenhuma integrante neste grupo.</li>}
                    {integrantes.map((membro) => (
                      <li key={membro.id} className="py-1 text-[15px]">{um(membro.leads)?.nome ?? '—'} · cota {membro.cota ?? '—'}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>

      <Dialog open={criando} onOpenChange={setCriando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo grupo</DialogTitle>
            <DialogDescription>24 vagas, aberto para adesão. Se já houver outro grupo aberto do mesmo plano, a adesão entra primeiro no mais antigo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="nome-grupo">Nome</Label>
              <Input id="nome-grupo" name="nome" className="h-11 text-base" autoComplete="off" maxLength={80} value={nome} onChange={(evento) => setNome(evento.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plano-grupo">Plano</Label>
              <select id="plano-grupo" name="plano" className="h-11 w-full rounded-md border border-input bg-white px-3 text-base text-[#2A1420] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={planoId} onChange={(evento) => setPlanoId(evento.target.value)}>
                <option value="">Escolha</option>
                {planos.map((plano) => <option key={plano.id} value={plano.id}>{plano.nome}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCriando(false)}>Cancelar</Button>
            <Button type="button" disabled={ocupado || nome.trim().length < 2 || !planoId} onClick={() => void criar()}>Criar grupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renomeando != null} onOpenChange={(aberto) => !aberto && setRenomeando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear grupo</DialogTitle>
            <DialogDescription>O nome novo aparece para a integrante e no painel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="novo-nome">Nome</Label>
            <Input id="novo-nome" name="nome" className="h-11 text-base" autoComplete="off" maxLength={80} value={novoNome} onChange={(evento) => setNovoNome(evento.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenomeando(null)}>Cancelar</Button>
            <Button type="button" disabled={ocupado || novoNome.trim().length < 2} onClick={() => void renomear()}>Salvar nome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={excluindo != null} onOpenChange={(aberto) => !aberto && setExcluindo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apagar grupo</DialogTitle>
            <DialogDescription>Só um grupo sem integrantes. Se houver calendário, ele sai junto. Quem já entrou impede a exclusão.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo-grupo">Motivo</Label>
            <Textarea id="motivo-grupo" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExcluindo(null)}>Cancelar</Button>
            <Button type="button" disabled={ocupado || motivo.trim().length < 5} onClick={() => void excluir()}>Apagar grupo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
