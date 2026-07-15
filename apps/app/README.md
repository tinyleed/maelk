# apps/app

Core Mælk React Router app shell for the Denmark-first AI-native ERP platform, with shop-floor/manufacturing execution out of scope.

## v0 app shell

The current app slice is a **React Router v8 Framework SPA** that is built to `build/client` and served by the same-origin Express runtime in `../api`.

- React Router framework routes live in `app/routes.ts` and route modules under `app/routes/`.
- SPA mode is configured with `ssr: false`; non-root route data uses `clientLoader` and browser session logic.
- TypeScript is enabled for route modules and app code.
- Tailwind v4 is wired through `@tailwindcss/vite`; product-native CSS tokens keep the Mælk cream/cocoa/caramel palette.
- shadcn/ui is initialized via `components.json`, `app/lib/utils.ts`, and `app/components/ui/button.tsx`; UI must preserve Mælk design tokens rather than stock styling.
- Supabase browser helpers live under `app/lib/` and use `@supabase/supabase-js` with public anon configuration only.
- `/login` sends a Supabase magic link when public env vars are configured.
- `/auth/callback` exchanges the code in the browser and returns to the requested route.
- `/app` is the protected operator surface and currently shows local-only Product Launch OS demo records while the broader ERP platform goal is documented in `../../architecture/maelk-erp-platform-goal-v1.md`.
- Product Launch OS demo cards are derived from a typed local domain module under `app/modules/product-launch-os/`, preserving fake readiness gates, audit fields, and human approval reasons without live writes. Treat this as an existing prototype, not the default next build lane.
- The app builds without Supabase env vars so the SPA/API stack can be verified without secrets.

## Environment

Copy `.env.example` to `.env.local` for local development:

```bash
cp apps/app/.env.example apps/app/.env.local
```

Required public Supabase values:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not commit `.env.local`, service-role keys, database passwords, deployment tokens, Supabase management tokens, or any secret value.

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
