# Vercel + Supabase setup notes

Mælk v0 uses React Router framework on Vercel with Supabase Auth/Postgres as the canonical auth and data layer.

## Current boundary

- Use Vercel preview/production URLs first.
- Do not wire `mælk.com` / `xn--mlk-yla.com` yet.
- Do not commit secrets or paste credentials into repo files.
- Do not add service-role keys to browser-visible env vars.

## Vercel project shape

Recommended first setup:

- Framework preset: React Router / Vite if Vercel detects it automatically
- Root directory: `apps/app`
- Install command: `npm install`
- Build command: `npm run build`
- Output: managed by React Router + Vercel preset

The app uses the official Vercel React Router preset in `react-router.config.ts`:

```ts
import { vercelPreset } from "@vercel/react-router/vite";
```

Required environment variables in Vercel:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Supabase Auth settings

In Supabase Auth URL configuration, add the Vercel deployment URL(s) as allowed redirect URLs. The app uses this callback pattern:

```text
https://<vercel-deployment>/auth/callback
```

Local development callback:

```text
http://localhost:5173/auth/callback
```

## Manual setup boundary

Mads enters Supabase/Vercel credentials and env vars himself. ANANKE can guide field-by-field and verify the deployed URL afterward, but should not request, type, store, or commit secrets.
