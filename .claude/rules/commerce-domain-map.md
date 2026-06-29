---
description: Mælk commerce/business OS domain map.
paths: ["architecture/**", "apps/app/app/modules/**", "packages/database/**"]
---

# Commerce Domain Map

Mælk is a broad commerce/business operating system. The language is commerce operations, not manufacturing execution.

## Core domains

```text
companies / users
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
```

## First wedge: Product Launch OS

A launch connects many domains without requiring the full system to exist first:

```text
product + supplier + cost + compliance + channel + inventory + campaign + approval + AI review
```

## Domain language guide

```text
sellable thing       → product / SKU
bundle/setup         → bundle / fulfillment model, only if needed
operational work     → launch / order / campaign / task
workflow step        → gate / readiness step
quality/risk         → compliance / review / approval
onboarding           → readiness / implementation / go-live
AI tool surface      → constrained review and prepared-action surface
shop-floor operation → excluded
```
