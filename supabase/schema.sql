-- HUB AlexBrasil — esquema de banco (rode este script inteiro no SQL Editor do Supabase)

-- ============================================================
-- 1. Tabela de perfis (estende auth.users com dados de hierarquia)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  nome text not null,
  telefone text,
  role text not null check (role in ('deputado', 'lider', 'apoiador')),
  parent_id uuid references profiles(id),
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- ============================================================
-- 2. Pedidos de voto (cadastro de eleitor/liderança)
-- ============================================================
create table if not exists pedidos_voto (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references profiles(id) on delete cascade,
  nome text not null,
  apelido text,
  telefone text,
  cpf text,
  data_nascimento text,
  voto text check (voto in ('sim', 'nao')),
  tipo_contato text,
  status text,
  tags text[] default '{}',
  genero text,
  ocupacao text,
  observacoes text,
  endereco_ativo boolean default true,
  cep text,
  logradouro text,
  numero text,
  bairro text,
  municipio text,
  uf text,
  lat double precision,
  lng double precision,
  origem text,
  created_at timestamptz not null default now()
);

alter table pedidos_voto enable row level security;

-- ============================================================
-- 3. Check-ins de localização
-- ============================================================
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references profiles(id) on delete cascade,
  nome text not null,
  endereco text,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

alter table checkins enable row level security;

-- ============================================================
-- 4. Função recursiva: retorna o próprio usuário + todos os
--    descendentes na hierarquia (usada nas policies de leitura)
-- ============================================================
create or replace function get_descendant_ids(root_id uuid)
returns table (id uuid)
language sql
security definer
set search_path = public
stable
as $$
  with recursive tree as (
    select p.id from profiles p where p.id = root_id
    union all
    select p.id from profiles p
    inner join tree t on p.parent_id = t.id
  )
  select id from tree;
$$;

-- ============================================================
-- 5. Funções públicas para o fluxo de convite/bootstrap
--    (chamadas antes do usuário estar autenticado)
-- ============================================================
create or replace function profiles_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer from profiles;
$$;

create or replace function get_inviter_by_code(code text)
returns table (id uuid, nome text, role text)
language sql
security definer
set search_path = public
stable
as $$
  select id, nome, role from profiles where invite_code = code;
$$;

grant execute on function profiles_count() to anon, authenticated;
grant execute on function get_inviter_by_code(text) to anon, authenticated;
grant execute on function get_descendant_ids(uuid) to authenticated;

-- ============================================================
-- 5b. Evita cadastro duplicado: se a pessoa já tem um pedido de
--     voto registrado (mesmo telefone), reaproveita o nome e, ao
--     virar Líder, atualiza o tipo de contato em vez de duplicar.
-- ============================================================
create or replace function find_pedido_by_telefone(phone text)
returns table (nome text)
language sql
security definer
set search_path = public
stable
as $$
  select nome from pedidos_voto
  where regexp_replace(telefone, '\D', '', 'g') = regexp_replace(phone, '\D', '', 'g')
  order by created_at desc
  limit 1;
$$;

create or replace function mark_pedido_as_lider(phone text)
returns void
language sql
security definer
set search_path = public
as $$
  update pedidos_voto
  set tipo_contato = 'Liderança', voto = 'sim'
  where regexp_replace(telefone, '\D', '', 'g') = regexp_replace(phone, '\D', '', 'g');
$$;

grant execute on function find_pedido_by_telefone(text) to anon, authenticated;
grant execute on function mark_pedido_as_lider(text) to anon, authenticated;

-- ============================================================
-- 6. Row Level Security — profiles
-- ============================================================
create policy "profiles_select_team" on profiles
  for select using (id in (select id from get_descendant_ids(auth.uid())));

create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- ============================================================
-- 7. Row Level Security — pedidos_voto
-- ============================================================
create policy "pedidos_select_team" on pedidos_voto
  for select using (created_by in (select id from get_descendant_ids(auth.uid())));

create policy "pedidos_insert_own" on pedidos_voto
  for insert with check (created_by = auth.uid());

create policy "pedidos_update_team" on pedidos_voto
  for update using (created_by in (select id from get_descendant_ids(auth.uid())));

-- ============================================================
-- 8. Row Level Security — checkins
-- ============================================================
create policy "checkins_select_team" on checkins
  for select using (created_by in (select id from get_descendant_ids(auth.uid())));

create policy "checkins_insert_own" on checkins
  for insert with check (created_by = auth.uid());

-- ============================================================
-- 9. Notícias (carrossel do Dashboard) — gerenciadas direto pelo
--    Table Editor do Supabase, sem tela própria no app por enquanto.
-- ============================================================
create table if not exists noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  texto text,
  imagem_url text,
  link_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table noticias enable row level security;

create policy "noticias_select_all" on noticias
  for select using (ativo = true);

-- ============================================================
-- 10. Gamificação — ranking de pontos e estatísticas de medalhas
--     Pontuação: 1 ponto por voto "sim" registrado, +10 de bônus
--     pra quem mais registrou no dia, +30 de bônus pra quem mais
--     registrou na semana (bônus é cumulativo por dia/semana vencida).
-- ============================================================
create or replace function get_ranking()
returns table (
  profile_id uuid,
  nome text,
  pontos integer,
  is_same_team boolean
)
language sql
security definer
set search_path = public
stable
as $$
  with base_points as (
    select created_by as profile_id, count(*) as pontos
    from pedidos_voto
    where voto = 'sim' and created_by is not null
    group by created_by
  ),
  daily_counts as (
    select created_by as profile_id, date_trunc('day', created_at) as dia, count(*) as votos
    from pedidos_voto
    where voto = 'sim' and created_by is not null
    group by created_by, date_trunc('day', created_at)
  ),
  daily_max as (
    select dia, max(votos) as max_votos from daily_counts group by dia
  ),
  daily_bonus as (
    select dc.profile_id, count(*) * 10 as bonus
    from daily_counts dc
    join daily_max dm on dc.dia = dm.dia and dc.votos = dm.max_votos
    group by dc.profile_id
  ),
  weekly_counts as (
    select created_by as profile_id, date_trunc('week', created_at) as semana, count(*) as votos
    from pedidos_voto
    where voto = 'sim' and created_by is not null
    group by created_by, date_trunc('week', created_at)
  ),
  weekly_max as (
    select semana, max(votos) as max_votos from weekly_counts group by semana
  ),
  weekly_bonus as (
    select wc.profile_id, count(*) * 30 as bonus
    from weekly_counts wc
    join weekly_max wm on wc.semana = wm.semana and wc.votos = wm.max_votos
    group by wc.profile_id
  ),
  my_team as (
    select id from get_descendant_ids(auth.uid())
  )
  select
    p.id as profile_id,
    case when p.id in (select id from my_team) then p.nome else null end as nome,
    (coalesce(bp.pontos, 0) + coalesce(db.bonus, 0) + coalesce(wb.bonus, 0))::integer as pontos,
    (p.id in (select id from my_team)) as is_same_team
  from profiles p
  left join base_points bp on bp.profile_id = p.id
  left join daily_bonus db on db.profile_id = p.id
  left join weekly_bonus wb on wb.profile_id = p.id
  order by pontos desc, p.created_at asc;
$$;

create or replace function get_my_stats()
returns table (
  total_votos integer,
  dias_recorde integer,
  semanas_recorde integer
)
language sql
security definer
set search_path = public
stable
as $$
  with daily_counts as (
    select created_by, date_trunc('day', created_at) as dia, count(*) as votos
    from pedidos_voto
    where voto = 'sim' and created_by is not null
    group by created_by, date_trunc('day', created_at)
  ),
  daily_max as (
    select dia, max(votos) as max_votos from daily_counts group by dia
  ),
  weekly_counts as (
    select created_by, date_trunc('week', created_at) as semana, count(*) as votos
    from pedidos_voto
    where voto = 'sim' and created_by is not null
    group by created_by, date_trunc('week', created_at)
  ),
  weekly_max as (
    select semana, max(votos) as max_votos from weekly_counts group by semana
  )
  select
    (select count(*) from pedidos_voto where created_by = auth.uid() and voto = 'sim')::integer as total_votos,
    (select count(*) from daily_counts dc join daily_max dm on dc.dia = dm.dia and dc.votos = dm.max_votos
      where dc.created_by = auth.uid())::integer as dias_recorde,
    (select count(*) from weekly_counts wc join weekly_max wm on wc.semana = wm.semana and wc.votos = wm.max_votos
      where wc.created_by = auth.uid())::integer as semanas_recorde;
$$;

grant execute on function get_ranking() to authenticated;
grant execute on function get_my_stats() to authenticated;
