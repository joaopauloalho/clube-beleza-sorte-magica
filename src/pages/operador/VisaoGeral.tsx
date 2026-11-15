import { Card, CardContent } from '@/components/ui/card'
import { formatarReais } from '@/lib/format'
import { chanceDoProximoSorteio, resumirGrupo } from '@/lib/operador-resumo'
import { um, type Operador } from './useOperador'

function Numero({ rotulo, valor, nota }: { rotulo: string; valor: string | number; nota?: string }) {
  return (
    <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
      <CardContent className="space-y-1 p-5">
        <p className="text-sm text-[#6B5560]">{rotulo}</p>
        <p className="font-serif text-[34px] leading-none text-[#2A1420]">{valor}</p>
        {nota && <p className="text-sm text-[#6B5560]">{nota}</p>}
      </CardContent>
    </Card>
  )
}

export function VisaoGeral({ op, grupoId }: { op: Operador; grupoId: string }) {
  const doGrupo = op.membros.filter((m) => m.grupo_id === grupoId)
  const r = resumirGrupo(doGrupo)
  const esperado = doGrupo
    .filter((m) => m.status !== 'cancelado' && m.status !== 'aguardando_grupo')
    .reduce((soma, m) => soma + Number(um(m.planos)?.preco ?? 0), 0)
  const bloqueados = op.creditos.filter((c) => c.bloqueado).length
  const proximo = op.calendarios.filter((c) => c.grupo_id === grupoId).sort((a, b) => a.mes - b.mes)
    .find((c) => !op.sorteios.some((s) => s.grupo_id === grupoId && s.mes === c.mes) && c.quantidade > 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Numero rotulo="Cotas no grupo" valor={r.total} nota={`${r.emDia} em dia`} />
        <Numero rotulo="Em atraso" valor={r.emAtraso} nota="Ficam fora do sorteio até regularizar." />
        <Numero rotulo="Mensalidades do mês" valor={formatarReais(esperado)} nota="Soma dos planos em cobrança." />
        <Numero rotulo="Créditos bloqueados" valor={bloqueados} nota="Sorteada sem mensalidade em dia." />
      </div>
      <Card className="rounded-2xl border-[#D9CCC5] bg-white shadow-none">
        <CardContent className="space-y-1 p-5">
          <p className="text-sm text-[#6B5560]">Próximo sorteio</p>
          {proximo ? (
            <p className="text-[17px]">
              Mês {proximo.mes}: {proximo.quantidade} sorteada(s) entre {r.concorrem} em dia. Chance real de{' '}
              <strong>{chanceDoProximoSorteio(proximo.quantidade, r.concorrem)}</strong> para cada uma.
            </p>
          ) : (
            <p className="text-[17px]">Sem sorteio pendente. Gere ou revise o calendário na aba Sorteios.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
