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

## First proof task

Before building Product Launch OS, run one read-only worker task:

> Verify guardrails and propose the smallest Product Launch OS implementation plan.

If that task cannot pass without confusion, the harness is not ready for real implementation work.
