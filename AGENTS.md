# Mælk Agent Guide

## Environment

- This project is **Mælk**: a commerce/business operating system with shop-floor/manufacturing execution out of scope.
- Current live surface is a static GitHub Pages prototype at the repository root (`index.html`) for `mælk.com` / `xn--mlk-yla.com`.
- The first product wedge is **Product Launch OS**.

## Source of truth

1. Code and future database schema.
2. Architecture and product docs in `architecture/` and `docs/`.
3. `.claude/rules/` as agent-readable technical index.
4. `.claude/scratch/` as temporary task state only.

If a rule conflicts with code/schema, the code wins. Fix the rule instead of spreading stale instructions.

## Core principles

- **Original Mælk architecture:** build Mælk's own commerce operating model, not a fork of another product.
- **Shop-floor boundary:** ERP/business OS ambition is allowed; shop-floor execution is not.
- **Multi-tenant and audit-first:** `companyId`, permissions, approval reasons, and audit events are core architecture, not later polish.
- **Readiness as control layer:** readiness is how complexity is shown and governed; it is not the whole product.
- **AI drafts, humans approve:** AI may search, summarize, compare, draft, and prepare actions. Humans approve pricing, compliance, publishing, external sends, inventory/accounting changes, and go-live.
- **Existing patterns first:** before adding conventions, check `architecture/` and `.claude/rules/`.

## Hard shop-floor boundary

Do not add:

- shop-floor tablet flows;
- work centers;
- labor/machine time tracking;
- production routing execution;
- operator station controls;
- scrap/rework per operation;
- manufacturing execution event streams.

Translate manufacturing-adjacent needs into commerce language: products, SKUs, suppliers, inventory, channels, launch gates, approvals.

## Planned architecture shape

```text
apps/
  app/
  docs/
  marketing/
  academy/        # later

packages/
  auth/
  database/
  jobs/
  react/
  form/
  documents/
  kv/
  locale/
  env/
  config/
  utils/
  ai/
  approvals/
  readiness/
  integrations/
```

Initial modules:

```text
companies users products suppliers purchasing inventory sales pricing compliance channels approvals readiness activity ai-review integrations
```

## Agent loop

Mælk uses a supervised build loop:

```text
ANANKE → task brief → maelk-builder → harness → Themis review → ANANKE acceptance
```

- `maelk-builder` implements scoped tasks only.
- `themis` reviews meaningful worker output before acceptance.
- Kanban is the durable task queue/audit trail.
- `./scripts/maelk-harness-check.sh` is the default guardrail command.
- See `architecture/agent-loop-governance-v0.md` and `.claude/rules/agent-loop-guardrails.md`.

## Work style

- Plan non-trivial changes before editing.
- Keep changes small and verifiable.
- For architecture work, update the relevant `.claude/rules` file in the same change.
- For user-facing behavior, run a real verification: test, lint/build, browser check, or explicit manual proof.
- Do not declare completion without fresh verification output.
- Do not edit secrets, credentials, payment details, or production data.

## Current static site caution

The root `index.html`, `design-prototype-v0.html`, `CNAME`, and `.nojekyll` keep the current GitHub Pages site alive. Do not move or delete them when adding architecture scaffolding unless the hosting strategy is explicitly changed.
