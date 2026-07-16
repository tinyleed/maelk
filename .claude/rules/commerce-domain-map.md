---
description: Mælk commerce/business OS domain map.
paths: ["architecture/**", "apps/app/app/modules/**", "packages/database/**"]
---

# Commerce Domain Map

Mælk is a Denmark-first, open-source, AI-native ERP platform for commerce operations. The language is commerce operations and accounting-grade business control, not manufacturing execution.

Canonical current goal: `architecture/maelk-erp-platform-goal-v1.md`.

## Platform goal

```text
Denmark-first ERP core
→ native double-entry accounting from the first serious version
→ shared multi-tenant / multi-company platform
→ tiers, permissions, configuration, and localization packs
→ AI-assisted drafting/review with human approval gates
```

Do not add finance schema/code or claim legal/accounting production readiness until a separate accounting architecture task approves that work.

## Core domains

```text
companies / users
accounting core / ledger controls / VAT-localization seams
products / SKUs / variants
suppliers / supplier terms
purchasing
inventory / availability
sales / offers / orders / campaigns
pricing / unit economics
compliance / quality review
channels / publishing readiness
approvals / audit
readiness / launch gates
activity / timeline
ai-review / prepared actions
integrations / sync state
localization packs / tiers / configuration
```

## Existing prototype: Product Launch OS

Product Launch OS remains as an existing fake-data-backed prototype/module. A launch connects many domains and is still useful for readiness, audit, and approval safety checks:

```text
product + supplier + cost + compliance + channel + inventory + campaign + approval + AI review
```

The historical implementation plan lives in `architecture/product-launch-os-first-implementation-slice-v0.md`. Keep any existing prototype repo-local, fake-data-backed, and free of live integrations unless ANANKE approves a separate build task.

## Domain language guide

```text
sellable thing       → product / SKU
bundle/setup         → bundle / fulfillment model, only if needed
operational work     → launch / order / campaign / task
workflow step        → gate / readiness step
quality/risk         → compliance / review / approval
onboarding           → readiness / implementation / go-live
AI tool surface      → constrained review and prepared-action surface
accounting impact    → human-approved draft/posting boundary with audit reason
country support      → localization pack
shop-floor operation → excluded
```
