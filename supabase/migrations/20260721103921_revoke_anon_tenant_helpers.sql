-- Supabase may explicitly grant API roles execute access through function hooks.
-- These SECURITY DEFINER tenant helpers are authenticated-only surfaces.

revoke all on function public.current_user_company_ids() from public, anon;
revoke all on function public.current_user_has_company_role(uuid, public.company_membership_role[]) from public, anon;

grant execute on function public.current_user_company_ids() to authenticated;
grant execute on function public.current_user_has_company_role(uuid, public.company_membership_role[]) to authenticated;
