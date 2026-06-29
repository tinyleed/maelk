---
description: UI conventions for Mælk's future component system and current marketing prototype.
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

When the app exists, use shared components from `packages/react` before hand-rolled markup.

Rules:

- variants over ad-hoc colors;
- shadows/depth over hard borders when appropriate;
- tabular numbers for dynamic metrics;
- minimum comfortable hit areas;
- scoped transitions, not broad accidental animation;
- reduced-motion support for decorative motion;
- visual polish must not hide unclear product logic.

## Current static site caution

`index.html` and `design-prototype-v0.html` are live/static prototype files. Keep them working while architecture scaffolding is added.
