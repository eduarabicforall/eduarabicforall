-- Words / sentences a learner saves from AI Ustaz replies (shown on the My Vocab page).
create table public.user_vocab (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  kind text not null check (kind in ('word', 'sentence')),
  arabic text not null check (char_length(arabic) between 1 and 500),
  transliteration text check (char_length(transliteration) <= 500),
  translation text check (char_length(translation) <= 500),
  topic text check (char_length(topic) <= 200),
  created_at timestamptz not null default now(),
  unique (user_id, kind, arabic)
);

create index user_vocab_user_created_idx on public.user_vocab (user_id, created_at desc);

alter table public.user_vocab enable row level security;

create policy "Users read own vocab" on public.user_vocab
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users add own vocab" on public.user_vocab
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users delete own vocab" on public.user_vocab
  for delete to authenticated using (user_id = (select auth.uid()));
