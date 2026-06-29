---
description: Hard shop-floor/manufacturing execution exclusion boundary for Mælk.
paths: ["apps/**", "packages/**", "architecture/**"]
---

# Shop-floor Boundary

Mælk is a commerce/business operating system, not a manufacturing execution product.

## Do not build

```text
shop-floor tablet app
work centers
operator station controls
machine time tracking
labor time tracking
manufacturing routing execution
production operation events
scrap/rework per operation
```

## Translate instead

If a manufacturing execution concept looks useful, translate it into commerce operations:

```text
operation status    → launch gate status
production schedule → channel/inventory launch plan
traceability        → source links and audit trail
quality check       → compliance/review gate
operator action     → human approval/action with reason
```

If it still requires shop-floor execution after translation, exclude it.
