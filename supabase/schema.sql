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
--     Pontuação: 2 pontos por pessoa convidada diretamente (seu
--     próprio link/convite) + 1 ponto por voto "sim" registrado.
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
  with vote_points as (
    select created_by as profile_id, count(*) as pontos
    from pedidos_voto
    where voto = 'sim' and created_by is not null
    group by created_by
  ),
  invite_points as (
    select parent_id as profile_id, count(*) * 2 as pontos
    from profiles
    where parent_id is not null
    group by parent_id
  ),
  my_team as (
    select id from get_descendant_ids(auth.uid())
  )
  select
    p.id as profile_id,
    case when p.id in (select id from my_team) then p.nome else null end as nome,
    (coalesce(vp.pontos, 0) + coalesce(ip.pontos, 0))::integer as pontos,
    (p.id in (select id from my_team)) as is_same_team
  from profiles p
  left join vote_points vp on vp.profile_id = p.id
  left join invite_points ip on ip.profile_id = p.id
  order by pontos desc, p.created_at asc;
$$;

drop function if exists get_my_stats();

create or replace function get_my_stats()
returns table (
  total_votos integer,
  total_convidados integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*) from pedidos_voto where created_by = auth.uid() and voto = 'sim')::integer as total_votos,
    (select count(*) from profiles where parent_id = auth.uid())::integer as total_convidados;
$$;

grant execute on function get_ranking() to authenticated;
grant execute on function get_my_stats() to authenticated;
