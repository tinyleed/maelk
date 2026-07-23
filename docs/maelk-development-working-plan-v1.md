# Mælk development working plan v1

Status: active planning baseline; execution remains phase- and approval-gated
Created: 2026-07-22
Baseline: `main` at `d3adb4089c52286cb73ff074bd11e42e83e8fdf4`
Canonical product goal: [`architecture/maelk-erp-platform-goal-v1.md`](../architecture/maelk-erp-platform-goal-v1.md)

## Purpose

This plan turns the current Mælk product direction and the verified development lessons from Teknium/Nous Research's Hermes Agent work into a low-overhead execution system.

It deliberately separates two tracks:

1. **Delivery system** — how humans and agents plan, implement, verify, review, and land changes safely.
2. **Product roadmap** — which ERP capabilities Mælk should prove, in dependency order.

The plan is a control artifact, not blanket authorization. It does not authorize merges, releases, deployments, secrets, provider resources, live users, email, DNS, production data, accounting production claims, or external sends.

## North star and hard boundaries

Mælk is a Denmark-first, open-source, AI-native ERP platform for commerce operations.

The first serious platform version must preserve these invariants:

- one shared multi-tenant and multi-company core;
- server-owned authentication and authorization boundaries;
- native deterministic double-entry accounting;
- Denmark as the first explicit localization pack;
- human reasons and audit events for high-impact decisions;
- AI may draft, compare, summarize, flag, and prepare, but may not approve or execute high-impact outcomes;
- no shop-floor or manufacturing execution scope;
- no production-readiness, legal, tax, or accounting claims without separate evidence and approval;
- Product Launch OS remains a local fake-data-backed prototype/module, not the default product lane.

## Current verified baseline

As of the plan baseline:

- `main` includes the React Router v8 SPA, same-origin Express/Cloudflare Worker runtime, Supabase server-owned auth/session boundary, tenant schema/RLS, hosted ACL proof, and local CI security rails.
- GitHub PR #14 is merged. Its credential-free Live Auth Proof Slice A runtime contract is now on `main`.
- GitHub issue #13 remains open. Its Slice A checklist is stale relative to the merged implementation; managed connectivity, deployment, real email OTP, two-user tenant proof, and cleanup remain unproven and human-gated.
- No pull request is currently open.
- No Worker deployment, Hyperdrive resource, live OTP test, branded DNS cutover, production Supabase project, or production data path is accepted as complete.
- A clean install currently reports zero production dependency advisories, but three high-severity development-toolchain advisories through `wrangler → miniflare → sharp`. Current upstream `miniflare` still resolves a vulnerable `sharp` range, while `npm audit fix --force` suggests an unsafe Wrangler downgrade. Track and re-evaluate this explicitly; do not apply the forced fix blindly.
- A merged feature worktree remains locally, and `.worktrees/` is not ignored. This must be reconciled through the worktree-lifecycle slice rather than deleted by assumption.
- The repository has one stable required GitHub status, `Repository harness`, with strict up-to-date branches. Independent Themis evidence is not yet a GitHub-enforced exact-head gate.

## Operating principles learned from Hermes Agent

Mælk adopts the principles, not the upstream repository's volume.

### 1. `AGENTS.md` is an intent and judgment layer

Keep durable product invariants, contribution taste, forbidden directions, and decision ladders in `AGENTS.md`. Keep volatile commands, dependency versions, and file inventories in canonical scripts or linked documents.

### 2. Verify the premise before fixing

For every bug or security change:

1. reproduce on current `main`;
2. identify the exact runtime path and intended behavior;
3. prove the change affects that path;
4. cover the bug class, not only one call site;
5. verify with behavior-level evidence.

### 3. Use the smallest permanent footprint

For new Mælk capability, prefer:

```text
extend an existing domain/module
→ add a focused feature in an existing app/package
→ create a shared package only after multiple real consumers
→ add an integration adapter
→ add an external plugin/integration
→ expand platform core only as a last resort
```

### 4. One writer, one worktree, one frozen review target

Parallel agents may research or review independently. Only one agent may mutate a branch/worktree at a time. Review evidence is valid only while the reviewed head stays frozen.

### 5. Local and CI proof must share a canonical runner

The local command and GitHub gate must exercise the same contract. Fast feedback may be a subset, but a full acceptance run must be explicit and reproducible.

### 6. Test behavior and invariants, not source snapshots

- Policy lint may prohibit explicit public wording, files, or unsafe configuration.
- Data tests should assert relationships and invariants.
- Runtime tests should execute behavior.
- Source-text searches must not be presented as proof that runtime behavior works.

### 7. Humans own irreversible and external decisions

ANANKE may prepare evidence and declare technical acceptance. Mads separately approves merge, release, deployment, provider resources, credentials, users/email, DNS, production, accounting activation, and external sends.

## Standard delivery loop

```text
GitHub issue or approved task
    ↓
ANANKE task contract and session todo
    ↓
parallel visible read-only research/review where useful
    ↓
one single-writer builder in an isolated worktree
    ↓
red → green behavior/invariant tests
    ↓
canonical local runner + risk-based browser/runtime proof
    ↓
freeze base SHA and head SHA
    ↓
PR with evidence, risk, rollback, and approval state
    ↓
required GitHub CI on the exact head
    ↓
visible read-only Themis review on the same exact head
    ↓
ANANKE verifies head = reviewed SHA = successful CI SHA
    ↓
Mads decides merge
    ↓
post-merge main CI, issue/status reconciliation, branch/worktree cleanup
```

Any push after Themis review invalidates that review.

### Active and durable agent lanes

- `todo` is the short-lived session plan.
- Visible `delegate_task` subagents are the default active implementation/review lane when delegation adds real value.
- Kanban is durable scope, dependency, audit, gate, and recovery state — not a hidden default execution lane.
- Do not pre-create an assignee-bound Kanban review card merely to hold a visible review. Persist the review evidence after the visible child returns.
- The parent verifies all worker claims from files, Git, GitHub, CI, browser/runtime evidence, or other primary state.

## Roadmap overview

| Order | Milestone | Primary outcome | Approval gate |
|---:|---|---|---|
| 0 | Adopt this working plan | One dependency-ordered control artifact | Plan review only |
| 1 | Delivery Contract v1 | Exact worktree/SHA/human-gate contract | Mads before GitHub settings |
| 2 | Canonical Harness v1 | Local/CI parity and deterministic evidence | Mads before branch-setting changes |
| 3 | Dogfood the delivery loop | One small code PR proves the controls | Mads merge |
| 4 | Finish Live Auth Proof v0 | Real non-production hosted auth/tenant proof | Human Gate A and Human Gate B |
| 5 | Accounting + Denmark discovery | Reviewed contracts and test vectors, no implementation claims | Mads approves architecture baseline |
| 6 | Company/accounting context v0 | Company, capabilities, fiscal periods, chart foundation | Mads approves schema/capability slices |
| 7 | Accounting kernel v0 | Tenant-safe deterministic ledger core | Mads approves posting slices |
| 8 | Document and posting bridge | Commerce documents cannot write ledger state directly | Per-slice review |
| 9 | Master data foundation | Parties, products, SKUs, terms, and historical references | Per-slice review |
| 10 | First ERP vertical proof | Default: purchasing-to-ledger without payment | Mads confirms the first vertical |
| 11 | Inventory subledger | Movement-based stock with ledger reconciliation | Mads approves costing method |
| 12 | Sales and receivables | Sales/invoice-to-ledger without external sending/payment | Per-slice gates |
| 13 | Denmark localization and close | Specialist-reviewed Danish draft reporting/period controls | Specialist + Mads gate |
| 14 | Readiness, integrations, and AI | Bounded control layer over authoritative domains | Per-tool/external gate |
| 15 | Release and OSS maturity | Reproducible milestone releases and contributor rails | Mads release decision |

---

# Track A — Delivery system

## Milestone 1 — Delivery Contract v1

Goal: make the documented agent/review process precise before adding automation.

### PR A1 — Governance and exact-head contract

Keep this as one focused documentation/policy PR.

Planned scope:

- ignore `.worktrees/`;
- document worktree create/owner/freeze/prune lifecycle;
- add a concise Mælk contribution rubric to `AGENTS.md`;
- add the Mælk footprint ladder and “verify the premise” rule;
- expand the worker task brief with issue, exact base SHA, branch, worktree, single writer, risk class, expected files, required checks, browser routes, stop conditions, and side-effect boundaries;
- expand the Themis checklist with exact base/head, CI run, review timestamp, invalidation after push, and remaining human gates;
- expand the PR template with exact head, reviewed SHA, required CI SHA/run, risk, rollback, browser proof when relevant, and Mads approval state;
- define technical acceptance, human merge approval, and release/deploy approval as separate decisions;
- replace vague private security reporting with a concrete private path such as GitHub Private Vulnerability Reporting or an approved security address.

Acceptance:

- no product behavior changes;
- no external GitHub settings changed in the PR;
- a sample task brief and sample PR evidence block can be completed without ambiguity;
- a reviewer can determine whether the review and CI apply to the current PR head;
- worktree cleanup never deletes an active or unmerged lane by assumption;
- Mads' merge/release/deploy authority is explicit.

### GitHub setting decision after PR A1

Evaluate separately after the documented loop is proven:

- `enforce_admins=true`, or a documented break-glass route with mandatory reason/audit;
- squash as the normal merge strategy;
- delete merged head branches automatically;
- conversation resolution when GitHub review comments become a normal gate.

Do not require one GitHub approval until a genuinely independent human reviewer or trusted review integration exists. A Themis paragraph in a PR body is evidence, not a GitHub approval object.

## Milestone 2 — Canonical Harness v1

Goal: make local and GitHub acceptance describe one executable contract.

### PR A2 — Runner and test-contract cleanup

Planned scope:

- provide explicit `fast` and `full` modes through one canonical runner;
- make CI call the canonical full mode rather than duplicating acceptance logic in YAML;
- run tests in a deliberate test environment that cannot silently use real cloud credentials or production endpoints;
- keep policy lints, data invariants, and runtime behavior checks visibly separate;
- retain legitimate forbidden-content/public-framing checks;
- replace brittle required-phrase or source-symbol checks with structured contracts or executable behavior tests where appropriate;
- keep the existing JSON relationship/approval/audit invariants;
- document which changes require browser/runtime smoke and which do not.

Suggested contract:

```bash
./scripts/maelk-harness-check.sh --fast
./scripts/maelk-harness-check.sh --full
```

`--fast` should cover repository policy, unit/invariant tests, typecheck, lint, build, and diff hygiene.
`--full` should add Worker preview and local auth/tenant security integration.

Acceptance:

- the same full command succeeds locally and in CI;
- full mode leaves no local Supabase/preview process running;
- no secret, OTP, cookie, token, connection string, or local generated key is printed;
- changed behavior is covered by executable tests;
- docs-only changes are not forced through irrelevant browser smoke;
- auth, navigation, redirects, SPA/API integration, and visual changes declare targeted smoke routes.

### PR A3 — CI hygiene

Keep CI simple while the project is small.

Planned scope:

- add PR concurrency and cancellation of stale runs;
- add an overall job timeout;
- retain least-privilege workflow permissions;
- evaluate immutable action SHA pins and record the chosen policy;
- open/maintain a bounded task for the current dev-only `wrangler → miniflare → sharp` advisories, monitor the upstream compatible fix, and retain a separate zero-advisory production dependency check;
- add low-noise npm dependency updates and security updates only after grouping/noise policy is explicit;
- retain one stable aggregate required status.

Do not add path-aware matrices, live CI comment bots, timing dashboards, contributor mapping, custom attestations, or autofix bots yet.

## Milestone 3 — Dogfood gate

Use the next small, real code/harness repair to prove:

- branch/worktree isolation;
- complete task brief;
- one writer;
- red → green test evidence;
- canonical local full run where relevant;
- PR evidence block;
- exact-head CI;
- exact-head Themis review;
- separate Mads merge decision;
- post-merge branch/worktree/status cleanup.

After the dogfood PR, run a short retrospective. Automate only a step that repeatedly failed or cost material time.

---

# Track B — Product roadmap

## Milestone 4 — Finish Live Auth Proof v0

Tracking source: GitHub issue #13.

### Slice B1 — Reconcile the tracking issue

Before more implementation:

- mark merged credential-free Slice A items accurately;
- link PR #14 and its final reviewed head;
- keep Human Gate A and Human Gate B unchecked;
- preserve the explicit rollback and no-secret constraints.

This is tracker reconciliation, not permission to start cloud work.

### Human Gate A — Managed connectivity and temporary deployment

Prepare a redacted execution packet before requesting approval:

- exact temporary Worker/resource names;
- dedicated least-privilege runtime role/grant plan;
- required secret and binding names, never values;
- direct endpoint versus Supavisor/Hyperdrive evidence plan;
- cost/blast-radius statement;
- commands/actions to execute;
- log-redaction checks;
- rollback and cleanup commands/resource identifiers.

After explicit approval, prove only the temporary non-production path:

- Worker-to-`maelk-dev` private-session connectivity;
- `/api/health`, API 404 behavior, static assets, SPA fallback, and sanitized errors over HTTPS;
- fail-closed behavior for missing configuration;
- no credential or connection-string disclosure.

Stop and review before creating users or sending email.

### Human Gate B — Live auth and tenant isolation

Prepare a second approval packet identifying:

- exactly two disposable dev-only test identities;
- email/OTP handling and cleanup owner;
- bounded abuse-control/Origin/CSRF proof;
- evidence capture that redacts cookies, OTPs, tokens, and personal data;
- user/session/fixture cleanup.

Then prove:

- invite-only OTP request and exchange;
- opaque `__Host-` cookie behavior over HTTPS;
- `/api/me`, refresh/rotation, concurrent replay rejection, logout, and expiry;
- provider-error sanitization;
- tenant A cannot read or mutate tenant B through a user-scoped RLS-backed domain path;
- the private-session role is not reused for tenant-domain access.

Exit gate:

- exact-head CI and Themis pass;
- hosted evidence is redacted and reproducible;
- temporary users/sessions/fixtures/resources are cleaned up or explicitly retained with owner and purpose;
- issue #13 reflects actual completion and remaining caveats.

## Milestone 5 — Accounting and Denmark discovery

Goal: define the trust kernel before adding broad ERP UI or migrations.

### Slice B2 — Primary-source research brief

Research only from current authoritative sources and clearly separate legal requirements from product choices. Cover at minimum:

- Danish bookkeeping and audit-trail requirements;
- VAT concepts and reporting boundaries;
- invoice/document requirements;
- digital bookkeeping implications;
- e-invoicing/NemHandel/Peppol relevance;
- retention, correction, and period-control expectations;
- what requires qualified accountant/legal review before production claims.

Outputs:

- source map with date and confidence;
- unresolved legal/accounting questions;
- explicit “not production advice” boundary;
- no schema or code by inference alone.

### Slice B3 — Accounting kernel contract

Define and independently review:

- chart of accounts and account types;
- journal, journal entry, and balanced lines;
- draft versus posted state;
- immutable posted records with reversal/correction flows;
- period controls;
- source document traceability;
- deterministic decimal/money handling;
- idempotent posting commands;
- tenant/company isolation;
- human approval and reason requirements;
- AI draft-only boundary;
- audit events and actor identity.

Produce architecture decisions and executable test vectors before database migration.

### Slice B4 — Denmark localization pack v0 contract

Define a narrow first localization contract for:

- language and terminology;
- currency/number/date formatting;
- VAT code representation and validation boundaries;
- document/accounting defaults;
- invoice/reporting metadata;
- explicit extension seams for later countries.

Do not dilute the Danish baseline into a premature “global” abstraction.

Architecture exit gate:

- Themis technical review passes;
- uncertainties remain visible;
- no production/legal readiness is claimed;
- Mads approves the accounting/localization baseline and the first vertical proof direction.

## Milestone 6 — Company and accounting context v0

Goal: make the business/accounting authority model explicit before a ledger schema exists.

### Slice B5 — Company and accounting context

- distinguish tenant, company/legal entity, and accounting entity;
- assign base currency and Denmark localization-pack reference;
- make every future accounting row company-scoped;
- define how one user may hold different roles in different companies.

### Slice B6 — Accounting capabilities

Model separate capabilities for:

- draft;
- approve;
- post;
- reverse;
- lock or reopen a period;
- view reports.

Do not hide these behind one generic `admin` capability.

### Slice B7 — Fiscal years and periods

- open, closed, and locked states;
- explicit backdating and period-boundary policy;
- no automatic year-end logic yet;
- UI, API, and user-scoped database paths must all respect locks.

### Slice B8 — Chart-of-accounts foundation

- account types and active/inactive state;
- company scope and historical reference preservation;
- import/default templates remain reviewable drafts, not an asserted universal Danish standard;
- localization is configuration, not scattered country-specific branches.

Context exit gate:

- cross-tenant and cross-company negative tests pass;
- role/capability decisions are explicit;
- a locked period cannot be mutated through any accepted user path;
- Mads approves the authority model before implementation proceeds.

## Milestone 7 — Accounting kernel v0

Implement through small test-first PRs. Do not combine the entire ledger in one branch.

### Slice B9 — Money and posting primitives

- account, journal, entry, line, currency, period, and source-reference types;
- deterministic decimal/money strategy;
- no floating-point money arithmetic;
- no persistence or UI.

### Slice B10 — Journal draft and balance invariants

- mutable draft versus immutable posted state;
- debit equals credit for the relevant currency/posting unit;
- minimum valid lines, accounts, company consistency, and source reason;
- property/invariant tests, not source-text tests.

### Slice B11 — Tenant-safe persistence

- versioned schema/migration;
- company-scoped ownership;
- RLS and cross-tenant negative tests;
- unique/idempotency constraints;
- private/internal boundaries for privileged posting operations;
- rollback/repair plan appropriate for a forward migration.

### Slice B12 — Atomic post/reverse service

- explicit commands rather than arbitrary table mutation;
- permission, period, balance, and idempotency checks;
- journal number, posting, and audit event in one transaction;
- correction/reversal references the original entry;
- source traceability and human decision reason;
- AI cannot invoke posting without a human gate.

### Slice B13 — Ledger queries

- general ledger;
- account balance;
- trial balance;
- drill-back to source document and actor.

Kernel exit gate:

- unbalanced entries cannot be posted through any accepted path;
- concurrent/repeated requests cannot duplicate a posting;
- posted records cannot be silently updated or deleted;
- reversals preserve originals and traceability;
- trial balance sums correctly on reviewed fixtures;
- independent review passes on the exact head.

## Milestone 8 — Document engine and posting bridge

Goal: commerce modules produce controlled business documents and posting intents; they never write posted ledger state directly.

### Small slices

1. Generic document identity: company, status, source, version, number-sequence reference, and audit.
2. Versioned posting-intent contract from a source document to a deterministic posting proposal.
3. Approve/reject with mandatory human reason and atomic audit event.
4. Idempotent document-to-ledger bridge: one document version can post only once.
5. Change-after-posting policy through credit, reversal, or adjustment — never ordinary edit.

Exit gate:

- no commerce service has direct write access to posted ledger tables;
- every journal traces to document, version, actor, mapping/rule version, and approval;
- missing mappings, permissions, or period access fail closed.

## Milestone 9 — Master data foundation

Stabilize shared objects before purchase/sales flows:

- customer and supplier as roles on a party identity;
- appropriately versioned addresses/contact data;
- product, variant/SKU, unit, and active/inactive state;
- currency, payment terms, and tax-treatment references;
- import/deduplication as reviewable drafts, never autonomous identity merges.

Product Launch OS may later consume these canonical objects, but must not define them.

Exit gate:

- all objects are company-scoped;
- inactive records cannot be selected for new transactions;
- merge/deactivation preserves historical document references;
- no country rule leaks around the localization boundary.

## Milestone 10 — First ERP vertical proof

The provisional default is **purchasing-to-ledger**, because it proves document, approval, variance, payable, and accounting boundaries without requiring customer communication or payment initiation. Mads confirms or changes this choice after Milestone 5.

This milestone deliberately stops before inventory implementation. A goods receipt is document evidence only: it does not create a stock movement, change on-hand quantity, value inventory, or write an inventory-ledger effect. Use non-stock/service or otherwise neutral fake fixtures until Milestone 11 introduces the append-only inventory contract.

### Recommended slices

1. purchase-order draft and approval;
2. immutable goods-receipt document event with no stock/on-hand effect;
3. supplier-invoice draft and match to order/receipt;
4. price/quantity variance review;
5. approved supplier invoice to posting intent;
6. credit-note/reversal flow;
7. role-centred operator read-back and audit trail.

The vertical should prove:

```text
one entity
→ one operator task
→ one blocker/next action
→ human decision with reason
→ deterministic domain transition
→ accounting draft/posting intent
→ audit trail
→ role-centred UI read-back
```

Exit gate:

- receipt, invoice, approval, and posting remain distinct states;
- variance requires explicit review;
- one supplier-invoice version cannot post twice;
- source documents and ledger effects remain traceable;
- no stock movement, on-hand projection, inventory valuation, or inventory-ledger write exists before Milestone 11;
- no supplier send, payment, public integration, or autonomous stock/accounting mutation occurs.

## Milestone 11 — Inventory subledger

Use append-only movements rather than direct `quantity on hand` mutation.

Small slices:

1. locations and stock-movement contract;
2. receipt, issue, transfer, and adjustment events;
3. on-hand projection from movements;
4. human-gated adjustment with reason;
5. inventory-to-ledger reconciliation;
6. one separately approved costing method.

Exit gate:

- all movements have source, company, actor, and reason;
- replay cannot duplicate a movement;
- inventory and relevant ledger accounts reconcile on fixtures;
- AI may flag anomalies but cannot create adjustments.

## Milestone 12 — Sales, invoicing, and receivables

Build after the document/ledger contracts have been proven by the first vertical.

Small slices:

1. sales order and price snapshot;
2. fulfilment/dispatch event without WMS integration;
3. customer-invoice draft;
4. invoice approval/issuance boundary;
5. invoice to receivable/ledger;
6. credit-note/refund accounting;
7. internal payment-registration/open-item matching draft.

Exit gate:

- price and tax basis are snapshotted with the document version;
- issued invoices are not editable as ordinary drafts;
- credits reference the original invoice;
- receivables and ledger reconcile on fixtures;
- no external invoice send, payment, filing, or real customer data without a separate gate.

## Milestone 13 — Denmark localization and financial close

Only after the core document and accounting paths are proven should Mælk attempt a coherent Danish end-to-end draft model.

Small slices:

- specialist-reviewed Danish tax/VAT codes and mappings;
- invoice/credit-note field validation;
- numbering and document-integrity rules;
- VAT report draft with drill-down;
- period-close checklist and lock/reopen governance;
- specialist-reviewed export/reporting format where required.

Exit gate:

- each report line traces to entries and source documents;
- golden fixtures are reviewed by a qualified Danish specialist;
- no automatic filing/submission;
- “production ready” remains blocked until legal, tax, accounting, security, and operational reviews all pass.

Explicit unknowns remain tracked rather than guessed: exact Danish bookkeeping/VAT/invoice/retention duties, required export formats, chart defaults, costing method, multi-currency/FX, cash/accrual edge cases, banking, e-invoicing/NemHandel/Peppol, payroll, fixed assets, consolidation, and hosted/open-core packaging.

## Milestone 14 — Readiness, integrations, and AI as a control layer

The existing Product Launch OS patterns become useful again here as cross-cutting control surfaces, not as the ERP kernel.

Progressive slices:

1. role-centred operator inbox;
2. approval queue with reason and audit;
3. readiness projections from authoritative domain state;
4. transactional outbox/integration jobs with retry and idempotency;
5. AI read-only explain/search;
6. structured AI draft proposals;
7. human-reviewed tool calls through narrow domain commands;
8. adversarial evals for hallucination, cross-tenant leakage, and forbidden actions.

Exit gate:

- an AI failure can create at most a rejected proposal — never a posting, payment, stock adjustment, filing, or external message;
- all tool calls are company-scoped, permission-checked, and audited;
- agents use domain APIs rather than general SQL access;
- cross-tenant adversarial tests, kill switch, and rollback are proven.

## Milestone 15 — Release and OSS maturity

Use small `v0.x` milestone releases only after a coherent proof is complete.

A release packet must contain:

- exact commit/tag;
- included issues/PRs;
- migration/rollback notes;
- verification and known limitations;
- security considerations;
- explicit non-production claims where applicable;
- human release approval.

Add OSS controls when the trigger exists:

- `CODE_OF_CONDUCT` before active community recruitment;
- `CODEOWNERS` when multiple genuine maintainers/component owners exist;
- contributor attribution automation when external contribution volume justifies it;
- unrelated-history checks when external branches become a real risk;
- path-aware CI only when the suite's cost or diagnosis justifies it.

---

# Risk and approval model

## Green — scoped agent execution allowed after task assignment

- read-only research and repository inspection;
- tests, lint, builds, dry runs, local disposable fixtures;
- documentation and code changes inside an approved branch/worktree;
- draft PR preparation when explicitly included in the task;
- no external/live effects.

## Yellow — explicit task-level approval

- dependencies;
- schema/migrations;
- auth/security boundary changes;
- accounting domain changes;
- GitHub branches/PRs/pushes when not already authorized in the task;
- non-production provider resources;
- hosted migrations and disposable test users;
- branch/repository settings.

## Red — Mads approval immediately before action

- merge, release, deploy, DNS, branded domains;
- secrets/credentials and production accounts;
- production data or irreversible migration;
- live user/customer/supplier email;
- pricing, compliance, accounting posting, payment, filing, stock mutation, go-live;
- public posts/messages and recurring autonomous jobs.

# Definition of Done for a meaningful slice

A slice is not done until:

- issue/task scope and non-goals are explicit;
- exact base, branch, worktree, writer, and head are known;
- changed files match scope;
- relevant red → green tests exist;
- canonical local verification passed;
- browser/runtime evidence exists when the risk class requires it;
- PR records evidence, risk, rollback, and human gates;
- required CI passed on the current head;
- independent review applies to that same head;
- no secrets or unauthorized external effects occurred;
- Mads made any required merge/release/external decision;
- post-merge main CI and final repository state were read back;
- tracker and current project-status surfaces were reconciled;
- merged branches/worktrees were cleaned only after ownership and retention checks.

# Anti-overengineering rules

Do not add yet:

- a universal plugin system;
- broad event buses/hooks without a concrete consumer;
- multiple nested orchestrator agents;
- hidden Kanban execution as the default lane;
- auto-fix, auto-merge, auto-deploy, or auto-release;
- custom cryptographic review attestations;
- CI dashboards, live comment pollers, or large path matrices;
- full ERP schema or generic all-module CRUD before one vertical proves the abstractions;
- broad UI/module dashboards before the operator workflow is known;
- autonomous CFO/accounting agents or AI-posted bookkeeping;
- payment initiation, bank writes, tax filing, or authority submission;
- advanced forecasting, replenishment, MRP, payroll, fixed assets, or consolidation;
- international abstraction that weakens the Danish first baseline;
- marketplace/plugin architecture without concrete consumers;
- custom AI memory as a second source of truth beside Postgres/audit;
- production accounting/legal claims;
- any shop-floor/MES capability.

# Living-plan maintenance

Keep this file as a versioned baseline, not an append-only execution log.

After every meaningful merged slice:

1. record detailed completion evidence, commit/PR references, and operational history in the relevant GitHub issue or Kanban task;
2. update the current project status surface if its next move changed materially;
3. update the tracking issue rather than leaving completed checkboxes stale;
4. update this plan only when milestone order, stable gates, scope boundaries, or approved decisions change;
5. preserve historical decisions and do not store temporary task state in persistent hot memory.

If implementation changes the plan's assumptions, reconcile the baseline before starting another product slice.

# Immediate execution queue

Only the first item is authorized by this planning request: creation and review of this plan artifact.

1. **Review and accept this working plan.**
2. **PR A1:** Delivery Contract v1.
3. **PR A2:** Canonical Harness v1.
4. **PR A3:** CI hygiene only; keep it narrow.
5. **Milestone 3 dogfood:** use the next small, real code/harness PR to prove the complete delivery loop.
6. **Reconcile issue #13** to mark merged Slice A accurately.
7. **Prepare Human Gate A packet**; stop for approval before any provider/resource/secret/deploy action.
8. **Complete Human Gate A proof**, review, then prepare Human Gate B packet.
9. **Complete Human Gate B proof** and close Live Auth Proof v0 only after cleanup.
10. **Run accounting/Denmark primary-source discovery and architecture review.**
11. **Approve and implement company/accounting context in small slices.**
12. **Implement the deterministic accounting kernel in small slices.**
13. **Build the document/posting bridge and master-data foundation.**
14. **Confirm and prove the first purchasing-to-ledger vertical without inventory effects.**
15. **Add inventory, sales, and Danish close/reporting sequentially.**
16. **Layer readiness, integrations, and bounded AI on authoritative domains.**
17. **Cut the first coherent milestone release when its human release gate passes.**

# Reference patterns

Primary upstream patterns inspected:

- [Hermes Agent `AGENTS.md`](https://github.com/NousResearch/hermes-agent/blob/main/AGENTS.md)
- [Hermes canonical test runner](https://github.com/NousResearch/hermes-agent/blob/main/scripts/run_tests.sh)
- [Hermes CI orchestrator](https://github.com/NousResearch/hermes-agent/blob/main/.github/workflows/ci.yml)
- [Hermes review-label gate](https://github.com/NousResearch/hermes-agent/blob/main/.github/workflows/review-labels.yml)
- [Hermes unrelated-history check](https://github.com/NousResearch/hermes-agent/blob/main/.github/workflows/history-check.yml)
- [Hermes contributor attribution check](https://github.com/NousResearch/hermes-agent/blob/main/.github/workflows/contributor-check.yml)

Mælk sources of truth:

- [`architecture/maelk-erp-platform-goal-v1.md`](../architecture/maelk-erp-platform-goal-v1.md)
- [`AGENTS.md`](../AGENTS.md)
- [`architecture/agent-loop-governance-v0.md`](../architecture/agent-loop-governance-v0.md)
- [`ops/agent-harness/`](../ops/agent-harness/)
- [`scripts/maelk-harness-check.sh`](../scripts/maelk-harness-check.sh)
- [GitHub issue #13](https://github.com/tinyleed/maelk/issues/13)
