import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Projeto clube-beleza-sorte-magica (ref ooyyenjndsaptlxidgko).
// A URL e a chave anônima vêm só de variáveis de ambiente.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Fallback evita que createClient lance erro e derrube o app inteiro
// quando as variáveis de ambiente ainda não foram configuradas.
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
