-- Self-contained cross-tenant RLS proof for local and linked Supabase.
-- Emits TAP directly and leaves no fixtures behind because the transaction rolls back.

begin;

select '1..13';

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-0000000000a1',
    'authenticated',
    'authenticated',
    'owner-a@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-0000000000b1',
    'authenticated',
    'authenticated',
    'owner-b@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

insert into public.profiles (id, email, display_name)
values
  ('00000000-0000-0000-0000-0000000000a1', 'owner-a@example.test', 'Owner A'),
  ('00000000-0000-0000-0000-0000000000b1', 'owner-b@example.test', 'Owner B');

insert into public.companies (id, name, created_by)
values
  ('00000000-0000-0000-0000-0000000000a2', 'Company A', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000b2', 'Company B', '00000000-0000-0000-0000-0000000000b1');

insert into public.company_memberships (company_id, user_id, role, created_by)
values
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', 'owner', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b1', 'owner', '00000000-0000-0000-0000-0000000000b1');

insert into public.audit_events (id, company_id, actor_user_id, action, target_table, target_id)
values
  ('00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a1', 'company.created', 'companies', '00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000b1', 'company.created', 'companies', '00000000-0000-0000-0000-0000000000b2');

select case when not has_table_privilege('authenticated', 'public.company_memberships', 'INSERT')
  then 'ok 1 - browser role cannot create or self-escalate membership'
  else 'not ok 1 - browser role cannot create or self-escalate membership' end;

select case when not has_table_privilege('authenticated', 'public.company_memberships', 'UPDATE')
  then 'ok 2 - browser role cannot change membership roles'
  else 'not ok 2 - browser role cannot change membership roles' end;

select case when not has_table_privilege('authenticated', 'public.audit_events', 'INSERT')
  then 'ok 3 - browser role cannot forge audit events'
  else 'not ok 3 - browser role cannot forge audit events' end;

select case when not has_table_privilege('authenticated', 'public.profiles', 'UPDATE')
  then 'ok 4 - browser role cannot spoof server-owned profile identity fields'
  else 'not ok 4 - browser role cannot spoof server-owned profile identity fields' end;

select case when not has_schema_privilege('authenticated', 'app_private', 'USAGE')
  then 'ok 5 - browser role cannot access the private session schema'
  else 'not ok 5 - browser role cannot access the private session schema' end;

select case when not has_table_privilege('authenticated', 'app_private.application_sessions', 'SELECT')
  then 'ok 6 - browser role cannot read application sessions'
  else 'not ok 6 - browser role cannot read application sessions' end;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000000a1';
set local "request.jwt.claim.role" = 'authenticated';

select case when coalesce(
  (select array_agg(id::text order by id) from public.companies),
  array[]::text[]
) = array['00000000-0000-0000-0000-0000000000a2']::text[]
  then 'ok 7 - tenant A sees only its own company'
  else 'not ok 7 - tenant A sees only its own company' end;

select case when not exists (
  select 1 from public.companies where id = '00000000-0000-0000-0000-0000000000b2'::uuid
)
  then 'ok 8 - tenant A cannot read tenant B company'
  else 'not ok 8 - tenant A cannot read tenant B company' end;

select case when coalesce(
  (select array_agg(company_id::text order by company_id) from public.company_memberships),
  array[]::text[]
) = array['00000000-0000-0000-0000-0000000000a2']::text[]
  then 'ok 9 - tenant A sees only its own memberships'
  else 'not ok 9 - tenant A sees only its own memberships' end;

select case when coalesce(
  (select array_agg(action order by id) from public.audit_events),
  array[]::text[]
) = array['company.created']::text[]
  then 'ok 10 - tenant A sees only its own audit events'
  else 'not ok 10 - tenant A sees only its own audit events' end;

select case when public.current_user_has_company_role(
  '00000000-0000-0000-0000-0000000000a2',
  array['owner']::public.company_membership_role[]
)
  then 'ok 11 - tenant A owner role resolves for tenant A'
  else 'not ok 11 - tenant A owner role resolves for tenant A' end;

select case when not public.current_user_has_company_role(
  '00000000-0000-0000-0000-0000000000b2',
  array['owner', 'admin']::public.company_membership_role[]
)
  then 'ok 12 - tenant A has no role in tenant B'
  else 'not ok 12 - tenant A has no role in tenant B' end;

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000000b1';

select case when coalesce(
  (select array_agg(id::text order by id) from public.companies),
  array[]::text[]
) = array['00000000-0000-0000-0000-0000000000b2']::text[]
  then 'ok 13 - tenant B sees only its own company'
  else 'not ok 13 - tenant B sees only its own company' end;

reset role;
rollback;
