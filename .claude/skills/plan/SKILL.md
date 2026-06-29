---
name: plan
description: Create concrete implementation plans for Mælk changes, with exact files, commands, and verification.
---

# Plan

Before non-trivial implementation, write a concrete plan.

Each task should include:

- exact files to create/modify;
- exact code or schema shape when known;
- commands to run;
- expected verification result;
- approval/risk gates if relevant.

Order tasks:

```text
domain model → tests/policies → services → routes/actions → UI → browser/manual verification
```

For database changes, load `conventions-database.md`. For approval/AI work, load `approval-audit-system.md`.
