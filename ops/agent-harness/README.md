# Mælk Agent Harness

This folder defines how ANANKE, `maelk-builder`, Themis, and Kanban coordinate Mælk work.

## Files

- `task-brief-template.md` — required brief shape for builder tasks.
- `themis-review-checklist.md` — review checklist for meaningful worker output.
- `../../scripts/maelk-harness-check.sh` — deterministic repo guardrail script.

## Default loop

```text
brief → worker → harness → ANANKE diff check → Themis review → accept/redo
```

## Historical first proof task

The original v0 loop was proven with a read-only worker task:

> Verify guardrails and propose the smallest Product Launch OS implementation plan.

That history is retained because the Product Launch OS prototype still exercises fake-data readiness, approvals, AI review, and audit checks. Current product-direction tasks should instead align with `architecture/maelk-erp-platform-goal-v1.md`.
