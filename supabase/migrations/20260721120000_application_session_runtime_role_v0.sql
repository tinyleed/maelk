-- Mælk application session runtime role v0.
-- Defines a NOLOGIN group role for the server-owned session store only.
-- No LOGIN role, secret, service-role, tenant-domain, owner, or hosted credential is created here.

create role maelk_application_session_runtime nologin;

alter role maelk_application_session_runtime
  with nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;

revoke all on schema app_private from maelk_application_session_runtime;
revoke all on all tables in schema app_private from maelk_application_session_runtime;
revoke all on schema public from maelk_application_session_runtime;
revoke all on table public.profiles, public.companies, public.company_memberships, public.audit_events from maelk_application_session_runtime;
revoke all on schema auth from maelk_application_session_runtime;
revoke all on table auth.users from maelk_application_session_runtime;

grant usage on schema app_private to maelk_application_session_runtime;
grant select (id_hash, user_id, email, csrf_token, csrf_token_hash, encrypted_refresh_token, created_at, access_token_expires_at, expires_at, revoked_at) on table app_private.application_sessions to maelk_application_session_runtime;
grant insert (id_hash, user_id, email, csrf_token, csrf_token_hash, encrypted_refresh_token, created_at, access_token_expires_at, expires_at) on table app_private.application_sessions to maelk_application_session_runtime;
grant update (revoked_at) on table app_private.application_sessions to maelk_application_session_runtime;
