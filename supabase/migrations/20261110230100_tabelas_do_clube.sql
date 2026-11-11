-- Clube Beleza. Rodar só no projeto ooyyenjndsaptlxidgko, depois da migration de papéis.
-- Não há UPDATE nem DELETE em public.leads. As 5 linhas existentes permanecem como estão.
-- Unicidade nova: índice parcial. As linhas antigas ficam com dedupe_whatsapp = false
-- (default da coluna no ADD) e portanto fora do índice, mesmo com o mesmo WhatsApp.

alter table public.leads add column if not exists user_id uuid references auth.users (id);
alter table public.leads add column if not exists whatsapp_normalizado text;
alter table public.leads add column if not exists dedupe_whatsapp boolean not null default false;
alter table public.leads alter column dedupe_whatsapp set default true;
alter table public.leads alter column email drop not null;

create unique index if not exists leads_whatsapp_novos_uidx
  on public.leads (whatsapp_normalizado)
  where dedupe_whatsapp and whatsapp_normalizado is not null;

create unique index if not exists leads_cpf_novos_uidx
  on public.leads (cpf)
  where dedupe_whatsapp and cpf is not null;

create unique index if not exists leads_user_id_uidx
  on public.leads (user_id)
  where user_id is not null;

alter table public.planos add column if not exists slug text;
alter table public.planos add column if not exists total_12_meses numeric;
alter table public.planos add column if not exists bonus_clinica_pct numeric;
alter table public.planos add column if not exists preco_membro_pct numeric;
alter table public.planos add column if not exists preco_legado numeric;
alter table public.planos add column if not exists credito_legado numeric;
alter table public.planos add column if not exists brinde_legado text;
alter table public.planos add column if not exists desconto_legado text;
alter table public.planos add column if not exists abacate_product_id text;

alter table public.grupos add column if not exists ultimo_mes_sorteado smallint not null default 0;
alter table public.grupos add column if not exists cobranca_iniciada_em timestamptz;

alter table public.membros add column if not exists user_id uuid references auth.users (id);
alter table public.membros add column if not exists cota smallint;
alter table public.membros add column if not exists em_dia boolean not null default false;

alter table public.membros drop constraint if exists membros_cota_check;
alter table public.membros add constraint membros_cota_check
  check (cota is null or (cota >= 1 and cota <= 24));

create unique index if not exists membros_grupo_cota_uidx
  on public.membros (grupo_id, cota)
  where grupo_id is not null and cota is not null;

create unique index if not exists membros_user_id_uidx
  on public.membros (user_id)
  where user_id is not null;

create table if not exists public.consentimentos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete restrict,
  membro_id uuid references public.membros (id) on delete restrict,
  tipo text not null check (tipo in ('regulamento', 'whatsapp_opt_in')),
  aceito boolean not null,
  texto_aceito text not null,
  aceito_em timestamptz not null default now(),
  origem text not null check (origem in ('lista_espera', 'adesao'))
);

create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references public.membros (id),
  plano_id uuid not null references public.planos (id),
  grupo_id uuid not null references public.grupos (id),
  external_id text not null,
  customer_id text,
  checkout_id text,
  checkout_url text,
  subscription_id text,
  status text not null default 'nao_criada',
  dev_mode boolean,
  metodo text not null default 'PIX',
  motivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists assinaturas_membro_uidx on public.assinaturas (membro_id);
create unique index if not exists assinaturas_external_uidx on public.assinaturas (external_id);
create unique index if not exists assinaturas_checkout_uidx on public.assinaturas (checkout_id) where checkout_id is not null;
create unique index if not exists assinaturas_subscription_uidx on public.assinaturas (subscription_id) where subscription_id is not null;

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references public.membros (id),
  assinatura_id uuid references public.assinaturas (id),
  grupo_id uuid references public.grupos (id),
  competencia date,
  parcela smallint,
  valor_centavos integer,
  status text not null,
  motivo text,
  abacate_payment_id text,
  evento_id text,
  dev_mode boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists pagamentos_evento_uidx
  on public.pagamentos (evento_id)
  where evento_id is not null;

create table if not exists public.sorteios (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id),
  mes smallint not null check (mes between 1 and 12),
  data_sorteio date not null,
  elegiveis jsonb not null,
  sorteados jsonb not null,
  created_at timestamptz not null default now(),
  unique (grupo_id, mes)
);

create table if not exists public.creditos (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references public.membros (id),
  sorteio_id uuid references public.sorteios (id),
  valor_centavos integer not null,
  chance_real numeric not null,
  mes smallint not null,
  status text not null default 'a_liberar',
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_eventos (
  id text primary key,
  evento text not null,
  dev_mode boolean not null,
  payload jsonb not null,
  resultado text,
  processado_em timestamptz not null default now()
);

alter table public.consentimentos enable row level security;
alter table public.assinaturas enable row level security;
alter table public.pagamentos enable row level security;
alter table public.sorteios enable row level security;
alter table public.creditos enable row level security;
alter table public.webhook_eventos enable row level security;
