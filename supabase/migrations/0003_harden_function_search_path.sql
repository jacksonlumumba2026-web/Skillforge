-- Fixes a WARN-level advisor finding: functions without a pinned
-- search_path are vulnerable to search_path hijacking. handle_new_user()
-- already had this via `security definer set search_path = public`;
-- protect_profile_identity() was missing it.
create or replace function public.protect_profile_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.role := old.role;
    new.user_id := old.user_id;
  end if;
  return new;
end;
$$;
