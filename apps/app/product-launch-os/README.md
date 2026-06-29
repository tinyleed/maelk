# Product Launch OS static cockpit v0

Repo-local static prototype for the first Mælk Product Launch OS surface.

## Scope

- Dependency-free HTML, CSS, JavaScript, and fake JSON only.
- Reads `product-launch-os.fake-data.json` with a relative `fetch()` from `index.html`.
- Shows launch readiness gates, blockers, AI review as advisory output, approval reason requirements, and audit timeline.
- Uses fake internal demo records only.

## Guardrails

- No root live-site files are changed by this cockpit.
- No package manager, framework, deploy, credential, payment, DNS, hosting, or live integration behavior is introduced.
- No external sends, live syncs, pricing/compliance/go-live mutations, or production data writes exist here.
- AI review text is advisory only; human approvals require a reason before fake completion is shown.

## Local preview

From the repository root, serve the static files with any local-only server, for example:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/apps/app/product-launch-os/`.
