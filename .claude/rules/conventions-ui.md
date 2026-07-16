---
description: UI conventions for Mælk's shadcn/ui component system and current app shell.
paths: ["apps/**/app/components/**", "apps/**/app/modules/**/ui/**", "packages/react/**", "index.html", "design-prototype-v0.html"]
---

# UI Conventions

Mælk's UI should feel warm, calm, premium, and operational — not generic dark SaaS.

## Brand constraints

- lowercase `mælk` wordmark;
- `æ` is the signature asset;
- cream/cocoa/caramel palette;
- Milkglass controls are signature details, not decoration everywhere;
- motion means readiness, progress, transformation, or gated action.

## Component discipline

Use shadcn/ui-style components under `apps/app/app/components/ui/` before hand-rolled markup. Preserve Mælk tokens and brand classes; do not drop in stock shadcn styling that erases the cream/cocoa/caramel language.

Rules:

- variants over ad-hoc colors;
- shadows/depth over hard borders when appropriate;
- tabular numbers for dynamic metrics;
- minimum comfortable hit areas;
- scoped transitions, not broad accidental animation;
- reduced-motion support for decorative motion;
- visual polish must not hide unclear product logic.

## Runtime caution

The React Router app is an SPA served by the local Express runtime after build. Route and component changes should work both through Vite dev and through the built `apps/app/build/client` fallback served by `apps/api`.
