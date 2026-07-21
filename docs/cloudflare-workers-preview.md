# Cloudflare Workers preview spike

Status: **local preview verified; no deployment performed**.

The linked `maelk-dev` Supabase Cloud schema and its read-only 15-check RLS/grant smoke are verified independently of this Worker preview.

## Target routing

The approved domain split remains:

- `mælk.com` / `xn--mlk-yla.com`: marketing;
- `app.mælk.com` / `app.xn--mlk-yla.com`: application.

`wrangler.jsonc` models one same-origin application Worker:

- Cloudflare Static Assets serves `apps/app/build/client`;
- `not_found_handling: "single-page-application"` serves the React Router shell for navigation routes;
- only `/api/*` runs Worker code first;
- the Worker adapts the existing Express API through Cloudflare's Node HTTP `httpServerHandler`;
- static filesystem serving stays in the Node entrypoint and is not imported by the Worker entrypoint.

## Reproduce locally

```bash
npm run test:worker-preview
```

The command:

1. builds the SPA and API;
2. runs a Wrangler `deploy --dry-run` bundle check without uploading;
3. starts `wrangler dev --local` on a random `127.0.0.1` port;
4. verifies Express JSON health, API JSON 404, credential-free fail-closed auth-unavailable state, SPA fallback on `/app`, and a real hashed asset;
5. terminates the preview process in `finally`.

The verified local result was `cloudflare_worker_preview_check_ok`. Wrangler 4.112.0 bundled 20 static assets and the Worker successfully routed Express and SPA requests from one origin.

## Auth/session runtime contract

The Worker entrypoint adapts the same Express auth runtime used by Node, but production Worker auth is deliberately fail-closed unless every server-owned auth setting and the `MAELK_SESSION_HYPERDRIVE` binding are present. The binding contract is typed as Hyperdrive-like and uses only `env.MAELK_SESSION_HYPERDRIVE.connectionString`; the connection string is passed to the server-only `PostgresApplicationSessionStore` and is not copied into browser variables, log output, JSON responses, or committed config.

Node/Express local runtime still uses `DATABASE_URL`. Worker runtime does not require or copy `DATABASE_URL`; the Hyperdrive binding supplies the session database connection instead.

Do not add placeholder Hyperdrive IDs or connection strings to `wrangler.jsonc`. Cloudflare `secrets.required` is also deferred to Human gate A because enabling it before real non-production secrets exist would make the current credential-free dry-run/preview CI require hosted values.

## Explicitly not verified

This spike does **not** prove production readiness. Before deployment, separately verify:

- Cloudflare account/project access and a non-production `workers.dev` deployment;
- Worker secret/env binding behavior for all server-owned auth settings and the `MAELK_SESSION_HYPERDRIVE` Hyperdrive binding;
- hosted Supabase JWKS and real email OTP delivery;
- the `pg` session store against hosted Supabase from Workers, including whether direct TCP or Cloudflare Hyperdrive is the chosen production path;
- live hosted OTP plus cross-tenant behavior with two deliberately invited disposable users;
- cookie behavior through the real HTTPS Worker origin;
- rate limiting, Turnstile, WAF, logs, rollback, and custom-domain cutover.

Do not put credentials in `wrangler.jsonc`, `.dev.vars`, committed env files, browser `VITE_*` variables, test output, or documentation. DNS, deployment, secrets, hosted projects, and custom domains remain human-gated.
