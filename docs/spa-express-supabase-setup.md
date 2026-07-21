# React Router SPA + Express + Supabase setup notes

Mælk v0 uses React Router v8 Framework in SPA mode, a same-origin Node.js/Express runtime, and Supabase Auth/Postgres as the canonical auth/data target. Auth credentials are server-owned: the browser talks to `/api/auth/*` and never stores Supabase refresh credentials in localStorage.

## Current boundary

- The target split is approved: `mælk.com` for marketing and `app.mælk.com` for the application. A local Cloudflare Workers runtime preview is verified; deployment, hosted database connectivity, DNS cutover, and credentials remain human-gated.
- The current runnable shape is local: build the SPA, then run Express to serve `apps/app/build/client` and `/api/*` from one origin.
- Do not wire `mælk.com` / `xn--mlk-yla.com` yet.
- Do not create hosting projects, deploy, commit secrets, or paste credentials into repo files.
- Do not add service-role keys, refresh tokens, OTPs, cookie values, encryption keys, or Supabase management tokens to browser-visible env vars.

## Local runtime shape

Root commands:

```bash
npm install
npm run dev
npm run build
npm start
npm run test:worker-preview
npm run supabase:start:test
npm run test:security:local
npm run supabase:stop
```

`npm run dev` starts:

- `apps/api` on `http://localhost:3001`;
- `apps/app` through Vite/React Router, with `/api` proxied to the Express service.

`npm run build` builds the web app first, then compiles the API. `npm start` launches Express, which serves:

- `GET /api/health` as JSON;
- server-owned auth endpoints for OTP start, OTP verification, session introspection, session refresh, logout, and `/api/me`;
- unknown `/api/*` routes as JSON `404`;
- static assets from `apps/app/build/client`;
- `index.html` for non-API client routes.

`npm run test:worker-preview` verifies the alternative Cloudflare runtime without deploying: Static Assets serves the SPA while `/api/*` is adapted to the API-only Express app through Workers' Node HTTP support. See `cloudflare-workers-preview.md` for evidence and remaining hosted gates.

## Server-owned Supabase Auth settings

Required server/runtime values for production-oriented auth are listed in `apps/api/.env.example`:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_JWT_ISSUER
SUPABASE_JWT_AUDIENCE
SUPABASE_JWKS_URL
MAELK_AUTH_ALLOWED_ORIGINS
MAELK_SESSION_ENCRYPTION_KEY
DATABASE_URL
```

`MAELK_SESSION_ENCRYPTION_KEY` must be a base64url-encoded 32-byte key generated outside the repo. `DATABASE_URL` must point to the Supabase Postgres database with access to `app_private.application_sessions`; browser/PostgREST roles are explicitly revoked from that schema/table. The Express runtime defaults closed in production when any required value is missing. Local/test fakes can inject an explicit auth runtime for deterministic checks.

`SUPABASE_JWT_ALGORITHMS` is restricted to the asymmetric allowlist `RS256,ES256`; symmetric algorithms fail configuration closed. Production unavailable responses do not enumerate missing environment-variable names.

Public browser values are not used for auth in this slice. Keep `VITE_*` values out of the auth path so refresh credentials stay behind the same-origin API boundary.

Allowed origins are a comma-separated allowlist. Include approved local origins for development, for example:

```text
MAELK_AUTH_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
```

The public app URL contract is `https://app.mælk.com` (`https://app.xn--mlk-yla.com` technically), but DNS/custom-domain and deployment work remains human-gated. When a future hosting target is approved, Mads enters credentials and env vars himself. ANANKE can guide field-by-field and verify the app afterward, but should not request, type, store, or commit secrets.

## Session and CSRF contract

- OTP start maps invite-only auth to Supabase REST as `create_user: false` and always returns the same generic success response for provider errors.
- OTP verification happens on the Express server, verifies the Supabase JWT through JWKS, encrypts the refresh token, stores only a hash of the opaque cookie identifier, and sets an HttpOnly session cookie.
- Production cookies use the `__Host-` prefix, `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, and no `Domain` attribute.
- Cookie-authenticated state-changing requests require an allowlisted `Origin` and `X-Maelk-CSRF`.
- Logout destroys the application session and clears the cookie. Refresh rotates the cookie identifier atomically and rejects replay; concurrent refresh requests with one cookie yield exactly one replacement session.

## Local security proof

`npm run test:security:local` requires the minimal local stack started by `npm run supabase:start:test`. It performs a clean database reset, applies the versioned migration, runs 13 seeded pgTAP assertions with two isolated companies, and executes the Postgres-backed concurrent session-rotation test. The stack is stopped in CI with an `always()` cleanup step and should also be stopped after manual use.
