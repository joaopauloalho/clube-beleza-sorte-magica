export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          nome: string
          email: string | null
          whatsapp: string
          cpf: string | null
          plano_interesse: string | null
          checkout_id: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email?: string | null
          whatsapp: string
          cpf?: string | null
          plano_interesse?: string | null
          checkout_id?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string | null
          whatsapp?: string
          cpf?: string | null
          plano_interesse?: string | null
          checkout_id?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      planos: {
        Row: {
          id: string
          nome: string
          preco: number
          brinde: string
          valor_brinde: number
          credito_sorteio: number
          desconto_servicos: string
          destaque: boolean
          ativo: boolean
          total_12_meses: number | null
          bonus_clinica: string | null
        }
        Insert: {
          id?: string
          nome: string
          preco: number
          brinde: string
          valor_brinde: number
          credito_sorteio: number
          desconto_servicos: string
          destaque?: boolean
          ativo?: boolean
          total_12_meses?: number | null
          bonus_clinica?: string | null
        }
        Update: {
          id?: string
          nome?: string
          preco?: number
          brinde?: string
          valor_brinde?: number
          credito_sorteio?: number
          desconto_servicos?: string
          destaque?: boolean
          ativo?: boolean
          total_12_meses?: number | null
          bonus_clinica?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'operador'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'operador'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'operador'
          created_at?: string
        }
        Relationships: []
      }
      grupos: {
        Row: {
          id: string
          nome: string
          plano_id: string
          total_vagas: number
          vagas_preenchidas: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          plano_id: string
          total_vagas?: number
          vagas_preenchidas?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          plano_id?: string
          total_vagas?: number
          vagas_preenchidas?: number
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      membros: {
        Row: {
          id: string
          lead_id: string
          plano_id: string
          grupo_id: string
          numero_sorteio: number | null
          status: string
          data_contemplacao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          plano_id: string
          grupo_id: string
          numero_sorteio?: number | null
          status?: string
          data_contemplacao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          plano_id?: string
          grupo_id?: string
          numero_sorteio?: number | null
          status?: string
          data_contemplacao?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
