# Mælk Operating System Architecture v0

Status: accepted direction
Date: 2026-06-29

## Decision

Mælk is a commerce/business operating system with readiness, approvals, and AI review as the control layer.

Working definition:

> Mælk is an operating system for commerce teams: product/PIM, suppliers, purchasing, inventory, sales/offers/orders, pricing, compliance, channels, approvals, AI review, docs/training, and implementation/readiness flows — with shop-floor/manufacturing execution out of scope.

Short form:

> A calm operating system for getting commerce from idea to live.

## Original architecture stance

Mælk's architecture should be treated as its own product architecture, not a fork or derivative implementation.

Do build:

- monorepo shape;
- app/package separation;
- module layout;
- database discipline;
- service/form conventions;
- AI/tool gating;
- agent-readable operating layer;
- implementation/readiness hub pattern;
- verification-before-done culture.

Do not build:

- source forks of external products;
- wholesale copied schemas;
- enterprise-only/commercial add-on code from other systems;
- manufacturing execution tables and workflows;
- domain language that fights Mælk's commerce model.

## Hard boundary: no shop-floor execution

Mælk must not include:

- shop-floor tablets;
- work centers;
- labor/machine time tracking;
- operator station controls;
- manufacturing routing execution;
- production event tracking;
- scrap/rework logging per operation;
- manufacturing execution scheduling screens.

Manufacturing-adjacent ideas can only enter if translated into commerce operations. Example: production planning becomes inventory/channel planning, not routing execution.

## Product class

Mælk is not just a checklist or landing page. It is intended to become a business operating system.

Core surfaces:

1. Product/PIM
2. Supplier and sourcing
3. Purchasing
4. Inventory and availability
5. Sales, offers, orders, and campaigns
6. Pricing and unit economics
7. Compliance and quality review
8. Channels and publishing readiness
9. Approvals and audit
10. AI review and constrained action tools
11. Implementation/readiness hub
12. Docs/training/academy later

## First wedge

The first product slice should be:

> Product Launch OS

It proves the full operating loop without building the whole system at once.

Flow:

```text
product idea / supplier lead
→ product draft
→ supplier terms
→ SKU/variant setup
→ cost and margin check
→ compliance requirements
→ channel readiness
→ inventory/WMS readiness
→ sales/campaign readiness
→ AI review
→ human approval
→ go-live audit
```

## First objects

Required early objects:

```text
Company
User
Product
SKU / Variant
Supplier
SupplierQuote / SupplierTerms
CostModel
ComplianceRequirement
Channel
Launch
LaunchGate
Approval
ActivityEvent
AIReview
SourceLink
```

Later objects:

```text
PurchaseOrder
StockMovement
SalesOrder
Invoice
Customer
Campaign
Offer
IntegrationSync
DocumentTemplate
TrainingGuide
```

## Recommended repo shape

```text
apps/
  app/          # core Mælk application
  docs/         # product/docs site
  marketing/    # future home for mælk.com, current static root stays live for now
  academy/      # later training/onboarding app

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

Do not add a shop-floor/manufacturing execution app.

## App module layout

Use this module layout for the core app:

```text
apps/app/app/modules/{module}/
├── {module}.models.ts     # zod validators + derived types
├── {module}.service.ts    # data access boundary
├── {module}.server.ts     # server-only orchestration, optional
├── index.ts               # module barrel
└── ui/                    # feature UI
```

Initial modules:

```text
companies
users
products
suppliers
purchasing
inventory
sales
pricing
compliance
channels
approvals
readiness
activity
ai-review
integrations
```

## Database rules

Mælk's database should be multi-tenant and audit-first from day one.

Default table contract:

```text
id TEXT NOT NULL DEFAULT id('<prefix>')
companyId TEXT NOT NULL
createdBy TEXT NOT NULL
createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
updatedBy TEXT
updatedAt TIMESTAMPTZ
customFields JSONB optional
tags TEXT[] optional
PRIMARY KEY (id, companyId)
```

Rules:

- every tenant-owned table has `companyId`;
- every tenant-owned table has audit columns;
- every FK is indexed;
- views use `SECURITY_INVOKER=true`;
- RLS is mandatory;
- high-impact decisions require reason notes;
- derived readiness belongs in views/functions/services, not hand-edited booleans.

## Service rules

Services own database access. UI and route actions must not scatter persistence logic.

Canonical shape:

```ts
getProduct(client, id)
getProducts(client, companyId, args)
upsertProduct(client, data)
deleteProduct(client, id)
```

Rules:

- client/db is first argument;
- list functions scope by `companyId` even with RLS;
- multi-row writes use transactions;
- service functions return typed results, not UI state;
- route/action layer owns permissions, validation errors, redirects, and flash messages.

## Forms and validation

Use a predictable pipeline:

```text
zod validator
→ form component
→ route/action validation
→ service call
→ audit/flash/redirect
```

Every business mutation should have:

- validator;
- permission check;
- service call;
- audit/event behavior if state changes matter;
- human decision reason if the action is an approval/rejection.

## AI and approval model

AI may:

- search records;
- describe fields and tools;
- draft copy and summaries;
- flag missing data;
- compare against templates;
- prepare actions for review;
- create launch briefs.

AI may not directly:

- approve compliance;
- change prices/margins;
- publish channels;
- send external supplier/customer messages;
- mutate stock or accounting;
- mark go-live approved.

High-impact actions require:

```text
requested action
risk summary
human approver
approval/rejection reason
audit event
```

## Agent operating layer

Mælk should be agent-operable from the beginning.

Use:

```text
AGENTS.md
CLAUDE.md
.claude/settings.json
.claude/rules/*.md
.claude/skills/*/SKILL.md
.claude/scratch/{plans,research,tasks}/
```

Source-of-truth hierarchy:

1. code + database schema;
2. product docs and architecture docs;
3. `.claude/rules` as agent-readable technical index;
4. scratch files as temporary execution state.

Rules must be updated when the real source changes. Wrong rules are worse than missing rules. Nasty little truth, but useful.

## First build milestone

Before building the full system, create a thin Product Launch OS slice:

1. static/product spec and module map;
2. focused data model for Product Launch OS;
3. seed/fake records;
4. one cockpit screen;
5. AI review summary stub;
6. approval gate with required reason;
7. activity/audit timeline;
8. verification checklist.

## Acceptance criteria for architecture adoption

- [x] Mælk direction documented as commerce/business operating system with shop-floor execution out of scope.
- [x] `AGENTS.md` and `CLAUDE.md` define repo operating rules.
- [x] `.claude/rules` seeds the agent-readable architecture layer.
- [x] `.claude/skills` seeds the plan/execute/verify workflow.
- [x] current GitHub Pages static site remains untouched and deployable.
- [ ] later: migrate from static marketing prototype to actual app monorepo.
