-- Keep profiles.email (and the admin allowlist) in step when a user changes
-- their login email. handle_new_user only runs on signup, so without this the
-- copies would keep the old address after an email change is confirmed.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;

  if old.email is not null and new.email is not null then
    -- If the new address is already allowlisted, just drop the old entry.
    delete from public.admin_allowlist
    where lower(email) = lower(old.email)
      and exists (select 1 from public.admin_allowlist where lower(email) = lower(new.email));

    update public.admin_allowlist
    set email = lower(new.email)
    where lower(email) = lower(old.email);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- One-off: bring any already-drifted profile emails back in line.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is distinct from u.email;
