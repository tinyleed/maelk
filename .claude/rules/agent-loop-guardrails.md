---
description: Agent-loop, worker, review, and harness guardrails for Mælk.
paths: ["AGENTS.md", "architecture/**", ".claude/**", "ops/agent-harness/**", "scripts/**", "apps/**", "packages/**"]
---

# Agent Loop Guardrails

Mælk uses a supervised agent loop:

```text
ANANKE → task brief → maelk-builder → harness → Themis review → ANANKE acceptance
```

## Worker boundaries

`maelk-builder` may implement assigned repo-local tasks, but must not:

- change Hermes profiles/config;
- touch secrets or credentials;
- push/merge/deploy;
- schedule cron jobs;
- contact external systems;
- add shop-floor/manufacturing execution scope;
- introduce public source-inspiration wording.

## Required task brief

Every meaningful worker task needs:

- goal;
- context;
- in scope;
- out of scope;
- allowed files;
- verification commands;
- done condition;
- escalation conditions.

Use `ops/agent-harness/task-brief-template.md`.

## Acceptance

A worker summary is not evidence. Accept only after inspecting:

- diff;
- harness output;
- tests/build/smoke where relevant;
- Themis verdict when triggered.

## Default command

```bash
./scripts/maelk-harness-check.sh
```
