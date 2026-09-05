-- EduArabic for All — Schema v1 (PRD v3.0)
-- Applied via Supabase MCP migration "init_schema". Keep this file as the
-- source of truth / for `supabase db reset` in local dev.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Core tables
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create table admin_allowlist (
  email text primary key,
  added_at timestamptz not null default now()
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  cover_url text,
  is_grammar_free boolean not null default false,
  created_at timestamptz not null default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  order_index int not null default 0
);
create index units_module_id_idx on units(module_id);

create table audio_tracks (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  title_en text not null,
  title_ar text,
  storage_path text not null,
  duration int,
  order_index int not null default 0
);
create index audio_tracks_unit_id_idx on audio_tracks(unit_id);

create table grammar_topics (
  id uuid primary key default gen_random_uuid(),
  order_index int not null default 0,
  title_en text not null,
  video_r2_key text,
  description text,
  unlock_after_topic_id uuid references grammar_topics(id)
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references grammar_topics(id) on delete cascade,
  type text not null check (type in ('mcq','order','tf')),
  payload_json jsonb not null,
  order_index int not null default 0
);
create index quiz_questions_topic_id_idx on quiz_questions(topic_id);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references grammar_topics(id) on delete cascade,
  score numeric not null,
  completed_at timestamptz not null default now()
);
create index quiz_attempts_user_topic_idx on quiz_attempts(user_id, topic_id);

create table module_ai_config (
  module_id uuid primary key references modules(id) on delete cascade,
  persona_name text not null default 'Ustaz',
  system_prompt text not null default '',
  model text not null default 'gemini-2.5-flash',
  daily_quota int not null default 60
);

-- Global secrets (Gemini API key, etc). RLS enabled, NO policies added below
-- => no client role can read/write this table at all; only service_role
-- (used by Edge Functions) bypasses RLS.
create table admin_settings (
  key text primary key,
  value_encrypted text
);

create table ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  message_count int not null default 0,
  date date not null default current_date,
  unique (user_id, module_id, date)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null default 0,
  image_url text,
  module_id uuid references modules(id) on delete set null,
  stock int not null default 0,
  on_sale boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table module_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  module_id uuid not null references modules(id) on delete cascade,
  batch_id uuid not null default gen_random_uuid(),
  activated_count int not null default 0,
  status text not null default 'active' check (status in ('active','disabled')),
  created_at timestamptz not null default now()
);

create table user_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  activated_at timestamptz not null default now(),
  via_code_id uuid references module_codes(id),
  unique (user_id, module_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total numeric not null,
  payment_provider text check (payment_provider in ('bayarcash','toyyibpay')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  shipping_status text not null default 'pending' check (shipping_status in ('pending','shipped','delivered')),
  shipping_address jsonb,
  created_at timestamptz not null default now()
);
create index orders_user_id_idx on orders(user_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity int not null default 1,
  price numeric not null
);
create index order_items_order_id_idx on order_items(order_id);

-- ============================================================
-- 2. is_admin() — SECURITY DEFINER, used inside RLS policies.
--    Must bypass RLS on `profiles` itself or every policy that calls it
--    recurses / silently returns false.
-- ============================================================

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- 3. Auto-profile + admin bootstrap trigger
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    case when exists (select 1 from admin_allowlist a where lower(a.email) = lower(new.email))
      then 'admin' else 'student' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 4. activate_module_code RPC — the only way user_modules gets a row
--    from the client (no direct insert policy is granted).
-- ============================================================

create or replace function activate_module_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code module_codes%rowtype;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_code from module_codes where code = upper(p_code) for update;

  if not found then
    raise exception 'invalid_code';
  end if;
  if v_code.status <> 'active' then
    raise exception 'code_disabled';
  end if;
  if exists (select 1 from user_modules where user_id = v_uid and module_id = v_code.module_id) then
    raise exception 'already_activated';
  end if;

  insert into user_modules (user_id, module_id, via_code_id)
  values (v_uid, v_code.module_id, v_code.id);

  update module_codes set activated_count = activated_count + 1 where id = v_code.id;

  return (select json_build_object('module_id', m.id, 'slug', m.slug, 'name', m.name)
          from modules m where m.id = v_code.module_id);
end;
$$;

-- ============================================================
-- 5. generate_module_codes RPC — admin-only batch code generation
-- ============================================================

create or replace function generate_module_codes(p_module_id uuid, p_quantity int)
returns setof module_codes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_batch uuid := gen_random_uuid();
  i int;
  v_code text;
begin
  if not is_admin() then
    raise exception 'not_authorized';
  end if;

  select upper(left(regexp_replace(slug, '[^a-zA-Z]', '', 'g'), 4)) into v_prefix
  from modules where id = p_module_id;
  if v_prefix is null or length(v_prefix) = 0 then
    v_prefix := 'MOD';
  end if;

  for i in 1..p_quantity loop
    v_code := v_prefix || '-' || lpad((floor(random()*10000))::int::text, 4, '0');
    insert into module_codes (code, module_id, batch_id)
    values (v_code, p_module_id, v_batch)
    on conflict (code) do nothing;
  end loop;

  return query select * from module_codes where batch_id = v_batch;
end;
$$;

-- ============================================================
-- 6. RLS
-- ============================================================

alter table profiles enable row level security;
alter table admin_allowlist enable row level security;
alter table modules enable row level security;
alter table units enable row level security;
alter table audio_tracks enable row level security;
alter table grammar_topics enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;
alter table module_ai_config enable row level security;
alter table admin_settings enable row level security; -- no policies: locked to service_role only
alter table ai_usage_log enable row level security;
alter table products enable row level security;
alter table module_codes enable row level security;
alter table user_modules enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- profiles
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from profiles p where p.id = auth.uid()));
create policy "profiles_admin_all" on profiles for all
  using (is_admin()) with check (is_admin());

-- admin_allowlist — admin only
create policy "admin_allowlist_admin_all" on admin_allowlist for all
  using (is_admin()) with check (is_admin());

-- modules / units — public catalog metadata (Landing, Dashboard browsing)
create policy "modules_public_read" on modules for select using (true);
create policy "modules_admin_write" on modules for insert with check (is_admin());
create policy "modules_admin_update" on modules for update using (is_admin());
create policy "modules_admin_delete" on modules for delete using (is_admin());

create policy "units_public_read" on units for select using (true);
create policy "units_admin_write" on units for insert with check (is_admin());
create policy "units_admin_update" on units for update using (is_admin());
create policy "units_admin_delete" on units for delete using (is_admin());

-- audio_tracks — gated by activation (user_modules) or admin
create policy "audio_tracks_activated_read" on audio_tracks for select using (
  is_admin() or exists (
    select 1 from units u
    join user_modules um on um.module_id = u.module_id and um.user_id = auth.uid()
    where u.id = audio_tracks.unit_id
  )
);
create policy "audio_tracks_admin_write" on audio_tracks for insert with check (is_admin());
create policy "audio_tracks_admin_update" on audio_tracks for update using (is_admin());
create policy "audio_tracks_admin_delete" on audio_tracks for delete using (is_admin());

-- grammar (free for every signed-in account)
create policy "grammar_topics_auth_read" on grammar_topics for select using (auth.uid() is not null);
create policy "grammar_topics_admin_write" on grammar_topics for insert with check (is_admin());
create policy "grammar_topics_admin_update" on grammar_topics for update using (is_admin());
create policy "grammar_topics_admin_delete" on grammar_topics for delete using (is_admin());

create policy "quiz_questions_auth_read" on quiz_questions for select using (auth.uid() is not null);
create policy "quiz_questions_admin_write" on quiz_questions for insert with check (is_admin());
create policy "quiz_questions_admin_update" on quiz_questions for update using (is_admin());
create policy "quiz_questions_admin_delete" on quiz_questions for delete using (is_admin());

create policy "quiz_attempts_own_read" on quiz_attempts for select using (user_id = auth.uid() or is_admin());
create policy "quiz_attempts_own_insert" on quiz_attempts for insert with check (user_id = auth.uid());

-- module_ai_config — persona/model visible to signed-in users (needed by AI Ustaz UI),
-- writes admin only. system_prompt exposure is an accepted fasa-1 simplification.
create policy "module_ai_config_auth_read" on module_ai_config for select using (auth.uid() is not null);
create policy "module_ai_config_admin_write" on module_ai_config for insert with check (is_admin());
create policy "module_ai_config_admin_update" on module_ai_config for update using (is_admin());
create policy "module_ai_config_admin_delete" on module_ai_config for delete using (is_admin());

-- ai_usage_log — read own/admin; writes only via Edge Function (service_role, bypasses RLS)
create policy "ai_usage_log_own_read" on ai_usage_log for select using (user_id = auth.uid() or is_admin());

-- products — public read active ones, admin manages all
create policy "products_public_read" on products for select using (is_active or is_admin());
create policy "products_admin_write" on products for insert with check (is_admin());
create policy "products_admin_update" on products for update using (is_admin());
create policy "products_admin_delete" on products for delete using (is_admin());

-- module_codes — admin only
create policy "module_codes_admin_all" on module_codes for all using (is_admin()) with check (is_admin());

-- user_modules — read own/admin; insert only via activate_module_code() RPC (security definer, no policy needed)
create policy "user_modules_own_read" on user_modules for select using (user_id = auth.uid() or is_admin());

-- orders / order_items
create policy "orders_own_read" on orders for select using (user_id = auth.uid() or is_admin());
create policy "orders_own_insert" on orders for insert with check (user_id = auth.uid());
create policy "orders_admin_update" on orders for update using (is_admin());

create policy "order_items_own_read" on order_items for select using (
  is_admin() or exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);
create policy "order_items_own_insert" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

-- ============================================================
-- 7. Seed: modules from PRD §4.1 + owner as first admin
-- ============================================================

insert into admin_allowlist (email) values ('mnafiqaiman@gmail.com');

insert into modules (name, slug, is_grammar_free) values
  ('Bahasa Arab Pemula', 'pemula', false),
  ('Arab Tujuan Kerjaya', 'kerjaya', false),
  ('Bahasa Arab Al Quran', 'quran', false),
  ('Anakku Berbahasa Arab', 'anakku', false);

insert into module_ai_config (module_id, persona_name, system_prompt, model, daily_quota)
select id, case slug
    when 'quran' then 'Ustaz Hakim'
    when 'pemula' then 'Ustaz Zaid'
    when 'kerjaya' then 'Ustaz Firdaus'
    when 'anakku' then 'Ustaz Amin'
  end,
  'You are a friendly Arabic language teacher (Ustaz) helping a student practice the module content. Answer in simple English/Malay with Arabic examples where useful.',
  'gemini-2.5-flash', 60
from modules;

insert into products (name, description, price, module_id, stock) select
  'Bahasa Arab Pemula', 'Physical card & book set — beginner Arabic module.', 39.90, id, 100 from modules where slug='pemula';
insert into products (name, description, price, module_id, stock) select
  'Arab Tujuan Kerjaya', 'Physical card & book set — career-purpose Arabic module.', 59.90, id, 100 from modules where slug='kerjaya';
insert into products (name, description, price, module_id, stock) select
  'Bahasa Arab Al Quran', 'Physical card & book set — Quranic Arabic module.', 97.90, id, 100 from modules where slug='quran';
insert into products (name, description, price, module_id, stock) select
  'Anakku Berbahasa Arab', 'Physical card & book set — Arabic for kids module.', 27.90, id, 100 from modules where slug='anakku';

insert into grammar_topics (order_index, title_en, description) values
  (1, 'Nouns & articles', 'Introduction to Arabic nouns and definite articles.'),
  (2, 'Verb conjugation', 'How Arabic verbs change with tense and subject.'),
  (3, 'Sentence structure', 'Word order in Arabic sentences (verbal vs nominal).'),
  (4, 'Case endings (i''rab)', 'Nominative, accusative and genitive case endings.'),
  (5, 'Pronouns', 'Personal, demonstrative and relative pronouns.'),
  (6, 'Common particles', 'Prepositions and particles used in everyday Arabic.');

notify pgrst, 'reload schema';
