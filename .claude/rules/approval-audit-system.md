---
description: Approval, audit, AI action, and readiness gate rules for Mælk.
paths: ["apps/app/app/modules/approvals/**", "apps/app/app/modules/readiness/**", "apps/app/app/modules/ai-review/**", "packages/approvals/**", "packages/readiness/**", "packages/ai/**"]
---

# Approval, Audit, and AI Gates

Mælk's safety model is: AI prepares; humans approve; the system records why.

## AI may

- search and summarize records;
- draft product copy, supplier notes, launch briefs, and checklist text;
- flag missing fields;
- compare a launch against a readiness template;
- prepare an action for review.

## AI may not directly

- approve compliance;
- change prices or margins;
- publish to a channel;
- send external messages;
- mutate inventory/accounting state;
- approve go-live.

## Approval record

Every high-impact decision needs:

```text
action
entityType
entityId
status: requested | approved | rejected | applied | cancelled
riskSummary
reason
requestedBy
approvedBy / rejectedBy
createdAt
resolvedAt
```

## Audit event

Every state transition that affects readiness should append an activity/audit event with actor, action, target, timestamp, and metadata.

## Readiness

Readiness should be computed from requirements, evidence, blockers, approvals, and sync state. Avoid a single manual `ready=true` flag as the source of truth.
