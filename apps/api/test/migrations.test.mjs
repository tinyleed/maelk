import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "../../..");
const migrationsDir = join(repoRoot, "supabase/migrations");
const harnessPath = join(repoRoot, "supabase/tests/cross_tenant_rls_harness.sql");

async function readAuthMigration() {
  const files = await readdir(migrationsDir);
  const migrationName = files.find((file) => file.endsWith("_auth_tenant_foundation_v0.sql"));
  assert.ok(migrationName, "auth tenant foundation migration missing");
  return readFile(join(migrationsDir, migrationName), "utf8");
}

test("auth tenant migration enables RLS, revokes private access, and indexes tenant lookup paths", async () => {
  const sql = await readAuthMigration();

  for (const table of ["profiles", "companies", "company_memberships", "audit_events"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "iu"), `${table} RLS`);
  }

  for (const required of [
    "create schema if not exists app_private",
    "create table app_private.application_sessions",
    "encrypted_refresh_token text not null",
    "access_token_expires_at timestamptz not null",
    "revoke all on schema app_private from public, anon, authenticated",
    "revoke all on table app_private.application_sessions from public, anon, authenticated",
    "create type public.company_membership_role as enum ('owner', 'admin', 'member')",
    "active boolean not null default true",
    "security definer",
    "set search_path = public, pg_temp",
    "grant execute on function public.current_user_company_ids() to authenticated",
    "grant execute on function public.current_user_has_company_role(uuid, public.company_membership_role[]) to authenticated",
    "revoke insert, update, delete on public.profiles from anon, authenticated",
    "revoke insert, update, delete on public.company_memberships from anon, authenticated",
    "revoke insert, update, delete on public.audit_events from anon, authenticated",
    "create index company_memberships_user_company_idx",
    "create index company_memberships_company_user_idx",
    "create index audit_events_company_created_at_idx",
    "create index application_sessions_user_expires_idx",
  ]) {
    assert.ok(sql.includes(required), `migration missing ${required}`);
  }

  for (const forbidden of ["grant all on schema app_private", "grant all on table app_private.application_sessions"]) {
    assert.equal(sql.toLowerCase().includes(forbidden), false, `private session grant leaked: ${forbidden}`);
  }
});

test("RLS policies derive company access from auth.uid membership and deny client self-escalation", async () => {
  const sql = await readAuthMigration();

  for (const required of [
    "using (id in (select public.current_user_company_ids()))",
    "using (company_id in (select public.current_user_company_ids()))",
    "company_member_select_memberships",
    "company_member_select_audit_events",
  ]) {
    assert.ok(sql.includes(required), `policy missing ${required}`);
  }

  for (const forbiddenPolicy of [
    "profile_insert_self",
    "profile_update_self",
    "for insert to authenticated with check (true)",
    "for update to authenticated using (true)",
    "for delete to authenticated using (true)",
  ]) {
    assert.equal(sql.toLowerCase().includes(forbiddenPolicy), false, `self-escalating policy found: ${forbiddenPolicy}`);
  }
});

test("deterministic cross-tenant RLS harness is present for environments with Supabase CLI/runtime", async () => {
  const harness = await readFile(harnessPath, "utf8");
  for (const required of [
    "select plan(13)",
    "insert into auth.users",
    "tenant A cannot read tenant B company",
    "browser role cannot create or self-escalate membership",
    "browser role cannot forge audit events",
    "browser role cannot access the private session schema",
    "tenant B sees only its own company",
    "set local role authenticated",
    "set_config('request.jwt.claim.sub'",
    "select * from finish()",
  ]) {
    assert.ok(harness.includes(required), `cross-tenant harness missing ${required}`);
  }
});
