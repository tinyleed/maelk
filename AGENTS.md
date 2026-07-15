# Mælk Agent Guide

## Environment

- This project is **Mælk**: a Denmark-first, open-source, AI-native ERP platform for commerce operations with shop-floor/manufacturing execution out of scope.
- Mælk v0 standard stack is **React Router v8 Framework in SPA mode + Node.js/Express same-origin API + TypeScript + Tailwind v4 + shadcn/ui**, with **Supabase Auth/Postgres** as canonical auth and data layer.
- Hosting/deployment is undecided. The current runnable shape is local single-service Express serving the SPA build; do not change DNS/custom-domain settings, create hosting projects, deploy, or mutate external accounts without explicit approval.
- Current canonical goal: `architecture/maelk-erp-platform-goal-v1.md`.
- Product Launch OS is an existing fake-data-backed prototype/module, not the current platform goal or default next build lane.

## Source of truth

1. Code and future database schema.
2. Architecture and product docs in `architecture/` and `docs/`.
3. `.claude/rules/` as agent-readable technical index.
4. `.claude/scratch/` as temporary task state only.

If a rule conflicts with code/schema, the code wins. Fix the rule instead of spreading stale instructions.

## Core principles

- **Original Mælk architecture:** build Mælk's own ERP/commerce operating model, not a fork of another product.
- **Shop-floor boundary:** ERP/business OS ambition is allowed; shop-floor execution is not.
- **Multi-tenant and audit-first:** `companyId`, permissions, approval reasons, and audit events are core architecture, not later polish.
- **Native accounting requirement:** double-entry accounting is mandatory from the first serious platform version, but do not add finance schema/code or claim production accounting readiness without a separate approved task.
- **Denmark-first localization:** Denmark leads the first localization pack; future country support should be explicit localization architecture, not hardcoded forks.
- **Shared core and tiers:** one multi-tenant/multi-company core should support segments through tiers, permissions, configuration, and optional modules.
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
  api/          # current same-origin Express runtime/API
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
  accounting/     # planned; no production accounting implementation yet
```

Initial modules:

```text
companies users accounting products suppliers purchasing inventory sales pricing compliance channels approvals readiness activity ai-review integrations localization
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

## Retired root static site

The old repo-root GitHub Pages prototype has been removed. Do not re-add `index.html`, `design-prototype-v0.html`, `CNAME`, `DNS.md`, or `.nojekyll` unless ANANKE/Mads explicitly reopens the hosting strategy.

Keep product prototypes under their app paths, e.g. `apps/app/product-launch-os/`, until a new hosting target is selected.
