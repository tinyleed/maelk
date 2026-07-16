# React Router SPA + Express + Supabase setup notes

Mælk v0 uses React Router v8 Framework in SPA mode, a same-origin Node.js/Express runtime, and Supabase Auth/Postgres as the canonical auth/data target.

## Current boundary

- Hosting/deployment is undecided and human-gated.
- The current runnable shape is local: build the SPA, then run Express to serve `apps/app/build/client` and `/api/*` from one origin.
- Do not wire `mælk.com` / `xn--mlk-yla.com` yet.
- Do not create hosting projects, deploy, commit secrets, or paste credentials into repo files.
- Do not add service-role keys to browser-visible env vars.

## Local runtime shape

Root commands:

```bash
npm install
npm run dev
npm run build
npm start
```

`npm run dev` starts:

- `apps/api` on `http://localhost:3001`;
- `apps/app` through Vite/React Router, with `/api` proxied to the Express service.

`npm run build` builds the web app first, then compiles the API. `npm start` launches Express, which serves:

- `GET /api/health` as JSON;
- unknown `/api/*` routes as JSON `404`;
- static assets from `apps/app/build/client`;
- `index.html` for non-API client routes.

## Supabase Auth settings

Required public browser values:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Local development callback:

```text
http://localhost:5173/auth/callback
```

When a future hosting target is approved, add that approved origin's `/auth/callback` URL in Supabase Auth settings. Mads enters credentials and env vars himself. ANANKE can guide field-by-field and verify the app afterward, but should not request, type, store, or commit secrets.
