-- Persistent AI Ustaz conversations, per learner and module.
create table public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index ai_chat_messages_thread_idx on public.ai_chat_messages (user_id, module_id, created_at desc);

alter table public.ai_chat_messages enable row level security;

-- Learners can read their own conversation. Rows are written only by the
-- ai-ustaz-chat edge function (service role), so a client can't forge Ustaz replies.
create policy "Users read own chat" on public.ai_chat_messages
  for select to authenticated using (user_id = (select auth.uid()));
