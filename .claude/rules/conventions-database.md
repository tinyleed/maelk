---
description: Database conventions for future Mælk app work: tenancy, audit, RLS, approvals, and readiness.
paths: ["packages/database/**", "apps/app/app/modules/**/*.models.ts"]
---

# Database Conventions

Mælk's database must be multi-tenant, audit-first, and approval-aware from day one.

## Default table contract

Tenant-owned tables should follow this shape unless there is a documented reason not to:

```sql
CREATE TABLE "entityName" (
  "id" TEXT NOT NULL DEFAULT id('en'),
  "companyId" TEXT NOT NULL,

  -- business columns here

  "createdBy" TEXT NOT NULL REFERENCES "user"("id"),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedBy" TEXT REFERENCES "user"("id"),
  "updatedAt" TIMESTAMP WITH TIME ZONE,
  "customFields" JSONB,
  "tags" TEXT[],

  PRIMARY KEY ("id", "companyId"),
  FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);
```

## Rules

- Use text IDs with short prefixes; never raw random UUID defaults in business tables.
- Include `companyId` and composite primary key for tenant-owned tables.
- Include audit columns on tenant-owned tables.
- Index `companyId` and every foreign key.
- Use RLS for tenant isolation.
- Use `SECURITY_INVOKER=true` for views so underlying RLS applies.
- Use transactions for multi-row writes.
- Do not store readiness as one hand-edited boolean when it can be derived from required evidence, blockers, and approvals.

## Approval data

High-impact decisions need durable reasons:

```text
approvalStatus
approvedBy / rejectedBy
approvedAt / rejectedAt
reason
riskSummary
sourceLink
```

Applies to pricing, compliance, channel publishing, external sends, inventory/accounting-affecting actions, and go-live.

## First Product Launch OS tables

Start narrow:

```text
company
user
product
sku
supplier
supplierTerm
costModel
complianceRequirement
channel
launch
launchGate
approval
activityEvent
aiReview
sourceLink
```
