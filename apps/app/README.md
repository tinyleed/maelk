# apps/app

Core Mælk application. Commerce/business OS app shell with shop-floor/manufacturing execution out of scope.

## v0 app shell

The first real app slice is a small **React Router framework** shell prepared for Supabase Auth and Vercel preview hosting.

- React Router framework routes live in `app/routes.ts` and route modules under `app/routes/`.
- TypeScript is enabled for route modules and app code.
- Tailwind is wired through `@tailwindcss/vite`; the first shell still uses product-native CSS tokens for the Mælk palette.
- Radix UI is present through the shared `Button` primitive using `@radix-ui/react-slot`.
- Supabase browser/server helpers live under `app/lib/`.
- `/login` sends a Supabase magic link when env vars are configured.
- `/app` is the protected operator surface and currently shows local-only Product Launch OS demo records.
- The app builds without Supabase env vars so Vercel setup can be prepared before credentials exist.

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

Do not commit `.env.local`, service-role keys, database passwords, Vercel tokens, or Supabase management tokens.

## Local commands

From the repo root:

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run lint
npm run build
```

## Product Launch OS static cockpit

`product-launch-os/` contains the earlier repo-local Product Launch OS static cockpit. It is dependency-free and backed by fake JSON records so the operating loop can be reviewed without live integrations.
