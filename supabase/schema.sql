-- HUB AlexBrasil — esquema de banco (rode este script inteiro no SQL Editor do Supabase)

-- ============================================================
-- 1. Tabela de perfis (estende auth.users com dados de hierarquia)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  nome text not null,
  telefone text,
  email text,
  role text not null check (role in ('deputado', 'lider', 'apoiador')),
  parent_id uuid references profiles(id),
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Coluna adicionada depois — roda sem erro em bancos que já tinham a tabela.
-- Guarda o e-mail real da pessoa (separado do e-mail sintético usado só
-- para o login por telefone), usado no futuro fluxo de "esqueci a senha".
alter table profiles add column if not exists email text;

-- ============================================================
-- 2. Pedidos de voto (cadastro de eleitor/liderança)
-- ============================================================
create table if not exists pedidos_voto (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references profiles(id) on delete cascade,
  nome text not null,
  apelido text,
  nome_mae text,
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

-- Coluna adicionada depois — roda sem erro em bancos que já tinham a tabela:
alter table pedidos_voto add column if not exists nome_mae text;

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
-- 10. Gamificação — ranking com 4 categorias e estatísticas de medalhas
--
--     Pontos: 2 por pessoa convidada diretamente + 1 por voto "sim"
--     que você mesmo registrou + 0,5 por voto "sim" registrado por
--     QUALQUER pessoa abaixo de você na hierarquia (direta ou
--     indiretamente — o crédito sobe a cadeia toda, nunca desce).
--
--     Líderes: quantidade de pessoas que entraram com seu link direto.
--     Votos diretos: votos "sim" que você mesmo registrou.
--     Votos da equipe: soma de votos "sim" registrados por você e
--     por toda a sua rede abaixo (direta e indireta).
-- ============================================================
create or replace function get_ancestor_ids(node_id uuid)
returns table (id uuid)
language sql
security definer
set search_path = public
stable
as $$
  with recursive up as (
    select p.id, p.parent_id from profiles p where p.id = node_id
    union all
    select p.id, p.parent_id from profiles p
    inner join up on p.id = up.parent_id
  )
  select id from up;
$$;

grant execute on function get_ancestor_ids(uuid) to authenticated;

drop function if exists get_ranking();
drop function if exists get_ranking(text);

create or replace function get_ranking(metric text default 'pontos')
returns table (
  profile_id uuid,
  nome text,
  valor numeric,
  is_same_team boolean
)
language sql
security definer
set search_path = public
stable
as $$
  with own_votes as (
    select created_by as profile_id, count(*) as votos
    from pedidos_voto
    where voto = 'sim' and created_by is not null
    group by created_by
  ),
  direct_invites as (
    select parent_id as profile_id, count(*) as lideres
    from profiles
    where parent_id is not null
    group by parent_id
  ),
  team_stats as (
    select p.id as profile_id, count(d.id) as team_size, coalesce(sum(ov.votos), 0) as votos_equipe
    from profiles p
    cross join lateral (select id from get_descendant_ids(p.id)) d
    left join own_votes ov on ov.profile_id = d.id
    group by p.id
  ),
  -- votos "sim" atribuídos a quem de fato trouxe o eleitor: quando o pedido é o
  -- autocadastro de alguém que entrou por convite (telefone do pedido = telefone
  -- do próprio autor), o crédito vai para quem convidou (parent_id), não para
  -- a própria pessoa que se cadastrou
  effective_votes as (
    select
      case
        when regexp_replace(coalesce(pv.telefone, ''), '\D', '', 'g')
          = regexp_replace(coalesce(p.telefone, ''), '\D', '', 'g')
        then p.parent_id
        else pv.created_by
      end as profile_id
    from pedidos_voto pv
    join profiles p on p.id = pv.created_by
    where pv.voto = 'sim' and pv.created_by is not null
  ),
  own_votes_points as (
    select profile_id, count(*) as votos
    from effective_votes
    where profile_id is not null
    group by profile_id
  ),
  cascade_bonus as (
    select a.id as profile_id, count(*) * 0.5 as bonus
    from effective_votes ev
    cross join lateral (
      select id from get_ancestor_ids(ev.profile_id) where id != ev.profile_id
    ) a
    where ev.profile_id is not null
    group by a.id
  ),
  pontos as (
    select p.id as profile_id,
      (coalesce(ovp.votos, 0) * 1)
      + coalesce(cb.bonus, 0) as valor
    from profiles p
    left join own_votes_points ovp on ovp.profile_id = p.id
    left join cascade_bonus cb on cb.profile_id = p.id
  ),
  my_team as (
    select id from get_descendant_ids(auth.uid())
  )
  select
    p.id as profile_id,
    case when p.id in (select id from my_team) then p.nome else null end as nome,
    case metric
      when 'lideres' then coalesce(di.lideres, 0)::numeric
      when 'votos_diretos' then coalesce(ov.votos, 0)::numeric
      when 'votos_equipe' then coalesce(ts.votos_equipe, 0)::numeric
      else coalesce(pt.valor, 0)
    end as valor,
    (p.id in (select id from my_team)) as is_same_team
  from profiles p
  left join own_votes ov on ov.profile_id = p.id
  left join direct_invites di on di.profile_id = p.id
  left join team_stats ts on ts.profile_id = p.id
  left join pontos pt on pt.profile_id = p.id
  order by valor desc, p.created_at asc;
$$;

grant execute on function get_ranking(text) to authenticated;

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

grant execute on function get_my_stats() to authenticated;

-- ============================================================
-- 11. Gestão (painel administrativo do gabinete, /gestao) — role
--     "admin" com acesso total aos dados e CRUD de notícias.
-- ============================================================
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('deputado', 'lider', 'apoiador', 'admin'));

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false);
$$;

grant execute on function is_admin() to authenticated;

create policy "profiles_select_admin" on profiles
  for select using (is_admin());

create policy "profiles_insert_admin" on profiles
  for insert with check (is_admin());

create policy "profiles_update_admin" on profiles
  for update using (is_admin());

create policy "pedidos_select_admin" on pedidos_voto
  for select using (is_admin());

create policy "pedidos_insert_admin" on pedidos_voto
  for insert with check (is_admin());

create policy "pedidos_update_admin" on pedidos_voto
  for update using (is_admin());

create policy "checkins_select_admin" on checkins
  for select using (is_admin());

create policy "noticias_admin_all" on noticias
  for all using (is_admin()) with check (is_admin());

-- Promove uma conta existente para admin (rode manualmente, uma vez por pessoa):
-- update profiles set role = 'admin' where telefone = '(48) 99963-9593';

-- ============================================================
-- 12. Log de atividade — auditoria de criações/edições feitas no app
--     (visível só para admins na tela /gestao/atividade)
-- ============================================================
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table activity_log enable row level security;

create policy "activity_insert_own" on activity_log
  for insert with check (actor_id = auth.uid());

create policy "activity_select_admin" on activity_log
  for select using (is_admin());
