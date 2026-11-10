import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '@/lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

async function loadIsOperator(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  if (error || !data) return false
  return data.some((row) => row.role === 'admin' || row.role === 'operador')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionKnown, setSessionKnown] = useState(!supabaseConfigured)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(supabaseConfigured)

  useEffect(() => {
    if (!supabaseConfigured) return

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setSessionKnown(true)
    }).catch(() => {
      if (!active) return
      setSessionKnown(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setSessionKnown(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!sessionKnown) return

    const userId = session?.user.id
    if (!supabaseConfigured || !userId) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    loadIsOperator(userId)
      .then((allowed) => {
        if (!active) return
        setIsAdmin(allowed)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setIsAdmin(false)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [session, sessionKnown])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const user = session?.user ?? null

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
