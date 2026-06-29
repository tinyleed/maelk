---
name: execute
description: Execute an approved Mælk implementation plan task-by-task with verification.
---

# Execute

Follow the approved plan exactly.

Loop:

1. mark current task;
2. make the smallest necessary change;
3. run the task's verification;
4. inspect the diff;
5. commit only after evidence supports the change;
6. stop on blockers instead of guessing.

High-impact actions — auth, RLS, pricing, compliance, publishing, external sends, inventory/accounting, deployment — require explicit approval gates.
