import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '@/lib/supabase'

export type Papel = 'admin' | 'operador' | null

interface AuthContextType {
  session: Session | null
  user: User | null
  papel: Papel
  isOperator: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [papel, setPapel] = useState<Papel>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    let ativo = true

    const carregarPapel = async (userId?: string) => {
      if (!userId) {
        if (ativo) setPapel(null)
        return
      }
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
      const role = data?.role
      if (!ativo) return
      setPapel(role === 'admin' || role === 'operador' ? role : null)
    }

    supabase.auth.getSession().then(async ({ data: { session: sessao } }) => {
      if (!ativo) return
      setSession(sessao)
      await carregarPapel(sessao?.user?.id)
      if (ativo) setLoading(false)
    }).catch(() => {
      if (ativo) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sessao) => {
      setSession(sessao)
      void carregarPapel(sessao?.user?.id)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setPapel(null)
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      papel,
      isOperator: papel === 'admin' || papel === 'operador',
      loading,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth deve ficar dentro de AuthProvider')
  return contexto
}
