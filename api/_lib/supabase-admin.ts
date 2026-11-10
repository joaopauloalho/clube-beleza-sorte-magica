import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function clienteServico(): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !chave) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente.')
  }
  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function usuarioDoBearer(autorizacao: string | undefined): Promise<{ id: string; email: string | null }> {
  const token = autorizacao?.startsWith('Bearer ') ? autorizacao.slice(7).trim() : ''
  if (!token) throw Object.assign(new Error('Sessão ausente.'), { status: 401 })
  const admin = clienteServico()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) throw Object.assign(new Error('Sessão inválida.'), { status: 401 })
  return { id: data.user.id, email: data.user.email ?? null }
}

export async function exigirOperador(autorizacao: string | undefined): Promise<{ id: string }> {
  const usuario = await usuarioDoBearer(autorizacao)
  const admin = clienteServico()
  const { data, error } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', usuario.id)
    .maybeSingle()
  if (error) throw Object.assign(new Error('Não foi possível ler o papel.'), { status: 500 })
  if (!data || (data.role !== 'admin' && data.role !== 'operador')) {
    throw Object.assign(new Error('Acesso restrito a admin ou operador.'), { status: 403 })
  }
  return { id: usuario.id }
}
