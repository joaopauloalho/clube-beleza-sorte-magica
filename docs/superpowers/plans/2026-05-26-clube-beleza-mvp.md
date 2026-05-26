# Clube Beleza Sorte Mágica — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static Vite + React landing page into a functional MVP with Supabase backend, member area (magic link auth), and admin panel.

**Architecture:** SPA using Supabase project `clube-beleza-sorte-magica` (`ooyyenjndsaptlxidgko`, sa-east-1) for database + auth. Four new tables (leads, planos, grupos, membros) in a dedicated, clean project. Auth via Supabase magic links; admin access gated by `user_metadata.role = 'admin'`. ProtectedRoute wraps /dashboard and /admin.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui, @supabase/supabase-js v2, react-hook-form + zod (already installed), @tanstack/react-query (already installed), react-router-dom v6 (already installed)

---

## File Structure

**Create:**
- `.env.local` — Supabase credentials (never commit)
- `src/lib/supabase.ts` — typed Supabase client singleton
- `src/lib/database.types.ts` — TypeScript types for all 4 tables
- `src/lib/validations.ts` — Zod schema for the registration form + WhatsApp mask utility
- `src/hooks/use-auth.tsx` — AuthContext, AuthProvider, useAuth hook
- `src/components/ProtectedRoute.tsx` — redirects to /entrar if not authenticated
- `src/pages/Entrar.tsx` — magic link login page
- `src/pages/Dashboard.tsx` — member area (protected)
- `src/pages/Admin.tsx` — admin panel (protected + admin role)

**Modify:**
- `src/App.tsx` — wrap in AuthProvider, add /entrar /dashboard /admin routes
- `src/pages/Index.tsx` — replace fake form with react-hook-form + Supabase insert

---

## PHASE 1 — SUPABASE FOUNDATION

### Task 1: Install @supabase/supabase-js

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install the package**

```bash
npm install @supabase/supabase-js
```

Expected output: `added 1 package` with no errors.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @supabase/supabase-js"
```

---

### Task 2: Create .env.local

**Files:** Create `.env.local`

- [ ] **Step 1: Create `.env.local` with the project credentials**

```
VITE_SUPABASE_URL=https://ooyyenjndsaptlxidgko.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9veXllbmpuZHNhcHRseGlkZ2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjYzNjQsImV4cCI6MjA5NTM0MjM2NH0.ts6sld9BxIyIdU6FFD-IZD2jPK3tJoAAeF36XKTC2-Q
```

- [ ] **Step 2: Verify `.gitignore` already covers `.env.local`**

Check that `.gitignore` contains `*.local` or `.env.local`. This file must NEVER be committed.

---

### Task 3: Create Supabase client

**Files:** Create `src/lib/supabase.ts`

- [ ] **Step 1: Create the file**

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add typed Supabase client"
```

---

### Task 4: Create TypeScript database types

**Files:** Create `src/lib/database.types.ts`

- [ ] **Step 1: Create the file**

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          nome: string
          email: string
          whatsapp: string
          plano_interesse: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          whatsapp: string
          plano_interesse?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          whatsapp?: string
          plano_interesse?: string | null
          status?: string
          created_at?: string
        }
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
        }
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
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/database.types.ts
git commit -m "feat: add database TypeScript types"
```

---

### Task 5: Apply database migrations via Supabase MCP

Apply each SQL block via `mcp__claude_ai_Supabase__apply_migration` targeting project `ooyyenjndsaptlxidgko`.

- [ ] **Step 1: Create `leads` table**

```sql
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  whatsapp text NOT NULL,
  plano_interesse text,
  status text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_insert_public" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_select" ON leads
  FOR SELECT USING (
    auth.email() = email
    OR (auth.jwt() -> 'user_metadata') ->> 'role' = 'admin'
  );

CREATE POLICY "leads_update_admin" ON leads
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata') ->> 'role' = 'admin'
  );
```

- [ ] **Step 2: Create `planos` table**

```sql
CREATE TABLE planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  preco numeric NOT NULL,
  brinde text NOT NULL,
  valor_brinde numeric NOT NULL,
  credito_sorteio numeric NOT NULL,
  desconto_servicos text NOT NULL,
  destaque boolean DEFAULT false,
  ativo boolean DEFAULT true
);

ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planos_select_public" ON planos
  FOR SELECT USING (true);

CREATE POLICY "planos_admin_write" ON planos
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata') ->> 'role' = 'admin'
  );
```

- [ ] **Step 3: Create `grupos` table**

```sql
CREATE TABLE grupos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  plano_id uuid REFERENCES planos(id),
  total_vagas integer DEFAULT 24,
  vagas_preenchidas integer DEFAULT 0,
  status text DEFAULT 'aberto',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grupos_select_authenticated" ON grupos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "grupos_admin_write" ON grupos
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata') ->> 'role' = 'admin'
  );
```

- [ ] **Step 4: Create `membros` table**

```sql
CREATE TABLE membros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  plano_id uuid REFERENCES planos(id),
  grupo_id uuid REFERENCES grupos(id),
  numero_sorteio integer,
  status text DEFAULT 'ativo',
  data_contemplacao timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE membros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "membros_select" ON membros
  FOR SELECT USING (
    lead_id IN (
      SELECT id FROM leads WHERE email = auth.email()
    )
    OR (auth.jwt() -> 'user_metadata') ->> 'role' = 'admin'
  );

CREATE POLICY "membros_admin_write" ON membros
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata') ->> 'role' = 'admin'
  );
```

- [ ] **Step 5: Seed `planos` table**

```sql
INSERT INTO planos (nome, preco, brinde, valor_brinde, credito_sorteio, desconto_servicos, destaque, ativo)
VALUES
  ('Beleza Essencial', 49.90, 'Limpeza de Pele',  197, 700,  '10%', false, true),
  ('Beleza Radiante',  69.90, 'Peeling',           217, 1000, '15%', false, true),
  ('Beleza Suprema',   99.90, 'Microagulhamento',  327, 1500, '20%', true,  true);
```

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: apply Supabase migrations and seed planos"
```

---

## PHASE 2 — CONNECT REGISTRATION FORM

### Task 6: Create validation schema and WhatsApp mask utility

**Files:** Create `src/lib/validations.ts`

- [ ] **Step 1: Create the file**

```typescript
import { z } from 'zod'

export const cadastroSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato: (99) 99999-9999'),
  plano_interesse: z.string().min(1, 'Selecione um plano'),
})

export type CadastroFormData = z.infer<typeof cadastroSchema>

export function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat: add registration form Zod schema and WhatsApp mask"
```

---

### Task 7: Update Index.tsx — replace fake form with real Supabase insert

**Files:** Modify `src/pages/Index.tsx`

- [ ] **Step 1: Replace imports at the top of Index.tsx**

Replace the existing import block (lines 1–11) with:

```typescript
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Gift, Trophy, Sparkles, Star, Clock, Users, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AnimatedSection, StaggeredChildren } from "@/hooks/use-scroll-animation";
import heroImage from "@/assets/hero-woman.jpg";
import { supabase } from "@/lib/supabase";
import { cadastroSchema, maskWhatsApp, type CadastroFormData } from "@/lib/validations";
```

- [ ] **Step 2: Replace the `useState` + `handleSubmit` + `scrollToForm` block**

The current block (approx lines 14–31) looks like:
```typescript
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Em breve entraremos em contato para confirmar sua vaga no Clube de Estética.",
    });
    setFormData({ name: "", email: "", whatsapp: "" });
  };

  const scrollToForm = () => {
    document.getElementById("cadastro")?.scrollIntoView({ behavior: "smooth" });
  };
```

Replace with:

```typescript
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({ resolver: zodResolver(cadastroSchema) })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = async (data: CadastroFormData) => {
    setSubmitError(null)
    const { error } = await supabase.from('leads').insert({
      nome: data.nome,
      email: data.email,
      whatsapp: data.whatsapp,
      plano_interesse: data.plano_interesse,
    })
    if (error) {
      setSubmitError(
        error.code === '23505'
          ? 'Este email já está cadastrado. Entre em contato para verificar sua vaga.'
          : 'Erro ao realizar cadastro. Tente novamente.'
      )
      return
    }
    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Em breve entraremos em contato para confirmar sua vaga no Clube de Estética.",
    })
    reset()
  }

  const scrollToForm = () => {
    document.getElementById("cadastro")?.scrollIntoView({ behavior: "smooth" })
  }
```

- [ ] **Step 3: Replace the form JSX block inside the `#cadastro` section**

The current form JSX (lines 428–476):
```tsx
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="group">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome"
                        className="mt-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-medium"
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="mt-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-medium"
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="mt-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-medium"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-gradient-gold hover:opacity-90 text-white shadow-gold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      Quero Garantir Minha Vaga Agora
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Ao cadastrar, você concorda com nossos termos e condições.
                      Seus dados estão seguros e não serão compartilhados.
                    </p>
                  </form>
```

Replace with:

```tsx
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="group">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        placeholder="Seu nome completo"
                        {...register("nome")}
                        className={`mt-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-medium ${errors.nome ? "border-red-500" : ""}`}
                      />
                      {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                    </div>

                    <div className="group">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        {...register("email")}
                        className={`mt-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-medium ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="group">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        placeholder="(99) 99999-9999"
                        value={watch("whatsapp") ?? ""}
                        onChange={(e) => setValue("whatsapp", maskWhatsApp(e.target.value), { shouldValidate: true })}
                        className={`mt-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-medium ${errors.whatsapp ? "border-red-500" : ""}`}
                      />
                      {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                    </div>

                    <div className="group">
                      <Label htmlFor="plano">Plano de interesse</Label>
                      <Select onValueChange={(v) => setValue("plano_interesse", v, { shouldValidate: true })}>
                        <SelectTrigger className={`mt-1 ${errors.plano_interesse ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beleza Essencial">Beleza Essencial — R$ 49,90/mês</SelectItem>
                          <SelectItem value="Beleza Radiante">Beleza Radiante — R$ 69,90/mês</SelectItem>
                          <SelectItem value="Beleza Suprema">Beleza Suprema — R$ 99,90/mês</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.plano_interesse && <p className="text-red-500 text-xs mt-1">{errors.plano_interesse.message}</p>}
                    </div>

                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{submitError}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-gold hover:opacity-90 text-white shadow-gold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {isSubmitting ? "Enviando..." : "Quero Garantir Minha Vaga Agora"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Ao cadastrar, você concorda com nossos termos e condições.
                      Seus dados estão seguros e não serão compartilhados.
                    </p>
                  </form>
```

- [ ] **Step 4: Test the form**

Run `npm run dev`. Open the browser, fill in the form, submit. Verify the row appears in Supabase Table Editor → `leads`. Try submitting with the same email again — confirm the friendly duplicate error appears.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat: connect registration form to Supabase leads table"
```

---

## PHASE 3 — AUTHENTICATION

> **Order matters:** Tasks 8 → 9 → 10 → 11 (stubs) → 12 (App.tsx). App.tsx imports Dashboard and Admin, so stubs must exist first.

### Task 8: Create AuthContext and useAuth hook

**Files:** Create `src/hooks/use-auth.tsx`

- [ ] **Step 1: Create the file**

```typescript
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const user = session?.user ?? null
  const isAdmin = user?.user_metadata?.role === 'admin'

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
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-auth.tsx
git commit -m "feat: add AuthContext and useAuth hook"
```

---

### Task 9: Create ProtectedRoute component

**Files:** Create `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Create the file**

```typescript
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    )
  }

  if (!session) return <Navigate to="/entrar" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProtectedRoute.tsx
git commit -m "feat: add ProtectedRoute component"
```

---

### Task 10: Create /entrar login page

**Files:** Create `src/pages/Entrar.tsx`

- [ ] **Step 1: Create the file**

```typescript
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Sparkles } from 'lucide-react'

export default function Entrar() {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Sparkles className="h-8 w-8 text-pink-600" />
          </div>
          <CardTitle className="text-2xl">Área do Membro</CardTitle>
          <CardDescription>
            {sent
              ? 'Verifique seu email para o link de acesso'
              : 'Digite seu email para receber um link de acesso'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                Link enviado para <strong>{email}</strong>. Verifique sua caixa de entrada.
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setSent(false); setEmail('') }}
              >
                Usar outro email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link de Acesso'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Configure Supabase Auth redirect URL**

In Supabase Dashboard → Authentication → URL Configuration, add to "Redirect URLs":
- `http://localhost:8080/dashboard` (local dev — adjust port if different)
- Your production URL when deploying to Vercel/Netlify

- [ ] **Step 3: Commit**

```bash
git add src/pages/Entrar.tsx
git commit -m "feat: add magic link login page /entrar"
```

---

### Task 11: Create Dashboard.tsx and Admin.tsx stubs

Both files must exist before App.tsx (Task 12) can import them.

**Files:** Create `src/pages/Dashboard.tsx`, Create `src/pages/Admin.tsx`

- [ ] **Step 1: Create Dashboard.tsx stub**

```typescript
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, signOut } = useAuth()

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
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Olá, {user?.email?.split('@')[0]} 👋
        </h1>
        <Card>
          <CardHeader><CardTitle>Sua área está sendo preparada</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600">Em breve você verá seu plano, grupo e posição no sorteio aqui.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create Admin.tsx stub**

```typescript
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, LogOut } from 'lucide-react'

export default function Admin() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-purple-700">Admin — Clube de Estética</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Painel Administrativo</h1>
        <Card>
          <CardHeader><CardTitle>Painel em construção</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600">As funcionalidades serão implementadas em breve.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/Admin.tsx
git commit -m "feat: add Dashboard and Admin stub pages"
```

---

### Task 12: Update App.tsx with AuthProvider and new routes

**Files:** Modify `src/App.tsx`

- [ ] **Step 1: Replace the entire contents of App.tsx**

```typescript
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Entrar from "./pages/Entrar";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/entrar" element={<Entrar />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

- [ ] **Step 2: Verify all 4 routes load**

Run `npm run dev`. Check:
- `/` — landing page renders ✓
- `/entrar` — login form renders ✓
- `/dashboard` — redirects to /entrar (unauthenticated) ✓
- `/admin` — redirects to /entrar (unauthenticated) ✓

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add auth routing and AuthProvider to App"
```

---

## PHASE 4 — MEMBER DASHBOARD

### Task 13: Build full Dashboard with Supabase data

**Files:** Modify `src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace Dashboard.tsx with full implementation**

```typescript
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
```

- [ ] **Step 2: Set your user as admin for testing**

Run in Supabase SQL Editor (replace email with your email):

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your@email.com';
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: build member dashboard with Supabase data"
```

---

## PHASE 5 — ADMIN PANEL

### Task 14: Build full Admin panel

**Files:** Modify `src/pages/Admin.tsx`

- [ ] **Step 1: Replace Admin.tsx with full implementation**

```typescript
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, LogOut, Download, Users, Shuffle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Lead {
  id: string
  nome: string
  email: string
  whatsapp: string
  plano_interesse: string | null
  status: string
  created_at: string
}

interface Grupo {
  id: string
  nome: string
  plano_id: string
  vagas_preenchidas: number
  total_vagas: number
  status: string
}

export default function Admin() {
  const { signOut } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlano, setFilterPlano] = useState('all')
  const [raffleOrder, setRaffleOrder] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [leadsRes, gruposRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('grupos').select('*').order('created_at', { ascending: false }),
    ])
    if (leadsRes.data) setLeads(leadsRes.data)
    if (gruposRes.data) setGrupos(gruposRes.data)
    setLoading(false)
  }

  const filteredLeads = leads.filter((l) => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false
    if (filterPlano !== 'all' && l.plano_interesse !== filterPlano) return false
    return true
  })

  function exportCSV() {
    const headers = ['Nome', 'Email', 'WhatsApp', 'Plano', 'Status', 'Data']
    const rows = filteredLeads.map((l) => [
      l.nome, l.email, l.whatsapp,
      l.plano_interesse ?? '',
      l.status,
      new Date(l.created_at).toLocaleDateString('pt-BR'),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function runRaffle() {
    const nums = Array.from({ length: 24 }, (_, i) => i + 1)
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]]
    }
    setRaffleOrder(nums)
    toast({ title: 'Sorteio simulado!', description: 'Ordem gerada via Fisher-Yates.' })
  }

  async function convertToMember(lead: Lead) {
    if (!lead.plano_interesse) {
      toast({ title: 'Erro', description: 'Lead sem plano selecionado.', variant: 'destructive' })
      return
    }

    const { data: plano } = await supabase
      .from('planos').select('id').eq('nome', lead.plano_interesse).single()

    if (!plano) {
      toast({ title: 'Erro', description: 'Plano não encontrado.', variant: 'destructive' })
      return
    }

    const { data: grupo } = await supabase
      .from('grupos')
      .select('id, vagas_preenchidas, total_vagas')
      .eq('plano_id', plano.id)
      .eq('status', 'aberto')
      .lt('vagas_preenchidas', 24)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    let grupoId: string
    let novaPosicao: number

    if (grupo) {
      grupoId = grupo.id
      novaPosicao = grupo.vagas_preenchidas + 1
      await supabase.from('grupos').update({ vagas_preenchidas: novaPosicao }).eq('id', grupoId)
    } else {
      const { data: novoGrupo } = await supabase
        .from('grupos')
        .insert({ nome: `Grupo ${lead.plano_interesse} - ${Date.now()}`, plano_id: plano.id, vagas_preenchidas: 1 })
        .select('id').single()

      if (!novoGrupo) {
        toast({ title: 'Erro', description: 'Falha ao criar grupo.', variant: 'destructive' })
        return
      }
      grupoId = novoGrupo.id
      novaPosicao = 1
    }

    const [membroRes, leadRes] = await Promise.all([
      supabase.from('membros').insert({
        lead_id: lead.id, plano_id: plano.id, grupo_id: grupoId, numero_sorteio: novaPosicao,
      }),
      supabase.from('leads').update({ status: 'membro' }).eq('id', lead.id),
    ])

    if (membroRes.error || leadRes.error) {
      toast({ title: 'Erro', description: 'Falha ao converter.', variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso!', description: `${lead.nome} agora é membro do clube.` })
    fetchData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-purple-700">Admin — Clube de Estética</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Total de Leads</p>
              <p className="text-3xl font-bold">{leads.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Membros Ativos</p>
              <p className="text-3xl font-bold text-pink-600">
                {leads.filter((l) => l.status === 'membro').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">Grupos Abertos</p>
              <p className="text-3xl font-bold text-purple-600">
                {grupos.filter((g) => g.status === 'aberto').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leads Cadastrados
              </CardTitle>
              <Button size="sm" variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
            <div className="flex gap-3 mt-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="membro">Membro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlano} onValueChange={setFilterPlano}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  <SelectItem value="Beleza Essencial">Essencial</SelectItem>
                  <SelectItem value="Beleza Radiante">Radiante</SelectItem>
                  <SelectItem value="Beleza Suprema">Suprema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nome}</TableCell>
                      <TableCell className="text-sm">{lead.email}</TableCell>
                      <TableCell className="text-sm">{lead.whatsapp}</TableCell>
                      <TableCell className="text-sm">{lead.plano_interesse ?? '—'}</TableCell>
                      <TableCell>
                        <Badge className={lead.status === 'membro' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {lead.status === 'pendente' && (
                          <Button size="sm" onClick={() => convertToMember(lead)}>
                            Tornar Membro
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                        Nenhum lead encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Raffle Simulator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Simulador de Sorteio Interno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runRaffle} variant="outline">
              <Shuffle className="h-4 w-4 mr-2" />
              Simular Sorteio (24 posições)
            </Button>
            {raffleOrder.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-medium">Ordem de contemplação (Fisher-Yates):</p>
                <div className="grid grid-cols-6 gap-2">
                  {raffleOrder.map((num, idx) => (
                    <div key={num} className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">Mês {idx + 1}</p>
                      <p className="font-bold text-purple-700">#{num}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grupos.map((grupo) => (
                <Card key={grupo.id} className="border border-gray-200">
                  <CardContent className="pt-4 space-y-2">
                    <p className="font-medium text-sm truncate">{grupo.nome}</p>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${(grupo.vagas_preenchidas / grupo.total_vagas) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {grupo.vagas_preenchidas}/{grupo.total_vagas} vagas •{' '}
                      <span className={grupo.status === 'aberto' ? 'text-green-600' : 'text-gray-400'}>
                        {grupo.status}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
              {grupos.length === 0 && (
                <p className="text-gray-400 text-sm col-span-3">Nenhum grupo criado ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Admin.tsx
git commit -m "feat: build full admin panel with leads, groups, and raffle simulator"
```

---

## Spec Coverage Check

| Requirement | Task |
|---|---|
| Install @supabase/supabase-js | Task 1 |
| `.env.local` with credentials | Task 2 |
| `src/lib/supabase.ts` | Task 3 |
| TypeScript types for all tables | Task 4 |
| leads / planos / grupos / membros tables | Task 5 |
| RLS policies (insert public, select own, admin all) | Task 5 |
| Seed planos with 3 plans | Task 5 |
| Zod validation on form | Task 6 |
| WhatsApp mask `(99) 99999-9999` | Task 6 |
| Form → Supabase leads insert | Task 7 |
| Duplicate email friendly error | Task 7 |
| Plano dropdown in form | Task 7 |
| Supabase magic link auth | Tasks 8, 10 |
| ProtectedRoute component | Task 9 |
| `/entrar` login page | Task 10 |
| `/dashboard` protected route | Tasks 11, 12 |
| `/admin` protected + admin role route | Tasks 11, 12 |
| AuthProvider wraps App | Task 12 |
| Dashboard: plan card | Task 13 |
| Dashboard: group + 24-cell position grid | Task 13 |
| Dashboard: contemplation info | Task 13 |
| Dashboard: logout | Task 13 |
| Admin: leads table with filters | Task 14 |
| Admin: convert lead → member | Task 14 |
| Admin: groups visualization with progress bar | Task 14 |
| Admin: raffle simulator (Fisher-Yates) | Task 14 |
| Admin: CSV export with BOM for Excel | Task 14 |
