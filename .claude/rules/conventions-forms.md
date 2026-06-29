---
description: Form, validator, and route/action conventions for Mælk.
paths: ["apps/app/app/modules/**/ui/**", "apps/app/app/modules/**/*.models.ts", "packages/form/**"]
---

# Forms Conventions

Business mutations should follow a repeatable chain:

```text
zod validator
→ form component
→ route/action validation
→ service function
→ audit/flash/redirect
```

## Validator

Keep validators in the module `.models.ts` file:

```text
apps/app/app/modules/products/products.models.ts
```

Use zod-derived types for form props and mutation payloads.

## Form UI

Forms live under:

```text
apps/app/app/modules/{module}/ui/
```

Prefer shared form fields from the future Mælk form package before custom inputs.

## Actions

Every mutation action should:

1. assert the method;
2. require permissions;
3. validate form data;
4. call the module service;
5. persist approval/audit metadata when relevant;
6. return a clear success/error flow.

## Approval forms

Approve/reject forms require a non-empty reason. No naked state flips for compliance, pricing, channel publish, external sends, or go-live.
