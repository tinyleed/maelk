-- Mælk auth and tenant foundation v0.
-- Server-owned sessions live in app_private and are not exposed to browser/PostgREST roles.

create extension if not exists pgcrypto;

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create type public.company_membership_role as enum ('owner', 'admin', 'member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null default 'DK',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz
);

create table public.company_memberships (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.company_membership_role not null,
  active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz,
  primary key (company_id, user_id)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_user_id uuid references public.profiles(id),
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table app_private.application_sessions (
  id_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  csrf_token text not null,
  encrypted_refresh_token text not null,
  csrf_token_hash text not null,
  created_at timestamptz not null default now(),
  access_token_expires_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index profiles_email_idx on public.profiles (email);
create index companies_created_by_idx on public.companies (created_by);
create index company_memberships_user_company_idx on public.company_memberships (user_id, company_id) where active;
create index company_memberships_company_user_idx on public.company_memberships (company_id, user_id) where active;
create index company_memberships_created_by_idx on public.company_memberships (created_by);
create index audit_events_company_created_at_idx on public.audit_events (company_id, created_at desc);
create index audit_events_actor_created_at_idx on public.audit_events (actor_user_id, created_at desc);
create index application_sessions_user_expires_idx on app_private.application_sessions (user_id, expires_at) where revoked_at is null;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.audit_events enable row level security;

create or replace function public.current_user_company_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select company_id
  from public.company_memberships
  where user_id = auth.uid()
    and active is true;
$$;

create or replace function public.current_user_has_company_role(
  checked_company_id uuid,
  allowed_roles public.company_membership_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.company_memberships
    where company_id = checked_company_id
      and user_id = auth.uid()
      and active is true
      and role = any(allowed_roles)
  );
$$;

revoke all on function public.current_user_company_ids() from public;
revoke all on function public.current_user_has_company_role(uuid, public.company_membership_role[]) from public;
grant execute on function public.current_user_company_ids() to authenticated;
grant execute on function public.current_user_has_company_role(uuid, public.company_membership_role[]) to authenticated;

create policy profile_select_self_or_company_member
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.company_memberships as visible_membership
    where visible_membership.user_id = profiles.id
      and visible_membership.company_id in (select public.current_user_company_ids())
      and visible_membership.active is true
  )
);

create policy company_member_select_companies
on public.companies
for select
to authenticated
using (id in (select public.current_user_company_ids()));

create policy company_member_select_memberships
on public.company_memberships
for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

create policy company_member_select_audit_events
on public.audit_events
for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.companies, public.company_memberships, public.audit_events to authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.companies from anon, authenticated;
revoke insert, update, delete on public.company_memberships from anon, authenticated;
revoke insert, update, delete on public.audit_events from anon, authenticated;
revoke all on table app_private.application_sessions from public, anon, authenticated;
