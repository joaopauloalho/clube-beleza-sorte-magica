-- Clube Beleza. Rodar depois de 20261110220000_user_roles_and_rls.sql,
-- somente no projeto clube-beleza-sorte-magica (ref ooyyenjndsaptlxidgko).

create table if not exists public.consentimentos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  tipo text not null check (tipo in ('regulamento', 'whatsapp')),
  texto_aceito text not null,
  aceito_em timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists consentimentos_lead_id_idx on public.consentimentos (lead_id);

alter table public.consentimentos enable row level security;

revoke all on table public.consentimentos from anon, authenticated;
grant select on table public.consentimentos to authenticated;
grant all on table public.consentimentos to service_role;

drop policy if exists consentimentos_select_own_or_operator on public.consentimentos;
create policy consentimentos_select_own_or_operator
  on public.consentimentos
  for select
  to authenticated
  using (
    (select private.is_operator((select auth.uid())))
    or lead_id in (select private.current_lead_ids())
  );

-- Sem política de insert/update/delete: a lista de espera grava pelo service role.
-- O texto aceito não pode ser editado pelo cliente.

create table if not exists public.webhook_events (
  id text primary key,
  event_type text not null,
  dev_mode boolean not null,
  processed_at timestamptz not null default now()
);

alter table public.webhook_events enable row level security;

revoke all on table public.webhook_events from anon, authenticated;
grant all on table public.webhook_events to service_role;

create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete set null,
  abacate_subscription_id text not null unique,
  metodo text,
  status text not null check (status in ('ativa', 'inadimplente', 'cancelada', 'autorizacao_revogada')),
  motivo text,
  ultimo_evento text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  assinatura_id uuid references public.assinaturas (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  evento_id text not null unique,
  abacate_installment_id text,
  status text not null check (status in ('pago', 'falhou', 'saldo_insuficiente', 'autorizacao_revogada')),
  motivo text,
  tentativa integer,
  created_at timestamptz not null default now()
);

alter table public.assinaturas enable row level security;
alter table public.pagamentos enable row level security;

revoke all on table public.assinaturas from anon, authenticated;
revoke all on table public.pagamentos from anon, authenticated;
grant select on table public.assinaturas to authenticated;
grant select on table public.pagamentos to authenticated;
grant all on table public.assinaturas to service_role;
grant all on table public.pagamentos to service_role;

drop policy if exists assinaturas_select_own_or_operator on public.assinaturas;
create policy assinaturas_select_own_or_operator
  on public.assinaturas
  for select
  to authenticated
  using (
    (select private.is_operator((select auth.uid())))
    or lead_id in (select private.current_lead_ids())
  );

drop policy if exists pagamentos_select_own_or_operator on public.pagamentos;
create policy pagamentos_select_own_or_operator
  on public.pagamentos
  for select
  to authenticated
  using (
    (select private.is_operator((select auth.uid())))
    or lead_id in (select private.current_lead_ids())
  );
