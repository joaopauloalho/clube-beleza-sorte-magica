import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { LinhaDeCredito } from '@/components/LinhaDeCredito'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { A_DEFINIR, LINHA_CHANCE, LINHA_SORTEIO } from '@/lib/copy'
import { formatarData, formatarReais } from '@/lib/format'
import { getPlanByNome, getPlanBySlug, type Plan } from '@/lib/plans'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface Membro {
  id: string
  cota: number | null
  status: string
  em_dia: boolean
  data_contemplacao: string | null
  plano_id: string
  grupo_id: string
}

interface Grupo {
  nome: string
  vagas_preenchidas: number | null
  total_vagas: number | null
  ultimo_mes_sorteado: number | null
  cobranca_iniciada_em: string | null
}

interface PlanoLinha {
  slug: string | null
  nome: string
  preco: number
  credito_sorteio: number
  preco_membro_pct: number | null
}

interface Assinatura {
  status: string
  checkout_url: string | null
  motivo: string | null
}

interface Pagamento {
  id: string
  status: string
  valor_centavos: number | null
  competencia: string | null
  motivo: string | null
  created_at: string
}

interface Credito {
  valor_centavos: number
  chance_real: number
  mes: number
  status: string
}

const PIX: Record<string, string> = {
  checkout_criado: 'Aguardando a autorização do Pix Automático',
  ativa: 'Pix Automático ativo',
  falha_cobranca: 'A última cobrança não foi debitada',
  saldo_insuficiente: 'Débito recusado por saldo insuficiente',
  revogada: 'Autorização cancelada no app do banco',
  cancelada: 'Assinatura cancelada',
  cancelada_fim_ciclo: 'Cancelada para o fim do ciclo já pago',
  cancelada_retentativas: 'Cancelada depois das tentativas de cobrança',
}

export default function Area() {
  const { user } = useAuth()
  const [carregando, setCarregando] = useState(true)
  const [membro, setMembro] = useState<Membro | null>(null)
  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [planoDb, setPlanoDb] = useState<PlanoLinha | null>(null)
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null)
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [credito, setCredito] = useState<Credito | null>(null)

  useEffect(() => {
    if (!user) return
    let ativo = true
    async function carregar() {
      const { data } = await supabase.from('membros').select('id, cota, status, em_dia, data_contemplacao, plano_id, grupo_id').eq('user_id', user.id).maybeSingle()
      if (!ativo) return
      setMembro(data)
      if (!data) {
        setCarregando(false)
        return
      }
      const [grupoRes, planoRes, assinaturaRes, pagamentosRes, creditoRes] = await Promise.all([
        supabase.from('grupos').select('nome, vagas_preenchidas, total_vagas, ultimo_mes_sorteado, cobranca_iniciada_em').eq('id', data.grupo_id).maybeSingle(),
        supabase.from('planos').select('slug, nome, preco, credito_sorteio, preco_membro_pct').eq('id', data.plano_id).maybeSingle(),
        supabase.from('assinaturas').select('status, checkout_url, motivo').eq('membro_id', data.id).maybeSingle(),
        supabase.from('pagamentos').select('id, status, valor_centavos, competencia, motivo, created_at').eq('membro_id', data.id).order('created_at', { ascending: false }),
        supabase.from('creditos').select('valor_centavos, chance_real, mes, status').eq('membro_id', data.id).maybeSingle(),
      ])
      if (!ativo) return
      setGrupo(grupoRes.data)
      setPlanoDb(planoRes.data)
      setAssinatura(assinaturaRes.data)
      setPagamentos(pagamentosRes.data ?? [])
      setCredito(creditoRes.data)
      setCarregando(false)
    }
    void carregar()
    return () => { ativo = false }
  }, [user])

  const plano: Plan | undefined = getPlanBySlug(planoDb?.slug) ?? getPlanByNome(planoDb?.nome)
  const mensalidade = plano?.mensalidade ?? Number(planoDb?.preco ?? 0)
  const creditoDoPlano = plano?.credito ?? Number(planoDb?.credito_sorteio ?? 0)
  const sorteada = membro?.status === 'sorteado' || Boolean(membro?.data_contemplacao)
  const pagos = pagamentos.filter((item) => item.status === 'pago').length

  return (
    <div className="min-h-screen bg-[#F7F2EF] text-[#2A1420]">
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-[680px] space-y-4 px-[22px] py-8">
        <h1 className="text-[34px] font-semibold tracking-tight">Sua área.</h1>
        {carregando ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : !membro ? (
          <Card>
            <CardHeader><CardTitle>Nenhuma cota ainda</CardTitle></CardHeader>
            <CardContent>
              <Button asChild><Link to="/adesao">Reservar uma cota</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant={sorteada ? 'default' : 'secondary'}>{sorteada ? 'Sorteada' : 'Aguardando sorteio'}</Badge>
              <Badge variant="outline">{membro.em_dia ? 'Em dia' : 'Sem mensalidade confirmada'}</Badge>
            </div>

            <Card className="rounded-[28px] border-0 shadow-none">
              <CardHeader>
                <CardTitle className="text-[28px] font-semibold tracking-tight">{plano?.nome ?? planoDb?.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Grupo {grupo?.nome ?? '—'} · cota {membro.cota ?? '—'} · {grupo?.vagas_preenchidas ?? 0} de {grupo?.total_vagas ?? 24}</p>
                {sorteada && credito ? (
                  <div className="space-y-1">
                    <p>Você foi sorteada em {formatarData(membro.data_contemplacao)}. O crédito registrado é {formatarReais(credito.valor_centavos / 100)}.</p>
                    <p className="text-muted-foreground">{LINHA_SORTEIO} {A_DEFINIR.creditoEtapas} {A_DEFINIR.validadeCredito}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <LinhaDeCredito mensalidade={mensalidade} credito={creditoDoPlano} />
                    <p className="text-muted-foreground">{LINHA_CHANCE}</p>
                  </div>
                )}
                {!sorteada && (
                  <p>Preço de membro: {plano ? `${Math.round(plano.precoMembro * 100)}%` : `${planoDb?.preco_membro_pct ?? '—'}%`} a menos nos serviços, enquanto não for sorteada. {A_DEFINIR.creditoSomaDesconto}</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-0 shadow-none">
              <CardHeader><CardTitle className="text-[22px] font-semibold">Pix e mensalidades</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>{assinatura ? (PIX[assinatura.status] ?? assinatura.status) : 'Cobrança ainda não criada.'}</p>
                {assinatura?.motivo && <p className="text-muted-foreground">Motivo registrado: {assinatura.motivo}</p>}
                {!assinatura && <p>{A_DEFINIR.pixLiberacao}</p>}
                <p>{pagos} mensalidade(s) confirmada(s) de 12. {A_DEFINIR.cancelamento}</p>
                {assinatura?.checkout_url && assinatura.status === 'checkout_criado' && (
                  <Button asChild><a href={assinatura.checkout_url}>Abrir autorização do Pix</a></Button>
                )}
                <ul className="space-y-2">
                  {pagamentos.length === 0 && <li className="text-muted-foreground">Nenhum pagamento registrado.</li>}
                  {pagamentos.map((pagamento) => (
                    <li key={pagamento.id} className="flex justify-between gap-4 border-b border-border py-2">
                      <span>{formatarData(pagamento.competencia ?? pagamento.created_at)} · {rotuloPagamento(pagamento.status)}</span>
                      <span>{pagamento.valor_centavos != null ? formatarReais(pagamento.valor_centavos / 100) : '—'}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

function rotuloPagamento(status: string): string {
  if (status === 'pago') return 'Pago'
  if (status === 'saldo_insuficiente') return 'Saldo insuficiente'
  if (status === 'falhou') return 'Não debitado'
  return status
}
