-- Self-contained cross-tenant RLS proof for disposable local Supabase.
-- Run with: npm run test:rls

begin;

create extension if not exists pgtap with schema extensions;
select plan(13);

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
    crypt('local-only-password-a', gen_salt('bf')),
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
    crypt('local-only-password-b', gen_salt('bf')),
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

select ok(
  not has_table_privilege('authenticated', 'public.company_memberships', 'INSERT'),
  'browser role cannot create or self-escalate membership'
);

select ok(
  not has_table_privilege('authenticated', 'public.company_memberships', 'UPDATE'),
  'browser role cannot change membership roles'
);

select ok(
  not has_table_privilege('authenticated', 'public.audit_events', 'INSERT'),
  'browser role cannot forge audit events'
);

select ok(
  not has_table_privilege('authenticated', 'public.profiles', 'UPDATE'),
  'browser role cannot spoof server-owned profile identity fields'
);

select ok(
  not has_schema_privilege('authenticated', 'app_private', 'USAGE'),
  'browser role cannot access the private session schema'
);

select ok(
  not has_table_privilege('authenticated', 'app_private.application_sessions', 'SELECT'),
  'browser role cannot read application sessions'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select results_eq(
  $$select id::text from public.companies order by id$$,
  array['00000000-0000-0000-0000-0000000000a2']::text[],
  'tenant A sees only its own company'
);

select is_empty(
  $$select id from public.companies where id = '00000000-0000-0000-0000-0000000000b2'::uuid$$,
  'tenant A cannot read tenant B company'
);

select results_eq(
  $$select company_id::text from public.company_memberships order by company_id$$,
  array['00000000-0000-0000-0000-0000000000a2']::text[],
  'tenant A sees only its own memberships'
);

select results_eq(
  $$select action from public.audit_events order by id$$,
  array['company.created']::text[],
  'tenant A sees only its own audit events'
);

select ok(
  public.current_user_has_company_role(
    '00000000-0000-0000-0000-0000000000a2',
    array['owner']::public.company_membership_role[]
  ),
  'tenant A owner role resolves for tenant A'
);

select ok(
  not public.current_user_has_company_role(
    '00000000-0000-0000-0000-0000000000b2',
    array['owner', 'admin']::public.company_membership_role[]
  ),
  'tenant A has no role in tenant B'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', true);

select results_eq(
  $$select id::text from public.companies order by id$$,
  array['00000000-0000-0000-0000-0000000000b2']::text[],
  'tenant B sees only its own company'
);

reset role;
select * from finish();
rollback;
