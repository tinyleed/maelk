# apps/api

Same-origin Node.js/Express runtime for the Mælk React Router SPA.

## Responsibilities

- Export a testable Express app from `src/app.ts`.
- Serve `GET /api/health` as deterministic JSON.
- Own the browser auth boundary through `/api/auth/otp/start`, `/api/auth/otp/verify`, `/api/auth/session`, `/api/auth/session/refresh`, `/api/auth/logout`, and protected `/api/me`.
- Verify Supabase access JWTs with JWKS/Jose, store only hashed session identifiers in `app_private.application_sessions`, encrypt refresh tokens at rest, and enforce allowlisted Origin plus CSRF on cookie-authenticated mutations.
- Return JSON `404` responses for unknown `/api/*` routes.
- Export a Cloudflare Worker entry that adapts the API-only Express app through `httpServerHandler`.
- Serve static assets from `apps/app/build/client` after `npm run build`.
- Return the SPA `index.html` for non-API GET routes such as `/`, `/app`, `/login`, and arbitrary client-side paths.

## Environment

Copy variable names from `apps/api/.env.example`; never copy real values into the repository. `SUPABASE_ANON_KEY` is used only server-to-server for Supabase Auth. Do not configure a service-role key for this browser auth boundary.

`SUPABASE_JWT_ALGORITHMS` accepts only the asymmetric allowlist `RS256,ES256`. Symmetric algorithms such as `HS256` fail configuration closed. Production responses do not disclose missing environment-variable names.

`DATABASE_URL`, refresh tokens, cookie identifiers, OTPs, `MAELK_SESSION_ENCRYPTION_KEY`, database passwords, and hosted service credentials must never be exposed to the browser or committed.

## Verification

From the repository root:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run test:worker-preview
npm run supabase:start:test
npm run test:security:local
npm run supabase:stop
# Manual, linked dev-project gate only:
npm run test:rls:hosted
```

The local security integration gate resets a disposable Supabase database, executes 13 seeded TAP assertions across two tenants, and runs a real Postgres concurrent-session-rotation test. It does not connect to a hosted project. Always stop the local stack after manual testing because its development ports and keys are not production-safe.

`npm run test:rls:hosted` is a separate, manual gate for the currently linked dev project. It opens a read-only transaction and verifies 15 hosted RLS flags, policies, grants, private-schema restrictions, and helper-function ACLs without fixture writes. It is intentionally excluded from CI and does not replace live OTP or two-real-user isolation testing.

The Worker preview gate bundles without upload, starts only on loopback, and verifies same-origin Express API plus SPA/static-asset routing. It does not verify hosted Worker-to-Postgres connectivity; see `../../docs/cloudflare-workers-preview.md`.

## Boundaries

This package does not add service-role keys, deployment behavior, DNS changes, production data writes, or shop-floor/manufacturing execution scope. Supabase schema changes are versioned under `../../supabase/migrations/`; production application still requires separately reviewed migrations, live auth verification, and production approval.
