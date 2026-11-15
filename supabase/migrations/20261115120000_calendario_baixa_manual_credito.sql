-- Clube Uniquas. Só no projeto ooyyenjndsaptlxidgko. Não aplicar em pvkrwjryvwsfwaxougyy (Hub).
-- 1) Calendário de sorteio por grupo, editável antes de cada sorteio, com histórico.
-- 2) Conferência do dia 10 como passo obrigatório antes de sortear.
-- 3) Baixa manual de pagamento (dinheiro, Pix direto), com auditoria e estorno.
-- 4) Crédito de quem foi sorteada fica bloqueado enquanto a mensalidade estiver em atraso.
-- Não há UPDATE nem DELETE em public.leads.

-- Grupos deixam de ser fixos em 24. O tamanho vem de grupos.total_vagas.
alter table public.membros drop constraint if exists membros_cota_check;
alter table public.membros add constraint membros_cota_check
  check (cota is null or (cota >= 1 and cota <= 500));

-- ---------------------------------------------------------------------------
-- Auditoria: só cresce. Ninguém altera nem apaga por aqui.
-- ---------------------------------------------------------------------------
create table if not exists public.auditoria (
  id uuid primary key default gen_random_uuid(),
  ator uuid,
  acao text not null,
  entidade text not null,
  entidade_id uuid,
  antes jsonb,
  depois jsonb,
  motivo text,
  criado_em timestamptz not null default now()
);

alter table public.auditoria enable row level security;
revoke all on public.auditoria from anon, authenticated;
grant select on public.auditoria to authenticated;

drop policy if exists auditoria_select_operador on public.auditoria;
create policy auditoria_select_operador on public.auditoria
  for select to authenticated
  using (public.is_operator());

-- ---------------------------------------------------------------------------
-- Calendário de sorteio por grupo e mês.
-- ---------------------------------------------------------------------------
create table if not exists public.calendario_sorteio (
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  mes smallint not null check (mes between 1 and 12),
  quantidade smallint not null check (quantidade >= 0),
  data_prevista date,
  conferido_em timestamptz,
  conferido_por uuid,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid,
  primary key (grupo_id, mes),
  check (mes <> 12 or quantidade = 0)
);

alter table public.calendario_sorteio enable row level security;
revoke all on public.calendario_sorteio from anon, authenticated;
grant select on public.calendario_sorteio to authenticated;

drop policy if exists calendario_sorteio_select_operador on public.calendario_sorteio;
create policy calendario_sorteio_select_operador on public.calendario_sorteio
  for select to authenticated
  using (public.is_operator());

-- Quem ainda concorre: ativa ou inadimplente, não sorteada.
create or replace function public.pool_do_grupo(p_grupo_id uuid)
returns int
language sql
stable
set search_path = public
as $$
  select count(*)::int
  from public.membros m
  where m.grupo_id = p_grupo_id
    and m.data_contemplacao is null
    and m.status in ('ativo', 'inadimplente');
$$;

-- Salva o calendário inteiro. O TypeScript calcula; o banco só garante que a conta fecha.
create or replace function public.salvar_calendario_sorteio(
  p_grupo_id uuid,
  p_calendario int[],
  p_primeiro_sorteio date,
  p_motivo text,
  p_ator uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ultimo int;
  v_existente int[];
  v_pool int;
  v_futuro int;
  v_mes int;
  v_motivo text := nullif(trim(coalesce(p_motivo, '')), '');
begin
  perform 1 from public.grupos where id = p_grupo_id for update;
  if not found then raise exception 'grupo_inexistente'; end if;

  if p_calendario is null or array_length(p_calendario, 1) <> 12 then
    raise exception 'calendario_invalido';
  end if;
  if exists (select 1 from unnest(p_calendario) q where q is null or q < 0) then
    raise exception 'calendario_invalido';
  end if;
  if p_calendario[12] <> 0 then raise exception 'mes_12_sem_sorteio'; end if;

  select coalesce(max(mes), 0) into v_ultimo from public.sorteios where grupo_id = p_grupo_id;

  select array_agg(quantidade order by mes) into v_existente
  from public.calendario_sorteio where grupo_id = p_grupo_id;

  -- Meses já sorteados não mudam: valem os sorteios gravados.
  for v_mes in 1..v_ultimo loop
    if p_calendario[v_mes] <> (
      select jsonb_array_length(s.sorteados) from public.sorteios s where s.grupo_id = p_grupo_id and s.mes = v_mes
    ) then
      raise exception 'mes_ja_sorteado';
    end if;
  end loop;

  v_pool := public.pool_do_grupo(p_grupo_id);
  select coalesce(sum(q), 0) into v_futuro from unnest(p_calendario[v_ultimo + 1:12]) q;
  if v_futuro <> v_pool then
    raise exception 'conta_nao_fecha';
  end if;

  if v_existente is not null and v_motivo is null then
    raise exception 'motivo_obrigatorio';
  end if;
  if v_motivo is not null and char_length(v_motivo) < 5 then
    raise exception 'motivo_obrigatorio';
  end if;

  for v_mes in 1..12 loop
    insert into public.calendario_sorteio (grupo_id, mes, quantidade, data_prevista, atualizado_por)
    values (
      p_grupo_id, v_mes, p_calendario[v_mes],
      case when p_primeiro_sorteio is null then null
           else (p_primeiro_sorteio + ((v_mes - 1) * interval '1 month'))::date end,
      p_ator
    )
    on conflict (grupo_id, mes) do update
      set quantidade = excluded.quantidade,
          data_prevista = coalesce(excluded.data_prevista, public.calendario_sorteio.data_prevista),
          atualizado_em = now(),
          atualizado_por = excluded.atualizado_por,
          conferido_em = case when public.calendario_sorteio.quantidade = excluded.quantidade
                              then public.calendario_sorteio.conferido_em else null end,
          conferido_por = case when public.calendario_sorteio.quantidade = excluded.quantidade
                               then public.calendario_sorteio.conferido_por else null end;
  end loop;

  insert into public.auditoria (ator, acao, entidade, entidade_id, antes, depois, motivo)
  values (p_ator, 'calendario_salvo', 'grupo', p_grupo_id, to_jsonb(v_existente), to_jsonb(p_calendario), v_motivo);

  return jsonb_build_object('ok', true, 'calendario', to_jsonb(p_calendario), 'pool', v_pool);
end;
$$;

-- Conferência do dia do sorteio: a Giulia confirma quem está em dia. Sem isso o sorteio não roda.
create or replace function public.confirmar_conferencia(p_grupo_id uuid, p_ator uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mes int;
  v_elegiveis jsonb;
  v_fora jsonb;
begin
  perform 1 from public.grupos where id = p_grupo_id for update;
  if not found then raise exception 'grupo_inexistente'; end if;

  select coalesce(max(mes), 0) + 1 into v_mes from public.sorteios where grupo_id = p_grupo_id;
  if v_mes > 11 then raise exception 'ciclo_encerrado'; end if;
  if not exists (select 1 from public.calendario_sorteio where grupo_id = p_grupo_id and mes = v_mes) then
    raise exception 'calendario_nao_definido';
  end if;

  select coalesce(jsonb_agg(m.cota order by m.cota) filter (where m.em_dia and m.status = 'ativo'), '[]'::jsonb),
         coalesce(jsonb_agg(m.cota order by m.cota) filter (where not m.em_dia and m.status in ('ativo', 'inadimplente')), '[]'::jsonb)
    into v_elegiveis, v_fora
  from public.membros m
  where m.grupo_id = p_grupo_id and m.data_contemplacao is null;

  update public.calendario_sorteio
  set conferido_em = now(), conferido_por = p_ator
  where grupo_id = p_grupo_id and mes = v_mes;

  insert into public.auditoria (ator, acao, entidade, entidade_id, depois)
  values (p_ator, 'conferencia_confirmada', 'grupo', p_grupo_id,
          jsonb_build_object('mes', v_mes, 'cotas_elegiveis', v_elegiveis, 'cotas_fora_por_atraso', v_fora));

  return jsonb_build_object('ok', true, 'mes', v_mes, 'elegiveis', v_elegiveis, 'fora', v_fora);
end;
$$;

-- Sorteio: quantidade vem do calendário do grupo e exige a conferência feita.
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
  v_quantidade int;
  v_conferido timestamptz;
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

  if not found then raise exception 'grupo_inexistente'; end if;
  if v_cobranca is null then raise exception 'cobranca_nao_iniciada'; end if;

  select coalesce(max(mes), 0) + 1 into v_mes from public.sorteios where grupo_id = p_grupo_id;
  if v_mes > 12 then raise exception 'ciclo_encerrado'; end if;

  select quantidade, conferido_em into v_quantidade, v_conferido
  from public.calendario_sorteio
  where grupo_id = p_grupo_id and mes = v_mes;
  if not found then raise exception 'calendario_nao_definido'; end if;
  if v_quantidade = 0 then raise exception 'mes_sem_sorteio'; end if;
  if v_conferido is null then raise exception 'conferencia_pendente'; end if;

  select coalesce(jsonb_agg(jsonb_build_object('membro_id', m.id, 'cota', m.cota) order by m.cota), '[]'::jsonb),
         count(*)
    into v_elegiveis, v_total
  from public.membros m
  where m.grupo_id = p_grupo_id
    and m.em_dia
    and m.data_contemplacao is null
    and m.status = 'ativo';

  if v_total = 0 then raise exception 'sem_elegiveis'; end if;

  v_esperado := least(v_quantidade, v_total);
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
  values (p_grupo_id, v_mes, p_data, v_elegiveis, (select jsonb_agg(item) from unnest(p_sorteados) item))
  returning id into v_sorteio_id;

  foreach v_membro in array p_sorteados loop
    select round(p.credito_sorteio * 100)::int into v_valor
    from public.membros m
    join public.planos p on p.id = m.plano_id
    where m.id = v_membro;

    insert into public.creditos (membro_id, sorteio_id, valor_centavos, chance_real, mes, status)
    values (v_membro, v_sorteio_id, coalesce(v_valor, 0), v_chance, v_mes, 'a_liberar');

    update public.membros
    set status = 'sorteado', data_contemplacao = p_data::timestamptz
    where id = v_membro;
  end loop;

  update public.grupos set ultimo_mes_sorteado = v_mes where id = p_grupo_id;

  insert into public.auditoria (acao, entidade, entidade_id, depois)
  values ('sorteio_realizado', 'grupo', p_grupo_id,
          jsonb_build_object('mes', v_mes, 'quantidade', v_esperado, 'concorriam', v_total, 'chance_real', v_chance));

  return jsonb_build_object('ok', true, 'sorteio_id', v_sorteio_id, 'mes', v_mes,
                            'elegiveis', v_elegiveis, 'chance_real', v_chance);
end;
$$;

-- ---------------------------------------------------------------------------
-- Baixa manual de pagamento.
-- ---------------------------------------------------------------------------
alter table public.pagamentos add column if not exists origem text not null default 'gateway';
alter table public.pagamentos add column if not exists forma_manual text;
alter table public.pagamentos add column if not exists registrado_por uuid;
alter table public.pagamentos add column if not exists observacao text;
alter table public.pagamentos add column if not exists revertido_em timestamptz;
alter table public.pagamentos add column if not exists revertido_por uuid;
alter table public.pagamentos add column if not exists revertido_motivo text;

alter table public.pagamentos drop constraint if exists pagamentos_origem_check;
alter table public.pagamentos add constraint pagamentos_origem_check check (origem in ('gateway', 'manual'));
alter table public.pagamentos drop constraint if exists pagamentos_forma_manual_check;
alter table public.pagamentos add constraint pagamentos_forma_manual_check
  check (forma_manual is null or forma_manual in ('dinheiro', 'pix_direto', 'cartao_presencial', 'outro'));
alter table public.pagamentos drop constraint if exists pagamentos_manual_precisa_de_autor;
alter table public.pagamentos add constraint pagamentos_manual_precisa_de_autor
  check (origem = 'gateway' or (forma_manual is not null and registrado_por is not null));

create or replace function public.registrar_pagamento_manual(
  p_membro_id uuid,
  p_competencia date,
  p_valor_centavos int,
  p_forma text,
  p_observacao text,
  p_ator uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membro public.membros%rowtype;
  v_comp date := date_trunc('month', p_competencia)::date;
  v_obs text := nullif(trim(coalesce(p_observacao, '')), '');
  v_id uuid;
begin
  if p_ator is null then raise exception 'ator_obrigatorio'; end if;
  if p_forma not in ('dinheiro', 'pix_direto', 'cartao_presencial', 'outro') then raise exception 'forma_invalida'; end if;
  if p_forma = 'outro' and v_obs is null then raise exception 'observacao_obrigatoria'; end if;
  if v_obs is not null and char_length(v_obs) > 300 then raise exception 'observacao_longa'; end if;
  if p_valor_centavos is null or p_valor_centavos <= 0 or p_valor_centavos > 1000000 then raise exception 'valor_invalido'; end if;
  if p_competencia is null then raise exception 'competencia_invalida'; end if;

  select * into v_membro from public.membros where id = p_membro_id for update;
  if not found then raise exception 'membro_inexistente'; end if;
  if v_membro.status = 'cancelado' then raise exception 'membro_cancelado'; end if;

  if exists (
    select 1 from public.pagamentos p
    where p.membro_id = p_membro_id
      and p.status = 'pago'
      and date_trunc('month', coalesce(p.competencia, p.created_at::date))::date = v_comp
  ) then
    raise exception 'ja_pago_na_competencia';
  end if;

  insert into public.pagamentos (
    membro_id, assinatura_id, grupo_id, competencia, valor_centavos, status, dev_mode,
    origem, forma_manual, registrado_por, observacao
  )
  values (
    p_membro_id,
    (select a.id from public.assinaturas a where a.membro_id = p_membro_id limit 1),
    v_membro.grupo_id, v_comp, p_valor_centavos, 'pago', false,
    'manual', p_forma, p_ator, v_obs
  )
  returning id into v_id;

  update public.membros
  set em_dia = true,
      status = case when status = 'inadimplente' then 'ativo' else status end
  where id = p_membro_id;

  insert into public.auditoria (ator, acao, entidade, entidade_id, antes, depois, motivo)
  values (p_ator, 'pagamento_manual', 'pagamento', v_id,
          jsonb_build_object('em_dia', v_membro.em_dia, 'status', v_membro.status),
          jsonb_build_object('competencia', v_comp, 'valor_centavos', p_valor_centavos, 'forma', p_forma),
          v_obs);

  return jsonb_build_object('ok', true, 'pagamento_id', v_id);
end;
$$;

create or replace function public.reverter_pagamento_manual(
  p_pagamento_id uuid,
  p_motivo text,
  p_ator uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pag public.pagamentos%rowtype;
  v_motivo text := nullif(trim(coalesce(p_motivo, '')), '');
  v_em_dia boolean;
begin
  if p_ator is null then raise exception 'ator_obrigatorio'; end if;
  if v_motivo is null or char_length(v_motivo) < 5 then raise exception 'motivo_obrigatorio'; end if;

  select * into v_pag from public.pagamentos where id = p_pagamento_id for update;
  if not found then raise exception 'pagamento_inexistente'; end if;
  if v_pag.origem <> 'manual' then raise exception 'so_pagamento_manual'; end if;
  if v_pag.status <> 'pago' then raise exception 'pagamento_nao_esta_pago'; end if;

  update public.pagamentos
  set status = 'estornado', revertido_em = now(), revertido_por = p_ator, revertido_motivo = v_motivo
  where id = p_pagamento_id;

  v_em_dia := exists (
    select 1 from public.pagamentos p
    where p.membro_id = v_pag.membro_id
      and p.status = 'pago'
      and date_trunc('month', coalesce(p.competencia, p.created_at::date)) = date_trunc('month', coalesce(v_pag.competencia, v_pag.created_at::date))
  );

  update public.membros
  set em_dia = v_em_dia,
      status = case when not v_em_dia and status = 'ativo' then 'inadimplente' else status end
  where id = v_pag.membro_id;

  insert into public.auditoria (ator, acao, entidade, entidade_id, antes, depois, motivo)
  values (p_ator, 'pagamento_manual_estornado', 'pagamento', p_pagamento_id,
          jsonb_build_object('status', 'pago'), jsonb_build_object('status', 'estornado', 'em_dia', v_em_dia), v_motivo);

  return jsonb_build_object('ok', true, 'em_dia', v_em_dia);
end;
$$;

-- ---------------------------------------------------------------------------
-- Crédito bloqueado enquanto a mensalidade estiver em atraso.
-- ---------------------------------------------------------------------------
alter table public.creditos add column if not exists bloqueado boolean not null default false;
alter table public.creditos add column if not exists bloqueado_desde timestamptz;

create or replace function public.sincronizar_bloqueio_credito()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.creditos
  set bloqueado = not new.em_dia,
      bloqueado_desde = case when new.em_dia then null else now() end
  where membro_id = new.id
    and status in ('a_liberar', 'liberado');
  return new;
end;
$$;

drop trigger if exists membros_bloqueio_credito on public.membros;
create trigger membros_bloqueio_credito
  after update of em_dia on public.membros
  for each row
  when (old.em_dia is distinct from new.em_dia)
  execute function public.sincronizar_bloqueio_credito();

-- ---------------------------------------------------------------------------
-- Calendário visto pela própria cliente: só números e cotas, nunca nomes nem situação de outras.
-- ---------------------------------------------------------------------------
create or replace function public.meu_calendario()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_grupo uuid;
  v_ultimo int;
  v_sorteadas_total int;
  v_pool int;
  v_tamanho int;
  v_meses jsonb;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'erro', 'nao_autenticado'); end if;
  select grupo_id into v_grupo from public.membros where user_id = v_uid;
  if v_grupo is null then return jsonb_build_object('ok', false, 'erro', 'sem_cota'); end if;

  select coalesce(max(mes), 0) into v_ultimo from public.sorteios where grupo_id = v_grupo;
  select coalesce(sum(jsonb_array_length(sorteados)), 0)::int into v_sorteadas_total from public.sorteios where grupo_id = v_grupo;
  v_pool := public.pool_do_grupo(v_grupo);
  v_tamanho := v_sorteadas_total + v_pool;

  select coalesce(jsonb_agg(linha order by (linha ->> 'mes')::int), '[]'::jsonb) into v_meses
  from (
    select jsonb_build_object(
      'mes', c.mes,
      'data', coalesce(s.data_sorteio, c.data_prevista),
      'estado', case
                  when s.id is not null then 'feito'
                  when c.quantidade = 0 then 'sem_sorteio'
                  when c.mes = v_ultimo + 1 then 'proximo'
                  else 'previsto' end,
      'sorteadas', case when s.id is not null then jsonb_array_length(s.sorteados) else c.quantidade end,
      'concorrem', case
                     when s.id is not null then jsonb_array_length(s.elegiveis)
                     when c.mes = v_ultimo + 1 then (
                       select count(*) from public.membros m
                       where m.grupo_id = v_grupo and m.em_dia and m.data_contemplacao is null and m.status = 'ativo')
                     else greatest(v_tamanho - coalesce((select sum(c2.quantidade) from public.calendario_sorteio c2
                                                          where c2.grupo_id = v_grupo and c2.mes < c.mes), 0), 0)
                   end,
      'cotas_sorteadas', case when s.id is not null then (
          select coalesce(jsonb_agg(m.cota order by m.cota), '[]'::jsonb)
          from public.membros m
          where m.id::text in (select jsonb_array_elements_text(s.sorteados)))
        else null end
    ) as linha
    from public.calendario_sorteio c
    left join public.sorteios s on s.grupo_id = c.grupo_id and s.mes = c.mes
    where c.grupo_id = v_grupo
  ) t;

  return jsonb_build_object('ok', true, 'tamanho', v_tamanho, 'meses', v_meses);
end;
$$;

revoke all on function public.pool_do_grupo(uuid) from public, anon, authenticated;
revoke all on function public.salvar_calendario_sorteio(uuid, int[], date, text, uuid) from public, anon, authenticated;
revoke all on function public.confirmar_conferencia(uuid, uuid) from public, anon, authenticated;
revoke all on function public.registrar_pagamento_manual(uuid, date, int, text, text, uuid) from public, anon, authenticated;
revoke all on function public.reverter_pagamento_manual(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.aplicar_sorteio(uuid, date, uuid[]) from public, anon, authenticated;
revoke all on function public.meu_calendario() from public, anon;
grant execute on function public.meu_calendario() to authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.pool_do_grupo(uuid) to service_role;
    grant execute on function public.salvar_calendario_sorteio(uuid, int[], date, text, uuid) to service_role;
    grant execute on function public.confirmar_conferencia(uuid, uuid) to service_role;
    grant execute on function public.registrar_pagamento_manual(uuid, date, int, text, text, uuid) to service_role;
    grant execute on function public.reverter_pagamento_manual(uuid, text, uuid) to service_role;
    grant execute on function public.aplicar_sorteio(uuid, date, uuid[]) to service_role;
  end if;
end $$;
