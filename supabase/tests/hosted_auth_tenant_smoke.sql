-- Read-only hosted smoke for the applied auth/tenant foundation.
-- Safe for `supabase test db --linked`: no fixture data and no extension access.

begin read only;

select '1..15';

select case when coalesce((
  select c.relrowsecurity
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'profiles'
), false)
  then 'ok 1 - profiles has RLS enabled'
  else 'not ok 1 - profiles has RLS enabled' end;

select case when coalesce((
  select c.relrowsecurity
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'companies'
), false)
  then 'ok 2 - companies has RLS enabled'
  else 'not ok 2 - companies has RLS enabled' end;

select case when coalesce((
  select c.relrowsecurity
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'company_memberships'
), false)
  then 'ok 3 - company memberships has RLS enabled'
  else 'not ok 3 - company memberships has RLS enabled' end;

select case when coalesce((
  select c.relrowsecurity
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'audit_events'
), false)
  then 'ok 4 - audit events has RLS enabled'
  else 'not ok 4 - audit events has RLS enabled' end;

select case when not has_schema_privilege('authenticated', 'app_private', 'USAGE')
  then 'ok 5 - authenticated cannot use private session schema'
  else 'not ok 5 - authenticated cannot use private session schema' end;

select case when not has_table_privilege(
  'authenticated',
  (
    select c.oid
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'app_private' and c.relname = 'application_sessions'
  ),
  'SELECT'
)
  then 'ok 6 - authenticated cannot read application sessions'
  else 'not ok 6 - authenticated cannot read application sessions' end;

select case when not has_table_privilege('authenticated', 'public.company_memberships', 'INSERT')
  then 'ok 7 - authenticated cannot create memberships'
  else 'not ok 7 - authenticated cannot create memberships' end;

select case when not has_table_privilege('authenticated', 'public.company_memberships', 'UPDATE')
  then 'ok 8 - authenticated cannot alter membership roles'
  else 'not ok 8 - authenticated cannot alter membership roles' end;

select case when not has_table_privilege('authenticated', 'public.audit_events', 'INSERT')
  then 'ok 9 - authenticated cannot forge audit events'
  else 'not ok 9 - authenticated cannot forge audit events' end;

select case when not has_table_privilege('authenticated', 'public.profiles', 'UPDATE')
  then 'ok 10 - authenticated cannot alter server-owned profiles'
  else 'not ok 10 - authenticated cannot alter server-owned profiles' end;

select case when not has_table_privilege('authenticated', 'public.companies', 'INSERT')
  then 'ok 11 - authenticated cannot create companies directly'
  else 'not ok 11 - authenticated cannot create companies directly' end;

select case when coalesce((
  select array_agg(policyname order by policyname)
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in ('profiles', 'companies', 'company_memberships', 'audit_events')
), array[]::name[]) = array[
  'company_member_select_audit_events',
  'company_member_select_companies',
  'company_member_select_memberships',
  'profile_select_self_or_company_member'
]::name[]
  then 'ok 12 - exact tenant select policy set is installed'
  else 'not ok 12 - exact tenant select policy set is installed' end;

select case when has_function_privilege(
  'authenticated',
  'public.current_user_company_ids()',
  'EXECUTE'
)
  then 'ok 13 - authenticated can execute company scope helper'
  else 'not ok 13 - authenticated can execute company scope helper' end;

select case when not has_function_privilege(
  'anon',
  'public.current_user_company_ids()',
  'EXECUTE'
)
  then 'ok 14 - anon cannot execute company scope helper'
  else 'not ok 14 - anon cannot execute company scope helper' end;

select case when
  has_function_privilege(
    'authenticated',
    'public.current_user_has_company_role(uuid,public.company_membership_role[])',
    'EXECUTE'
  )
  and not has_function_privilege(
    'anon',
    'public.current_user_has_company_role(uuid,public.company_membership_role[])',
    'EXECUTE'
  )
  then 'ok 15 - role helper is executable only by authenticated clients'
  else 'not ok 15 - role helper is executable only by authenticated clients' end;

rollback;
