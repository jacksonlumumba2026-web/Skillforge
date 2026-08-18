-- handle_new_user is only meant to run via the on_auth_user_created trigger,
-- not to be called directly through the exposed PostgREST RPC surface.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- has_active_access is only meant to be evaluated inside the path_steps RLS
-- policy, not called directly (which would let any signed-in user probe
-- another user's subscription status by uid).
revoke execute on function public.has_active_access(uuid) from public, anon;
