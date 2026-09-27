-- Single-device sign-in: each profile tracks which device last claimed its
-- session. The client (src/lib/deviceSession.js) writes its own random
-- device id here on sign-in and polls this column; if another device
-- overwrites it, the earlier device is signed out on its next check.
-- No RLS change needed — profiles_update_own already lets a user update any
-- column on their own row as long as their role is unchanged.
alter table public.profiles
  add column if not exists session_id uuid,
  add column if not exists session_started_at timestamptz;
