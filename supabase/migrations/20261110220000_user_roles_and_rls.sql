-- Clube Beleza. Rodar somente no projeto clube-beleza-sorte-magica (ref ooyyenjndsaptlxidgko).
-- Não cria cobrança e não altera outro projeto.
-- Papel de operador fica em public.user_roles. Não usar user_metadata (o usuário edita esse campo).

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

do $$
begin
  create type public.app_role as enum ('admin', 'operador');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

revoke all on table public.user_roles from anon, authenticated;
grant select on table public.user_roles to authenticated;
grant all on table public.user_roles to service_role;

-- Funções fora do schema exposto na API. security definer evita recursão de RLS.
create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

create or replace function private.is_operator(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role(_user_id, 'admin')
      or private.has_role(_user_id, 'operador');
$$;

create or replace function private.current_lead_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.leads
  where email is not null
    and email = (select auth.email());
$$;

revoke all on function private.has_role(uuid, public.app_role) from public;
revoke all on function private.is_operator(uuid) from public;
revoke all on function private.current_lead_ids() from public;
grant execute on function private.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function private.is_operator(uuid) to anon, authenticated, service_role;
grant execute on function private.current_lead_ids() to authenticated, service_role;

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
  on public.user_roles
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.is_operator((select auth.uid())))
  );

-- Leads: visitante só insere lista de espera e não lê a fila.
alter table public.leads alter column email drop not null;

create unique index if not exists leads_whatsapp_unique on public.leads (whatsapp);

drop policy if exists leads_insert_public on public.leads;
drop policy if exists leads_select on public.leads;
drop policy if exists leads_update_admin on public.leads;
drop policy if exists leads_insert_lista_espera on public.leads;
drop policy if exists leads_select_own_or_operator on public.leads;
drop policy if exists leads_update_operator on public.leads;
drop policy if exists leads_delete_operator on public.leads;

create policy leads_insert_lista_espera
  on public.leads
  for insert
  to anon, authenticated
  with check (
    status = 'lista_espera'
    and checkout_id is null
    and email is null
    and char_length(btrim(nome)) >= 3
    and char_length(btrim(whatsapp)) between 8 and 20
  );

create policy leads_select_own_or_operator
  on public.leads
  for select
  to authenticated
  using (
    (select private.is_operator((select auth.uid())))
    or (
      email is not null
      and (select auth.email()) is not null
      and email = (select auth.email())
    )
  );

create policy leads_update_operator
  on public.leads
  for update
  to authenticated
  using ((select private.is_operator((select auth.uid()))))
  with check ((select private.is_operator((select auth.uid()))));

create policy leads_delete_operator
  on public.leads
  for delete
  to authenticated
  using ((select private.is_operator((select auth.uid()))));

-- Planos: catálogo ativo é público. Escrita só operador.
alter table public.planos
  add column if not exists total_12_meses numeric,
  add column if not exists bonus_clinica text;

drop policy if exists planos_select_public on public.planos;
drop policy if exists planos_admin_write on public.planos;
drop policy if exists planos_select_active_or_operator on public.planos;
drop policy if exists planos_write_operator on public.planos;

create policy planos_select_active_or_operator
  on public.planos
  for select
  to anon, authenticated
  using (
    ativo is true
    or (select private.is_operator((select auth.uid())))
  );

create policy planos_write_operator
  on public.planos
  for all
  to authenticated
  using ((select private.is_operator((select auth.uid()))))
  with check ((select private.is_operator((select auth.uid()))));

-- Grupos: membro lê só o próprio grupo. Operador lê e escreve.
drop policy if exists grupos_select_authenticated on public.grupos;
drop policy if exists grupos_admin_write on public.grupos;
drop policy if exists grupos_select_own_or_operator on public.grupos;
drop policy if exists grupos_write_operator on public.grupos;

create policy grupos_select_own_or_operator
  on public.grupos
  for select
  to authenticated
  using (
    (select private.is_operator((select auth.uid())))
    or id in (
      select m.grupo_id
      from public.membros m
      where m.lead_id in (select private.current_lead_ids())
    )
  );

create policy grupos_write_operator
  on public.grupos
  for all
  to authenticated
  using ((select private.is_operator((select auth.uid()))))
  with check ((select private.is_operator((select auth.uid()))));

-- Membros: cada pessoa lê a própria linha. Operador lê e escreve.
drop policy if exists membros_select on public.membros;
drop policy if exists membros_admin_write on public.membros;
drop policy if exists membros_select_own_or_operator on public.membros;
drop policy if exists membros_write_operator on public.membros;

create policy membros_select_own_or_operator
  on public.membros
  for select
  to authenticated
  using (
    (select private.is_operator((select auth.uid())))
    or lead_id in (select private.current_lead_ids())
  );

create policy membros_write_operator
  on public.membros
  for all
  to authenticated
  using ((select private.is_operator((select auth.uid()))))
  with check ((select private.is_operator((select auth.uid()))));

-- Catálogo alinhado a src/lib/plans.ts. Brinde saiu do produto; as colunas antigas ficam vazias.
update public.planos
set preco = 50, total_12_meses = 600, credito_sorteio = 700, bonus_clinica = '17%',
    desconto_servicos = '10%', brinde = '', valor_brinde = 0, destaque = false, ativo = true
where nome = 'Beleza Essencial';

update public.planos
set preco = 75, total_12_meses = 900, credito_sorteio = 1125, bonus_clinica = '25%',
    desconto_servicos = '15%', brinde = '', valor_brinde = 0, destaque = false, ativo = true
where nome = 'Beleza Radiante';

update public.planos
set preco = 100, total_12_meses = 1200, credito_sorteio = 1600, bonus_clinica = '33%',
    desconto_servicos = '20%', brinde = '', valor_brinde = 0, destaque = true, ativo = true
where nome = 'Beleza Suprema';

insert into public.planos (nome, preco, total_12_meses, credito_sorteio, bonus_clinica, desconto_servicos, brinde, valor_brinde, destaque, ativo)
select 'Beleza Essencial', 50, 600, 700, '17%', '10%', '', 0, false, true
where not exists (select 1 from public.planos where nome = 'Beleza Essencial');

insert into public.planos (nome, preco, total_12_meses, credito_sorteio, bonus_clinica, desconto_servicos, brinde, valor_brinde, destaque, ativo)
select 'Beleza Radiante', 75, 900, 1125, '25%', '15%', '', 0, false, true
where not exists (select 1 from public.planos where nome = 'Beleza Radiante');

insert into public.planos (nome, preco, total_12_meses, credito_sorteio, bonus_clinica, desconto_servicos, brinde, valor_brinde, destaque, ativo)
select 'Beleza Suprema', 100, 1200, 1600, '33%', '20%', '', 0, true, true
where not exists (select 1 from public.planos where nome = 'Beleza Suprema');

-- O primeiro operador é inserido à mão, depois que o usuário existir em auth.users:
-- insert into public.user_roles (user_id, role) values ('<uuid do auth.users>', 'admin');
