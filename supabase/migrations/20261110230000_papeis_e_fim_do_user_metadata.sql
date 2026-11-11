-- Clube Beleza. Rodar só no projeto ooyyenjndsaptlxidgko.
-- Não aplicar em pvkrwjryvwsfwaxougyy.
-- Esta migration não lê nem altera linhas de public.leads.

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'operador')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(requested_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = requested_role
  );
$$;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role in ('admin', 'operador')
  );
$$;

revoke all on function public.has_role(text) from public, anon;
revoke all on function public.is_operator() from public, anon;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.is_operator() to authenticated;

-- As 6 políticas que o linter marca como 0015 rls_references_user_metadata.
drop policy if exists leads_select on public.leads;
drop policy if exists leads_update_admin on public.leads;
drop policy if exists planos_admin_write on public.planos;
drop policy if exists grupos_admin_write on public.grupos;
drop policy if exists membros_select on public.membros;
drop policy if exists membros_admin_write on public.membros;

-- As outras políticas antigas, para recriar o conjunto sem user_metadata.
drop policy if exists leads_insert_public on public.leads;
drop policy if exists planos_select_public on public.planos;
drop policy if exists grupos_select_authenticated on public.grupos;

-- Qualquer política que ainda cite user_metadata, pelo nome que existir no banco.
do $$
declare
  politica record;
begin
  for politica in
    select schemaname, tablename, policyname
    from pg_policies
    where coalesce(qual, '') ilike '%user_metadata%'
       or coalesce(with_check, '') ilike '%user_metadata%'
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      politica.policyname,
      politica.schemaname,
      politica.tablename
    );
  end loop;
end $$;
