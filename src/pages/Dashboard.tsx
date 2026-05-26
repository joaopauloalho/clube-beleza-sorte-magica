import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, LogOut, Gift, Trophy, Users, Clock } from 'lucide-react'

interface MemberData {
  lead: { nome: string; email: string } | null
  membro: {
    id: string
    numero_sorteio: number | null
    status: string
    data_contemplacao: string | null
  } | null
  plano: {
    nome: string
    preco: number
    brinde: string
    desconto_servicos: string
    credito_sorteio: number
  } | null
  grupo: {
    nome: string
    vagas_preenchidas: number
    total_vagas: number
  } | null
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [data, setData] = useState<MemberData>({ lead: null, membro: null, plano: null, grupo: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user?.email) return

      const { data: lead } = await supabase
        .from('leads')
        .select('id, nome, email')
        .eq('email', user.email)
        .single()

      if (!lead) { setLoading(false); return }

      const { data: membro } = await supabase
        .from('membros')
        .select('id, numero_sorteio, status, data_contemplacao, plano_id, grupo_id')
        .eq('lead_id', lead.id)
        .eq('status', 'ativo')
        .single()

      let plano = null
      let grupo = null

      if (membro) {
        const [planoRes, grupoRes] = await Promise.all([
          supabase.from('planos').select('nome, preco, brinde, desconto_servicos, credito_sorteio').eq('id', membro.plano_id).single(),
          supabase.from('grupos').select('nome, vagas_preenchidas, total_vagas').eq('id', membro.grupo_id).single(),
        ])
        plano = planoRes.data
        grupo = grupoRes.data
      }

      setData({
        lead,
        membro: membro
          ? { id: membro.id, numero_sorteio: membro.numero_sorteio, status: membro.status, data_contemplacao: membro.data_contemplacao }
          : null,
        plano,
        grupo,
      })
      setLoading(false)
    }

    load()
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white border-b border-pink-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-pink-600" />
          <span className="font-bold text-pink-700">Clube de Estética</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800">
              Olá, {data.lead?.nome || user?.email?.split('@')[0]} 👋
            </h1>

            {!data.membro ? (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Cadastro em análise</CardTitle>
                  <CardDescription className="text-yellow-700">
                    Seu cadastro foi recebido. Em breve nossa equipe confirmará sua vaga.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <>
                {data.plano && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-pink-600" />
                        <CardTitle>Seu Plano</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">{data.plano.nome}</span>
                        <Badge className="bg-pink-100 text-pink-700">
                          R$ {data.plano.preco.toFixed(2)}/mês
                        </Badge>
                      </div>
                      <p className="text-gray-600">Brinde: <strong>{data.plano.brinde}</strong></p>
                      <p className="text-gray-600">Crédito sorteio: <strong>R$ {data.plano.credito_sorteio.toFixed(2)}</strong></p>
                      <p className="text-gray-600">Desconto: <strong>{data.plano.desconto_servicos}</strong></p>
                    </CardContent>
                  </Card>
                )}

                {data.grupo && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        <CardTitle>Seu Grupo</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{data.grupo.nome}</span>
                        <Badge variant="outline">
                          {data.grupo.vagas_preenchidas}/{data.grupo.total_vagas} membros
                        </Badge>
                      </div>

                      {data.membro.numero_sorteio != null && (
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <Trophy className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Seu número no sorteio</p>
                          <p className="text-3xl font-bold text-purple-700">#{data.membro.numero_sorteio}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-6 gap-1">
                        {Array.from({ length: data.grupo.total_vagas }, (_, i) => i + 1).map((n) => (
                          <div
                            key={n}
                            className={`h-8 rounded text-xs flex items-center justify-center font-medium ${
                              n === data.membro?.numero_sorteio
                                ? 'bg-purple-600 text-white'
                                : n <= data.grupo!.vagas_preenchidas
                                ? 'bg-pink-200 text-pink-800'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {data.membro.data_contemplacao && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-green-800">Contemplação</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-700">
                        Você foi contemplado em{' '}
                        {new Date(data.membro.data_contemplacao).toLocaleDateString('pt-BR')}.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
