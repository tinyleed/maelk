# apps/api

Same-origin Node.js/Express runtime for the Mælk React Router SPA.

## Responsibilities

- Export a testable Express app from `src/app.ts`.
- Serve `GET /api/health` as deterministic JSON.
- Return JSON `404` responses for unknown `/api/*` routes.
- Serve static assets from `apps/app/build/client` after `npm run build`.
- Return the SPA `index.html` for non-API GET routes such as `/`, `/app`, `/login`, and arbitrary client-side paths.

## Boundaries

This package does not add database schema, service-role keys, live Supabase management calls, deployment behavior, DNS changes, production data writes, or shop-floor/manufacturing execution scope.
