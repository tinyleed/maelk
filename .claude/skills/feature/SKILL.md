---
name: feature
description: End-to-end Mælk feature workflow: research, design, plan, execute, verify. Use for new product/app features.
---

# Feature Workflow

Use for new Mælk features once the app work begins.

Pipeline:

```text
research → design → plan → execute → verify
```

Rules:

- ground domain logic in commerce/business OS needs;
- check the no-MES boundary;
- define AI/human approval boundaries early;
- create small tasks with exact files and verification;
- do not declare done without evidence.

Artifacts should live under `.claude/scratch/` while in progress and move to `architecture/` or docs only when durable.
