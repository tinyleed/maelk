---
description: Service/data-access conventions for Mælk modules.
paths: ["apps/app/app/modules/**/*.service.ts", "packages/*/src/**/*.ts"]
---

# Service Conventions

Services own database access. Routes/actions own permission checks, validation, redirects, and user-facing errors.

## Module location

```text
apps/app/app/modules/{module}/{module}.service.ts
```

Re-export from the module `index.ts`; import from the module root, not deep service files.

## Function shape

Use predictable names:

```ts
getProduct(client, id)
getProducts(client, companyId, args)
upsertProduct(client, data)
deleteProduct(client, id)
```

Rules:

- client/db is the first argument;
- list functions take `companyId` explicitly;
- list functions apply search/sort/pagination in one place;
- update payloads should be sanitized before persistence;
- single-row writes do not need transactions;
- multi-row writes use a transaction;
- services do not decide whether AI/human approvals are sufficient — domain policy helpers do.

## Domain policy helpers

For approval/readiness actions, add domain helpers such as:

```ts
canApproveLaunchGate(context, gate)
canPublishChannel(context, channel)
canApplyAiPreparedAction(context, action)
```

React components should consume these decisions instead of duplicating business logic inline.
