# apps/app

Core Mælk React Router app shell for the Denmark-first AI-native ERP platform, with shop-floor/manufacturing execution out of scope.

## v0 app shell

The current app slice is a **React Router v8 Framework SPA** that is built to `build/client` and served by the same-origin Express runtime in `../api`.

- React Router framework routes live in `app/routes.ts` and route modules under `app/routes/`.
- SPA mode is configured with `ssr: false`; non-root route data uses `clientLoader` and same-origin API session logic.
- TypeScript is enabled for route modules and app code.
- Tailwind v4 is wired through `@tailwindcss/vite`; product-native CSS tokens keep the Mælk cream/cocoa/caramel palette.
- shadcn/ui is initialized via `components.json`, `app/lib/utils.ts`, and `app/components/ui/button.tsx`; UI must preserve Mælk design tokens rather than stock styling.
- Browser auth calls live in `app/lib/auth-api.ts` and only call same-origin `/api/auth/*`; the browser does not create a Supabase client or persist Supabase refresh credentials.
- `/login` starts invite-only email OTP through the Express API, then verifies the OTP through the same-origin API.
- `/auth/callback` is retained as a retired compatibility route and no longer exchanges Supabase magic-link codes in the browser.
- `/app` is the protected operator surface when server-owned auth is configured; when required server auth configuration is absent, it shows a labelled local setup state without simulating identity.
- Product Launch OS demo cards are derived from a typed local domain module under `app/modules/product-launch-os/`, preserving fake readiness gates, audit fields, and human approval reasons without live writes. Treat this as an existing prototype, not the default next build lane.
- The app builds without Supabase env vars so the SPA/API stack can be verified without secrets.

## Environment

Server-owned auth values are configured on the Express runtime, not in browser `VITE_*` auth variables:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_JWT_ISSUER=
SUPABASE_JWT_AUDIENCE=
SUPABASE_JWKS_URL=
MAELK_AUTH_ALLOWED_ORIGINS=
MAELK_SESSION_ENCRYPTION_KEY=
DATABASE_URL=
```

Use `../api/.env.example` as the variable-name template. `apps/app/.env.example` intentionally contains no Supabase browser configuration.

Do not commit `.env.local`, service-role keys, refresh tokens, OTP values, cookie values, encryption keys, database passwords, deployment tokens, Supabase management tokens, or any secret value.

## Local commands

From the repo root:

```bash
npm install
npm run dev       # starts Express API on :3001 and React Router/Vite on :5173
npm run test
npm run typecheck
npm run lint
npm run build
npm start         # serves the built SPA through apps/api
```

See `../../docs/spa-express-supabase-setup.md` for the current stack notes.

## Product Launch OS static cockpit

`product-launch-os/` contains the earlier repo-local Product Launch OS static cockpit. It is dependency-free and backed by fake JSON records so the operating loop can be reviewed without live integrations.
