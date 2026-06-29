---
description: What Mælk is, the intended apps/packages, shop-floor boundary, and where architecture lives.
paths: ["apps/**", "packages/**", "architecture/**", "docs/**"]
---

# Mælk Project Overview

Mælk is a commerce/business operating system with shop-floor/manufacturing execution out of scope.

Current repository state:

- root static GitHub Pages prototype serves `mælk.com`;
- architecture docs live in `architecture/`;
- `.claude/rules` describes the intended technical conventions for future app work;
- app/package monorepo directories are planned, not fully implemented yet.

## Product direction

Mælk may include ERP-like commerce surfaces:

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

The first wedge is **Product Launch OS**.

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
apps/docs       # docs/product manual
apps/marketing  # future marketing site; current root static page remains live for now
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
companies users products suppliers purchasing inventory sales pricing compliance channels approvals readiness activity ai-review integrations
```
