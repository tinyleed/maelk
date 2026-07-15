---
description: Database conventions for future Mælk app work: tenancy, audit, RLS, approvals, and readiness.
paths: ["packages/database/**", "apps/app/app/modules/**/*.models.ts"]
---

# Database Conventions

Mælk's database must be multi-tenant, multi-company, audit-first, approval-aware, and ready for a future native double-entry accounting core from day one.

Canonical current goal: `architecture/maelk-erp-platform-goal-v1.md`.

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
- Do not add accounting tables, ledger posting behavior, fiscal reports, or production accounting claims without a separate approved accounting architecture task.
- Future accounting-impacting tables will need stricter immutability, posting, and audit controls than ordinary draft workflow records.

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

Applies to pricing, compliance, channel publishing, external sends, inventory/accounting-affecting actions, ledger posting, filing/payment preparation, and go-live.

## Platform table families

The canonical platform goal is ERP-wide. Product Launch OS records are now prototype safety fixtures, not the platform data model. Future schema work should start from a focused approved slice, but table-family planning should account for:

```text
company
user
role / permission / membership
accounting primitives (planned separately)
product
sku
supplier
supplierTerm
purchase / sales / inventory documents
costModel
complianceRequirement
channel
approval
activityEvent
aiReview
sourceLink
localizationPack / tier / configuration
```
