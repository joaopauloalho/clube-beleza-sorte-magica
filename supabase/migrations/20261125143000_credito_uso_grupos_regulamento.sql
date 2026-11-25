-- Clube Uniquas. Só no projeto ooyyenjndsaptlxidgko. Não aplicar em pvkrwjryvwsfwaxougyy (Hub).
-- 1) texto_consentimento passa a ser o texto de src/lib/copy.ts (fonte da verdade).
--    As migrations 20261111060000 e 20261111133000 não estavam no histórico do banco;
--    esta função substitui as duas. Consentimentos já gravados não são reescritos.
-- 2) Liberar o crédito da sorteada e registrar uso, com saldo que não fica negativo e estorno.
-- 3) Criar, renomear e apagar grupo vazio. Grupo com integrante não sai.
-- Não há UPDATE nem DELETE em public.leads.

create or replace function public.texto_consentimento(p_tipo text)
returns text
language sql
immutable
set search_path = public
as $$
  select case p_tipo
    when 'regulamento' then $texto$Aceito as regras publicadas do Clube Uniquas: grupo fechado de 24 pessoas no mesmo plano; cobrança somente por Pix Automático e somente quando o grupo completar 24 pessoas; todo mês 2 integrantes em dia são sorteadas; nos meses 4 e 8 há um sorteio extra, com 3 sorteadas, só entre quem está em dia; quem já foi sorteada não concorre de novo; quem para de pagar sai do sorteio; todas as integrantes em dia são sorteadas até o mês 11. [A DEFINIR: regras de atraso no pagamento] [A DEFINIR: regulamento]$texto$
    when 'whatsapp_opt_in' then $texto$Aceito receber mensagens de WhatsApp sobre a minha participação no Clube Uniquas. Este aceite é opcional e separado do regulamento. [A DEFINIR: política de mensagens no WhatsApp]$texto$
    else null
  end;
$$;

-- ---------------------------------------------------------------------------
-- Uso do crédito. A linha de creditos continua sendo o que o sorteio concedeu.
-- O saldo é o concedido menos os usos com status ativo.
-- ---------------------------------------------------------------------------
create table if not exists public.usos_credito (
  id uuid primary key default gen_random_uuid(),
  credito_id uuid not null references public.creditos (id),
  membro_id uuid not null references public.membros (id),
  procedimento_id text not null,
  procedimento_nome text not null,
  valor_centavos integer not null check (valor_centavos > 0),
  data_uso date not null,
  observacao text,
  usado_por text,
  status text not null default 'ativo' check (status in ('ativo', 'estornado')),
  registrado_por uuid not null,
  estornado_em timestamptz,
  estornado_por uuid,
  estornado_motivo text,
  created_at timestamptz not null default now(),
  check (observacao is null or char_length(observacao) <= 300),
  check (usado_por is null or (char_length(usado_por) between 2 and 80))
);

create index if not exists usos_credito_credito_idx on public.usos_credito (credito_id);
create index if not exists usos_credito_membro_idx on public.usos_credito (membro_id);

alter table public.usos_credito enable row level security;
revoke all on public.usos_credito from anon, authenticated;
grant select on public.usos_credito to authenticated;

drop policy if exists usos_credito_select_own_or_operator on public.usos_credito;
create policy usos_credito_select_own_or_operator on public.usos_credito
  for select to authenticated
  using (
    public.is_operator()
    or membro_id in (select id from public.membros where user_id = auth.uid())
  );

alter table public.creditos drop constraint if exists creditos_status_check;
alter table public.creditos add constraint creditos_status_check
  check (status in ('a_liberar', 'liberado'));

-- A lista precisa ser a mesma de src/lib/procedimentos.ts. O teste do repositório confere.
create or replace function public.liberar_credito(p_credito_id uuid, p_ator uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_credito public.creditos%rowtype;
  v_em_dia boolean;
begin
  if p_ator is null then raise exception 'ator_obrigatorio'; end if;

  select * into v_credito from public.creditos where id = p_credito_id for update;
  if not found then raise exception 'credito_inexistente'; end if;

  select em_dia into v_em_dia from public.membros where id = v_credito.membro_id for update;
  if v_em_dia is null then raise exception 'membro_inexistente'; end if;

  if v_credito.status = 'liberado' then raise exception 'ja_liberado'; end if;
  if v_credito.status <> 'a_liberar' then raise exception 'status_invalido'; end if;
  if v_credito.bloqueado or not v_em_dia then raise exception 'credito_bloqueado_por_atraso'; end if;

  update public.creditos set status = 'liberado' where id = p_credito_id;

  insert into public.auditoria (ator, acao, entidade, entidade_id, antes, depois)
  values (
    p_ator, 'credito_liberado', 'credito', p_credito_id,
    jsonb_build_object('status', 'a_liberar', 'bloqueado', v_credito.bloqueado),
    jsonb_build_object('status', 'liberado')
  );

  return jsonb_build_object('ok', true, 'credito_id', p_credito_id, 'status', 'liberado');
end;
$$;

create or replace function public.registrar_uso_credito(
  p_credito_id uuid,
  p_procedimento_id text,
  p_procedimento_nome text,
  p_valor_centavos int,
  p_data date,
  p_observacao text,
  p_usado_por text,
  p_ator uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_credito public.creditos%rowtype;
  v_em_dia boolean;
  v_slug text;
  v_obs text := nullif(trim(coalesce(p_observacao, '')), '');
  v_usado text := nullif(trim(coalesce(p_usado_por, '')), '');
  v_usado_soma int;
  v_saldo int;
  v_id uuid;
begin
  if p_ator is null then raise exception 'ator_obrigatorio'; end if;
  if p_valor_centavos is null or p_valor_centavos <= 0 or p_valor_centavos > 10000000 then
    raise exception 'valor_invalido';
  end if;
  if p_data is null then raise exception 'data_invalida'; end if;
  if p_data > (now() at time zone 'America/Sao_Paulo')::date then raise exception 'data_futura'; end if;
  if v_obs is not null and char_length(v_obs) > 300 then raise exception 'observacao_longa'; end if;
  if v_usado is not null and (char_length(v_usado) < 2 or char_length(v_usado) > 80) then
    raise exception 'usado_por_invalido';
  end if;
  if not exists (
    select 1 from (values
      ('toxina-1-area', 'Toxina 1 área'),
      ('preenchimento', 'Preenchimento'),
      ('toxina-botulinica', 'Botox feminino'),
      ('toxina-masculina', 'Botox masculino'),
      ('toxina-full-face', 'Toxina full face'),
      ('bioestimulador', 'Bioestimulador'),
      ('limpeza', 'Limpeza de pele'),
      ('peeling', 'Peeling'),
      ('mmp', 'Microagulhamento'),
      ('protocolo-noiva', 'Protocolo noiva'),
      ('mmp-pdrn', 'Microagulhamento com PDRN'),
      ('mmp-peeling', 'Microagulhamento + Peeling'),
      ('skinbooster', 'Skinbooster')
    ) as procedimento(id, nome)
    where procedimento.id = p_procedimento_id and procedimento.nome = p_procedimento_nome
  ) then
    raise exception 'procedimento_invalido';
  end if;

  select * into v_credito from public.creditos where id = p_credito_id for update;
  if not found then raise exception 'credito_inexistente'; end if;

  select m.em_dia, p.slug into v_em_dia, v_slug
  from public.membros m
  left join public.planos p on p.id = m.plano_id
  where m.id = v_credito.membro_id
  for update of m;

  if v_em_dia is null then raise exception 'membro_inexistente'; end if;
  if v_credito.status <> 'liberado' then raise exception 'credito_nao_liberado'; end if;
  if v_credito.bloqueado or not v_em_dia then raise exception 'credito_bloqueado_por_atraso'; end if;
  if v_slug is distinct from 'suprema' and v_usado is not null then raise exception 'uso_individual'; end if;

  select coalesce(sum(valor_centavos), 0) into v_usado_soma
  from public.usos_credito
  where credito_id = p_credito_id and status = 'ativo';

  v_saldo := v_credito.valor_centavos - v_usado_soma;
  if p_valor_centavos > v_saldo then raise exception 'saldo_insuficiente'; end if;

  insert into public.usos_credito (
    credito_id, membro_id, procedimento_id, procedimento_nome, valor_centavos,
    data_uso, observacao, usado_por, status, registrado_por
  ) values (
    p_credito_id, v_credito.membro_id, p_procedimento_id, p_procedimento_nome, p_valor_centavos,
    p_data, v_obs, v_usado, 'ativo', p_ator
  )
  returning id into v_id;

  insert into public.auditoria (ator, acao, entidade, entidade_id, depois)
  values (
    p_ator, 'credito_usado', 'uso_credito', v_id,
    jsonb_build_object(
      'credito_id', p_credito_id,
      'procedimento_id', p_procedimento_id,
      'procedimento_nome', p_procedimento_nome,
      'valor_centavos', p_valor_centavos,
      'data_uso', p_data,
      'usado_por', v_usado,
      'saldo_depois', v_saldo - p_valor_centavos
    )
  );

  return jsonb_build_object('ok', true, 'uso_id', v_id, 'saldo_centavos', v_saldo - p_valor_centavos);
end;
$$;

create or replace function public.estornar_uso_credito(p_uso_id uuid, p_motivo text, p_ator uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uso public.usos_credito%rowtype;
  v_motivo text := nullif(trim(coalesce(p_motivo, '')), '');
begin
  if p_ator is null then raise exception 'ator_obrigatorio'; end if;
  if v_motivo is null or char_length(v_motivo) < 5 then raise exception 'motivo_obrigatorio'; end if;
  if char_length(v_motivo) > 300 then raise exception 'observacao_longa'; end if;

  select * into v_uso from public.usos_credito where id = p_uso_id for update;
  if not found then raise exception 'uso_inexistente'; end if;
  if v_uso.status <> 'ativo' then raise exception 'uso_ja_estornado'; end if;

  update public.usos_credito
  set status = 'estornado', estornado_em = now(), estornado_por = p_ator, estornado_motivo = v_motivo
  where id = p_uso_id;

  insert into public.auditoria (ator, acao, entidade, entidade_id, antes, depois, motivo)
  values (
    p_ator, 'credito_uso_estornado', 'uso_credito', p_uso_id,
    jsonb_build_object('status', 'ativo', 'valor_centavos', v_uso.valor_centavos),
    jsonb_build_object('status', 'estornado'),
    v_motivo
  );

  return jsonb_build_object('ok', true, 'uso_id', p_uso_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Grupos. A adesão (reservar_cota) continua preenchendo o grupo aberto mais antigo.
-- Apagar só vale sem integrante, sem sorteio, sem cobrança e com vagas zeradas.
-- ---------------------------------------------------------------------------
create or replace function public.criar_grupo(p_nome text, p_plano_id uuid, p_ator uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome text := trim(coalesce(p_nome, ''));
  v_plano_nome text;
  v_id uuid;
begin
  if p_ator is null then raise exception 'ator_obrigatorio'; end if;
  if char_length(v_nome) < 2 or char_length(v_nome) > 80 then raise exception 'nome_invalido'; end if;

  select nome into v_plano_nome from public.planos where id = p_plano_id and coalesce(ativo, true);
  if v_plano_nome is null then raise exception 'plano_inexistente'; end if;

  insert into public.grupos (nome, plano_id, total_vagas, vagas_preenchidas, status)
  values (v_nome, p_plano_id, 24, 0, 'aberto')
  returning id into v_id;

  insert into public.auditoria (ator, acao, entidade, entidade_id, depois)
  values (
    p_ator, 'grupo_criado', 'grupo', v_id,
    jsonb_build_object('nome', v_nome, 'plano_id', p_plano_id, 'plano', v_plano_nome, 'total_vagas', 24)
  );

  return jsonb_build_object('ok', true, 'grupo_id', v_id, 'nome', v_nome);
end;
$$;

create or replace function public.renomear_grupo(p_grupo_id uuid, p_nome text, p_ator uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome text := trim(coalesce(p_nome, ''));
  v_antes text;
begin
  if p_ator is null then raise exception 'ator_obrigatorio'; end if;
  if char_length(v_nome) < 2 or char_length(v_nome) > 80 then raise exception 'nome_invalido'; end if;

  select nome into v_antes from public.grupos where id = p_grupo_id for update;
  if not found then raise exception 'grupo_inexistente'; end if;

  update public.grupos set nome = v_nome where id = p_grupo_id;

  insert into public.auditoria (ator, acao, entidade, entidade_id, antes, depois)
  values (p_ator, 'grupo_renomeado', 'grupo', p_grupo_id, jsonb_build_object('nome', v_antes), jsonb_build_object('nome', v_nome));

  return jsonb_build_object('ok', true, 'grupo_id', p_grupo_id, 'nome', v_nome);
end;
$$;

create or replace function public.excluir_grupo_vazio(p_grupo_id uuid, p_motivo text, p_ator uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grupo public.grupos%rowtype;
  v_motivo text := nullif(trim(coalesce(p_motivo, '')), '');
begin
  if p_ator is null then raise exception 'ator_obrigatorio'; end if;
  if v_motivo is null or char_length(v_motivo) < 5 then raise exception 'motivo_obrigatorio'; end if;
  if char_length(v_motivo) > 300 then raise exception 'observacao_longa'; end if;

  select * into v_grupo from public.grupos where id = p_grupo_id for update;
  if not found then raise exception 'grupo_inexistente'; end if;

  if coalesce(v_grupo.vagas_preenchidas, 0) > 0
    or exists (select 1 from public.membros where grupo_id = p_grupo_id)
    or exists (select 1 from public.sorteios where grupo_id = p_grupo_id)
    or exists (select 1 from public.assinaturas where grupo_id = p_grupo_id)
    or exists (select 1 from public.pagamentos where grupo_id = p_grupo_id)
  then
    raise exception 'grupo_com_integrantes';
  end if;

  insert into public.auditoria (ator, acao, entidade, entidade_id, antes, motivo)
  values (
    p_ator, 'grupo_excluido', 'grupo', p_grupo_id,
    jsonb_build_object('nome', v_grupo.nome, 'plano_id', v_grupo.plano_id, 'status', v_grupo.status),
    v_motivo
  );

  delete from public.grupos where id = p_grupo_id;

  return jsonb_build_object('ok', true, 'grupo_id', p_grupo_id);
end;
$$;

revoke all on function public.liberar_credito(uuid, uuid) from public, anon, authenticated;
revoke all on function public.registrar_uso_credito(uuid, text, text, int, date, text, text, uuid) from public, anon, authenticated;
revoke all on function public.estornar_uso_credito(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.criar_grupo(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.renomear_grupo(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.excluir_grupo_vazio(uuid, text, uuid) from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.liberar_credito(uuid, uuid) to service_role;
    grant execute on function public.registrar_uso_credito(uuid, text, text, int, date, text, text, uuid) to service_role;
    grant execute on function public.estornar_uso_credito(uuid, text, uuid) to service_role;
    grant execute on function public.criar_grupo(text, uuid, uuid) to service_role;
    grant execute on function public.renomear_grupo(uuid, text, uuid) to service_role;
    grant execute on function public.excluir_grupo_vazio(uuid, text, uuid) to service_role;
  end if;
end $$;
