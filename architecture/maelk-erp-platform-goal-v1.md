# Mælk ERP platform goal v1

Status: canonical current goal
Date: 2026-07-15
Task: `t_f58ec4c8`
Supersedes: `architecture/maelk-operating-system-architecture-v0.md` as the active platform goal while preserving it as historical context.

## Decision

Mælk is a Denmark-first, open-source, AI-native ERP platform for commerce operations.

The product ambition is no longer a narrow Product Launch OS wedge. Mælk should become a serious operating core for Danish commerce companies first, then expand through explicit localization packs instead of one-off country forks.

## Current platform definition

Mælk is:

- **Denmark-first:** Danish accounting, VAT, company, language, currency, and operational norms lead the platform design.
- **Open-source by default:** the repository stays public and contributor-friendly; the final product packaging model remains undecided.
- **AI-native:** AI can draft, compare, summarize, flag missing data, prepare actions, and support operator review, but it does not approve high-impact outcomes.
- **ERP-grade:** the first serious version must include a native double-entry accounting core rather than treating accounting as a later external bolt-on.
- **Commerce-operations focused:** product data, suppliers, purchasing, inventory, sales, offers, orders, invoicing-adjacent flows, pricing, compliance, approvals, activity, readiness, and integrations belong in one coherent system.
- **Multi-tenant and multi-company:** one shared core must support multiple companies and multiple operating segments through permissions, configuration, localization, and tiers.

## Current runnable stack decision

The current implementation stack is React Router v8 Framework in SPA mode, TypeScript, Tailwind v4, shadcn/ui, a same-origin Node.js/Express API runtime, a Cloudflare Worker adapter for the non-production target candidate, and Supabase Auth/Postgres as the canonical auth/data target.

The Express runtime is the local single-service shape for now: it serves `apps/app/build/client`, exposes `/api/*`, and returns the SPA `index.html` for non-API client routes. Cloudflare Worker + Static Assets is the approved non-production hosting target candidate, but deployment, DNS, secrets, Hyperdrive bindings, hosted migrations, and production readiness remain human-gated; do not use this document to create hosting projects, deploy, wire DNS, or claim production readiness.

## Non-decision: full OSS vs open-core

The repo is currently public under its existing license, but the long-term product/commercial packaging model is not decided in this document.

Do not use this goal doc to:

- change the license;
- promise full-OSS forever;
- introduce enterprise-only code paths;
- create pricing, packaging, or hosted-service commitments.

Treat **full open source vs open-core** as an explicit future product/governance decision.

## Native accounting requirement

Native double-entry accounting is mandatory from the first serious version of the ERP platform.

This means future architecture must account for:

- chart of accounts;
- journal entries and posting controls;
- ledger integrity;
- VAT/reporting localization for Denmark first;
- audit trails and approval reasons for accounting-impacting actions;
- clear boundaries between draft operational documents and posted accounting records.

This document does **not** implement finance schema or production accounting behavior. It does **not** claim legal, tax, bookkeeping, or accounting production readiness.

## Shared core, segments, and tiers

Mælk should not become separate systems for separate business types.

Use one shared core for:

- companies, users, roles, permissions, and memberships;
- accounting and audit foundations;
- product and catalogue data;
- customers, suppliers, purchasing, sales, inventory, and documents;
- approvals, activity, readiness, AI review, and integrations.

Expose segment differences through:

- feature tiers;
- permissions and policies;
- company configuration;
- localization packs;
- optional modules;
- UI surfaces tailored to role and company maturity.

## Denmark-first localization-pack architecture

Denmark is the first localization target, not a hardcoded ceiling.

Design future country support as localization packs for:

- language and terminology;
- currency and number/date formatting;
- VAT/tax rules and reporting surfaces;
- invoicing/document requirements;
- accounting defaults;
- compliance evidence and local operational practices;
- integration adapters where local systems differ.

Do not generalize prematurely by watering down the Danish baseline. Build Denmark well first, then extract localization seams deliberately.

## Product Launch OS status

Product Launch OS remains valuable as an existing fake-data-backed module/prototype and safety harness surface.

It is now classified as:

- an existing prototype;
- a local fake-data demo of readiness, approvals, AI review, and audit patterns;
- a historical proof of the operating-loop idea;
- not the current platform goal;
- not the default next build lane.

Keep its safety validation while the prototype exists, but do not let Product Launch OS wording define Mælk's platform ambition.

## Shop-floor / MES exclusion

Mælk may be ERP-like, but it must not become a manufacturing execution system.

Do not add:

- shop-floor tablet flows;
- work centers;
- labor or machine time tracking;
- production routing execution;
- operator station controls;
- scrap/rework per operation;
- manufacturing execution event streams.

Manufacturing-adjacent needs must be translated into commerce operations such as products, SKUs, suppliers, purchasing, inventory, channels, launch gates, accounting controls, approvals, and audit events.

## AI and human approval boundary

AI may:

- draft product, supplier, accounting-support, and compliance summaries;
- flag missing data and inconsistent records;
- compare records against rules or templates;
- prepare actions for human review;
- explain risk and readiness.

AI may not directly:

- approve compliance;
- post accounting entries;
- change prices or margins;
- publish channels;
- send external supplier/customer messages;
- mutate stock or accounting state;
- approve go-live, filing, payment, or release decisions.

High-impact actions require a human decision, reason note, and audit event.

## Baseline recorded for this reframe

- Live main baseline before this branch: `53c0b21`.
- Open Dependabot PR at the time of this reframe: `#8` — `chore(deps): bump the github-actions group with 2 updates`, head `dependabot/github_actions/github-actions-e873aee6fb`, state `OPEN`.

## Immediate documentation consequences

- `architecture/maelk-operating-system-architecture-v0.md` and `architecture/product-launch-os-first-implementation-slice-v0.md` are historical inputs, not the current platform goal.
- `AGENTS.md`, `.claude/rules/`, app docs, contributor docs, and harness checks should point builders to this file as the current direction.
- The harness must require this goal doc, retain the historical v0 architecture files, and keep Product Launch OS prototype validation only as prototype safety validation.
