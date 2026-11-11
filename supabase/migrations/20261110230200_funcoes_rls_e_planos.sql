-- Clube Beleza. Terceira migration. Só no projeto ooyyenjndsaptlxidgko.
-- Atualiza os números comerciais das 3 linhas de planos, guardando o valor anterior
-- em colunas *_legado na primeira execução. Não apaga planos.
-- Não há UPDATE nem DELETE em public.leads.

create or replace function public.cpf_valido(p_cpf text)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  digitos text := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
  indice int;
  soma int;
  resto int;
  dv1 int;
  dv2 int;
begin
  if digitos !~ '^[0-9]{11}$' then return false; end if;
  if digitos ~ '^([0-9])\1{10}$' then return false; end if;
  soma := 0;
  for indice in 1..9 loop
    soma := soma + substr(digitos, indice, 1)::int * (11 - indice);
  end loop;
  resto := (soma * 10) % 11;
  dv1 := case when resto = 10 then 0 else resto end;
  soma := 0;
  for indice in 1..10 loop
    soma := soma + substr(digitos, indice, 1)::int * (12 - indice);
  end loop;
  resto := (soma * 10) % 11;
  dv2 := case when resto = 10 then 0 else resto end;
  return dv1 = substr(digitos, 10, 1)::int and dv2 = substr(digitos, 11, 1)::int;
end;
$$;

create or replace function public.texto_consentimento(p_tipo text)
returns text
language sql
immutable
set search_path = public
as $$
  select case p_tipo
    when 'regulamento' then 'Aceito as regras publicadas do Clube Beleza: grupo fechado de 24 pessoas no mesmo plano; cobrança somente por Pix Automático e somente quando o grupo completar 24 pessoas; todo mês 2 integrantes em dia são sorteadas; quem já foi sorteada não concorre de novo; quem para de pagar sai do sorteio; em até 12 meses toda integrante em dia recebe o crédito em serviços da clínica. [A DEFINIR: regulamento]'
    when 'whatsapp_opt_in' then 'Aceito receber mensagens de WhatsApp sobre a minha participação no Clube Beleza. Este aceite é opcional e separado do regulamento. [A DEFINIR: política de mensagens no WhatsApp]'
    else null
  end;
$$;

create or replace function public.whatsapp_normalizado(p_whatsapp text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  digitos text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
begin
  if digitos like '55%' and length(digitos) >= 12 then
    digitos := substring(digitos from 3);
  end if;
  return digitos;
end;
$$;

create or replace function public.registrar_lista_espera(
  p_nome text,
  p_whatsapp text,
  p_aceitou_regulamento boolean,
  p_opt_in_whatsapp boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome text := trim(coalesce(p_nome, ''));
  v_norm text := public.whatsapp_normalizado(p_whatsapp);
  v_id uuid;
begin
  if not coalesce(p_aceitou_regulamento, false) then
    return jsonb_build_object('ok', false, 'erro', 'regulamento');
  end if;
  if char_length(v_nome) < 3 or char_length(v_nome) > 120 then
    return jsonb_build_object('ok', false, 'erro', 'nome');
  end if;
  if v_norm !~ '^[1-9]{2}9[0-9]{8}$' then
    return jsonb_build_object('ok', false, 'erro', 'whatsapp');
  end if;

  if exists (
    select 1
    from public.leads
    where whatsapp_normalizado = v_norm
       or public.whatsapp_normalizado(whatsapp) = v_norm
  ) then
    return jsonb_build_object('ok', true, 'status', 'ja_cadastrado');
  end if;

  insert into public.leads (
    nome, email, whatsapp, whatsapp_normalizado, status, dedupe_whatsapp, plano_interesse, cpf, user_id
  ) values (
    v_nome, null, trim(p_whatsapp), v_norm, 'lista_espera', true, null, null, null
  ) returning id into v_id;

  insert into public.consentimentos (lead_id, tipo, aceito, texto_aceito, origem)
  values (v_id, 'regulamento', true, public.texto_consentimento('regulamento'), 'lista_espera');

  if coalesce(p_opt_in_whatsapp, false) then
    insert into public.consentimentos (lead_id, tipo, aceito, texto_aceito, origem)
    values (v_id, 'whatsapp_opt_in', true, public.texto_consentimento('whatsapp_opt_in'), 'lista_espera');
  end if;

  return jsonb_build_object('ok', true, 'status', 'criado');
exception
  when unique_violation then
    return jsonb_build_object('ok', true, 'status', 'ja_cadastrado');
end;
$$;

create or replace function public.reservar_cota(
  p_plano_slug text,
  p_nome text,
  p_cpf text,
  p_whatsapp text,
  p_aceitou_regulamento boolean,
  p_opt_in_whatsapp boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_nome text := trim(coalesce(p_nome, ''));
  v_cpf text := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
  v_norm text := public.whatsapp_normalizado(p_whatsapp);
  v_plano_id uuid;
  v_plano_nome text;
  v_grupo_id uuid;
  v_grupo_nome text;
  v_vagas int;
  v_total int;
  v_cota int;
  v_lead_id uuid;
  v_membro_id uuid;
  v_completo boolean;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'erro', 'nao_autenticado');
  end if;
  if not coalesce(p_aceitou_regulamento, false) then
    return jsonb_build_object('ok', false, 'erro', 'regulamento');
  end if;
  if char_length(v_nome) < 3 then
    return jsonb_build_object('ok', false, 'erro', 'nome');
  end if;
  if not public.cpf_valido(v_cpf) then
    return jsonb_build_object('ok', false, 'erro', 'cpf');
  end if;
  if v_norm !~ '^[1-9]{2}9[0-9]{8}$' then
    return jsonb_build_object('ok', false, 'erro', 'whatsapp');
  end if;

  select m.id, m.cota, m.grupo_id, g.nome, coalesce(g.vagas_preenchidas, 0), coalesce(g.total_vagas, 24)
    into v_membro_id, v_cota, v_grupo_id, v_grupo_nome, v_vagas, v_total
  from public.membros m
  join public.grupos g on g.id = m.grupo_id
  where m.user_id = v_uid;

  if v_membro_id is not null then
    return jsonb_build_object(
      'ok', true,
      'status', 'ja_reservado',
      'membro_id', v_membro_id,
      'cota', v_cota,
      'grupo_id', v_grupo_id,
      'grupo_nome', v_grupo_nome,
      'vagas', v_vagas,
      'total', v_total,
      'completo', v_vagas >= v_total
    );
  end if;

  select email into v_email from auth.users where id = v_uid;
  if v_email is null then
    return jsonb_build_object('ok', false, 'erro', 'sem_email');
  end if;

  if exists (select 1 from public.leads where email is not null and lower(email) = lower(v_email)) then
    return jsonb_build_object('ok', false, 'erro', 'email_existente');
  end if;
  if exists (
    select 1 from public.leads
    where whatsapp_normalizado = v_norm or public.whatsapp_normalizado(whatsapp) = v_norm
  ) then
    return jsonb_build_object('ok', false, 'erro', 'whatsapp_existente');
  end if;
  if exists (
    select 1 from public.leads
    where cpf is not null and regexp_replace(cpf, '\D', '', 'g') = v_cpf
  ) then
    return jsonb_build_object('ok', false, 'erro', 'cpf_existente');
  end if;

  select id, nome into v_plano_id, v_plano_nome
  from public.planos
  where slug = p_plano_slug and coalesce(ativo, true);

  if v_plano_id is null then
    return jsonb_build_object('ok', false, 'erro', 'plano_inexistente');
  end if;

  perform pg_advisory_xact_lock(hashtext(v_plano_id::text));

  select g.id, coalesce(g.vagas_preenchidas, 0), coalesce(g.total_vagas, 24), g.nome
    into v_grupo_id, v_vagas, v_total, v_grupo_nome
  from public.grupos g
  where g.plano_id = v_plano_id
    and g.status = 'aberto'
    and coalesce(g.vagas_preenchidas, 0) < coalesce(g.total_vagas, 24)
  order by g.created_at
  limit 1
  for update;

  if v_grupo_id is null then
    insert into public.grupos (nome, plano_id, total_vagas, vagas_preenchidas, status)
    values ('Grupo ' || v_plano_nome, v_plano_id, 24, 0, 'aberto')
    returning id, nome into v_grupo_id, v_grupo_nome;
    v_vagas := 0;
    v_total := 24;
  end if;

  v_cota := v_vagas + 1;
  v_completo := v_cota >= v_total;

  insert into public.leads (
    nome, email, whatsapp, whatsapp_normalizado, cpf, plano_interesse, status, dedupe_whatsapp, user_id
  ) values (
    v_nome, v_email, trim(p_whatsapp), v_norm, v_cpf, v_plano_nome, 'adesao', true, v_uid
  ) returning id into v_lead_id;

  insert into public.membros (
    lead_id, plano_id, grupo_id, user_id, cota, numero_sorteio, status, em_dia
  ) values (
    v_lead_id, v_plano_id, v_grupo_id, v_uid, v_cota, v_cota, 'aguardando_grupo', false
  ) returning id into v_membro_id;

  insert into public.consentimentos (lead_id, membro_id, tipo, aceito, texto_aceito, origem)
  values (v_lead_id, v_membro_id, 'regulamento', true, public.texto_consentimento('regulamento'), 'adesao');

  if coalesce(p_opt_in_whatsapp, false) then
    insert into public.consentimentos (lead_id, membro_id, tipo, aceito, texto_aceito, origem)
    values (v_lead_id, v_membro_id, 'whatsapp_opt_in', true, public.texto_consentimento('whatsapp_opt_in'), 'adesao');
  end if;

  update public.grupos
  set vagas_preenchidas = v_cota,
      status = case when v_completo then 'completo' else status end
  where id = v_grupo_id;

  return jsonb_build_object(
    'ok', true,
    'status', 'reservado',
    'membro_id', v_membro_id,
    'cota', v_cota,
    'grupo_id', v_grupo_id,
    'grupo_nome', v_grupo_nome,
    'vagas', v_cota,
    'total', v_total,
    'completo', v_completo
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'erro', 'conflito');
end;
$$;

create or replace function public.aplicar_sorteio(
  p_grupo_id uuid,
  p_data date,
  p_sorteados uuid[]
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cobranca timestamptz;
  v_mes int;
  v_total int;
  v_esperado int;
  v_elegiveis jsonb;
  v_sorteio_id uuid;
  v_chance numeric;
  v_membro uuid;
  v_valor int;
begin
  select cobranca_iniciada_em into v_cobranca
  from public.grupos
  where id = p_grupo_id
  for update;

  if not found then
    raise exception 'grupo_inexistente';
  end if;
  if v_cobranca is null then
    raise exception 'cobranca_nao_iniciada';
  end if;

  select coalesce(max(mes), 0) + 1 into v_mes
  from public.sorteios
  where grupo_id = p_grupo_id;

  if v_mes > 12 then
    raise exception 'ciclo_encerrado';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('membro_id', m.id, 'cota', m.cota) order by m.cota), '[]'::jsonb),
         count(*)
    into v_elegiveis, v_total
  from public.membros m
  where m.grupo_id = p_grupo_id
    and m.em_dia
    and m.data_contemplacao is null
    and m.status = 'ativo';

  if v_total = 0 then
    raise exception 'sem_elegiveis';
  end if;

  v_esperado := least(2, v_total);
  if coalesce(array_length(p_sorteados, 1), 0) <> v_esperado then
    raise exception 'quantidade_incorreta';
  end if;
  if (select count(distinct item) from unnest(p_sorteados) item) <> v_esperado then
    raise exception 'sorteados_repetidos';
  end if;
  if exists (
    select 1
    from unnest(p_sorteados) item
    where not exists (
      select 1
      from public.membros m
      where m.id = item
        and m.grupo_id = p_grupo_id
        and m.em_dia
        and m.data_contemplacao is null
        and m.status = 'ativo'
    )
  ) then
    raise exception 'elegibilidade_mudou';
  end if;

  v_chance := v_esperado::numeric / v_total;

  insert into public.sorteios (grupo_id, mes, data_sorteio, elegiveis, sorteados)
  values (
    p_grupo_id,
    v_mes,
    p_data,
    v_elegiveis,
    (select jsonb_agg(item) from unnest(p_sorteados) item)
  )
  returning id into v_sorteio_id;

  foreach v_membro in array p_sorteados loop
    select round(p.credito_sorteio * 100)::int into v_valor
    from public.membros m
    join public.planos p on p.id = m.plano_id
    where m.id = v_membro;

    insert into public.creditos (membro_id, sorteio_id, valor_centavos, chance_real, mes, status)
    values (v_membro, v_sorteio_id, coalesce(v_valor, 0), v_chance, v_mes, 'a_liberar');

    update public.membros
    set status = 'sorteado',
        data_contemplacao = p_data::timestamptz
    where id = v_membro;
  end loop;

  update public.grupos
  set ultimo_mes_sorteado = v_mes
  where id = p_grupo_id;

  return jsonb_build_object(
    'ok', true,
    'sorteio_id', v_sorteio_id,
    'mes', v_mes,
    'elegiveis', v_elegiveis,
    'chance_real', v_chance
  );
end;
$$;

revoke all on function public.cpf_valido(text) from public, anon, authenticated;
revoke all on function public.registrar_lista_espera(text, text, boolean, boolean) from public;
grant execute on function public.registrar_lista_espera(text, text, boolean, boolean) to anon, authenticated;
revoke all on function public.reservar_cota(text, text, text, text, boolean, boolean) from public, anon;
grant execute on function public.reservar_cota(text, text, text, text, boolean, boolean) to authenticated;
revoke all on function public.aplicar_sorteio(uuid, date, uuid[]) from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.aplicar_sorteio(uuid, date, uuid[]) to service_role;
  end if;
end $$;

drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles
for select to authenticated
using (user_id = auth.uid() or public.is_operator());

drop policy if exists leads_insert_lista on public.leads;
create policy leads_insert_lista on public.leads
for insert to anon, authenticated
with check (
  status = 'lista_espera'
  and dedupe_whatsapp is true
  and email is null
  and user_id is null
  and cpf is null
  and char_length(nome) >= 3
  and whatsapp_normalizado ~ '^[1-9]{2}9[0-9]{8}$'
);

drop policy if exists leads_select_own_or_operator on public.leads;
create policy leads_select_own_or_operator on public.leads
for select to authenticated
using (
  public.is_operator()
  or user_id = auth.uid()
  or (email is not null and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
);

drop policy if exists planos_select_public on public.planos;
create policy planos_select_public on public.planos
for select to anon, authenticated
using (coalesce(ativo, true));

drop policy if exists grupos_select_membro_ou_operador on public.grupos;
create policy grupos_select_membro_ou_operador on public.grupos
for select to authenticated
using (
  public.is_operator()
  or exists (
    select 1 from public.membros m
    where m.grupo_id = grupos.id and m.user_id = auth.uid()
  )
);

drop policy if exists membros_select_own_or_operator on public.membros;
create policy membros_select_own_or_operator on public.membros
for select to authenticated
using (user_id = auth.uid() or public.is_operator());

drop policy if exists consentimentos_select_own_or_operator on public.consentimentos;
create policy consentimentos_select_own_or_operator on public.consentimentos
for select to authenticated
using (
  public.is_operator()
  or lead_id in (select id from public.leads where user_id = auth.uid())
  or membro_id in (select id from public.membros where user_id = auth.uid())
);

drop policy if exists assinaturas_select_own_or_operator on public.assinaturas;
create policy assinaturas_select_own_or_operator on public.assinaturas
for select to authenticated
using (
  public.is_operator()
  or membro_id in (select id from public.membros where user_id = auth.uid())
);

drop policy if exists pagamentos_select_own_or_operator on public.pagamentos;
create policy pagamentos_select_own_or_operator on public.pagamentos
for select to authenticated
using (
  public.is_operator()
  or membro_id in (select id from public.membros where user_id = auth.uid())
);

drop policy if exists creditos_select_own_or_operator on public.creditos;
create policy creditos_select_own_or_operator on public.creditos
for select to authenticated
using (
  public.is_operator()
  or membro_id in (select id from public.membros where user_id = auth.uid())
);

drop policy if exists sorteios_select_operator on public.sorteios;
create policy sorteios_select_operator on public.sorteios
for select to authenticated
using (public.is_operator());

-- Preserva as 3 linhas: o número antigo vai para *_legado só na primeira vez.
update public.planos
set preco_legado = preco,
    credito_legado = credito_sorteio,
    brinde_legado = brinde,
    desconto_legado = desconto_servicos
where preco_legado is null
  and nome in ('Beleza Essencial', 'Beleza Radiante', 'Beleza Suprema');

insert into public.planos (
  nome, preco, brinde, valor_brinde, credito_sorteio, desconto_servicos, destaque, ativo,
  slug, total_12_meses, bonus_clinica_pct, preco_membro_pct
)
select v.nome, v.preco, v.brinde, v.valor_brinde, v.credito, v.desconto, v.destaque, true,
       v.slug, v.total_12, v.bonus, v.membro
from (
  values
    ('Beleza Essencial'::text, 50::numeric, '[A DEFINIR: serviços elegíveis]'::text, 0::numeric, 700::numeric, '10%'::text, false, 'essencial'::text, 600::numeric, 17::numeric, 10::numeric),
    ('Beleza Radiante', 75, '[A DEFINIR: serviços elegíveis]', 0, 1125, '15%', false, 'radiante', 900, 25, 15),
    ('Beleza Suprema', 100, '[A DEFINIR: serviços elegíveis]', 0, 1600, '20%', true, 'suprema', 1200, 33, 20)
) as v(nome, preco, brinde, valor_brinde, credito, desconto, destaque, slug, total_12, bonus, membro)
where not exists (select 1 from public.planos p where p.nome = v.nome);

update public.planos
set slug = 'essencial', preco = 50, credito_sorteio = 700, desconto_servicos = '10%',
    total_12_meses = 600, bonus_clinica_pct = 17, preco_membro_pct = 10,
    destaque = false, ativo = true
where nome = 'Beleza Essencial';

update public.planos
set slug = 'radiante', preco = 75, credito_sorteio = 1125, desconto_servicos = '15%',
    total_12_meses = 900, bonus_clinica_pct = 25, preco_membro_pct = 15,
    destaque = false, ativo = true
where nome = 'Beleza Radiante';

update public.planos
set slug = 'suprema', preco = 100, credito_sorteio = 1600, desconto_servicos = '20%',
    total_12_meses = 1200, bonus_clinica_pct = 33, preco_membro_pct = 20,
    destaque = true, ativo = true
where nome = 'Beleza Suprema';

create unique index if not exists planos_slug_uidx
  on public.planos (slug)
  where slug is not null;
