---
description: What Mælk is, the intended apps/packages, shop-floor boundary, and where architecture lives.
paths: ["apps/**", "packages/**", "architecture/**", "docs/**"]
---

# Mælk Project Overview

Mælk is a Denmark-first, open-source, AI-native ERP platform for commerce operations with shop-floor/manufacturing execution out of scope.

Canonical current goal: `architecture/maelk-erp-platform-goal-v1.md`.

Current repository state:

- the old root static GitHub Pages prototype has been retired; Cloudflare Worker + Static Assets is the approved non-production target candidate, while `mælk.com`/custom-domain, secrets, deployment, hosted migrations, and production actions stay human-gated;
- architecture docs live in `architecture/`;
- `.claude/rules` describes the intended technical conventions for future app work;
- React Router v8 SPA + same-origin Express API scaffolding exists, with a credential-free Cloudflare Worker adapter for the non-production target candidate, but the platform is still early and not production-ready.

## Product direction

Mælk should grow into one shared multi-tenant/multi-company ERP core for commerce operations:

- native double-entry accounting from the first serious version;
- Danish localization first, then localization packs for future countries;
- company, user, role, permission, and tier configuration;
- Product/PIM;
- supplier and sourcing;
- purchasing;
- inventory and availability;
- sales/offers/orders/campaigns;
- pricing and unit economics;
- compliance and quality review;
- channel readiness/publishing;
- approvals and audit;
- AI review and constrained action tools;
- implementation/readiness hub;
- docs/training later.

Product Launch OS remains an existing fake-data-backed prototype/module. It is useful as a safety-validation surface, but it is not the current platform goal or default next build lane.

## Shop-floor boundary

Never add shop-floor/manufacturing execution:

```text
work centers
operator station controls
machine/labor time tracking
production routing execution
scrap/rework per operation
manufacturing execution events
```

## Planned apps

```text
apps/app        # core Mælk app
apps/api        # same-origin Express API/runtime serving the SPA build
apps/docs       # docs/product manual
apps/marketing  # future marketing site; root GitHub Pages prototype is retired
apps/academy    # later training/onboarding app
```

## Planned packages

```text
packages/auth
packages/database
packages/jobs
packages/react
packages/form
packages/documents
packages/kv
packages/locale
packages/env
packages/config
packages/utils
packages/ai
packages/approvals
packages/readiness
packages/integrations
packages/accounting       # planned; no production accounting implementation yet
packages/localization     # planned localization-pack seams
```

## Core module pattern

```text
apps/app/app/modules/{module}/
├── {module}.models.ts
├── {module}.service.ts
├── {module}.server.ts
├── index.ts
└── ui/
```

Initial modules:

```text
companies users accounting products suppliers purchasing inventory sales pricing compliance channels approvals readiness activity ai-review integrations localization
```
