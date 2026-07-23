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
- push unless the task brief explicitly authorizes the exact actor and scope;
- merge, release, or deploy;
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

Use `ops/agent-harness/task-brief-template.md`. Lock the tracking issue, Exact base SHA, branch, absolute worktree, and Single writer. One writer owns the worktree through create → own → freeze; cleanup requires state readback and explicit prune authorization.

## Acceptance

A worker summary is not evidence. Accept only after inspecting:

- diff;
- harness output;
- tests/build/smoke where relevant;
- Themis verdict when triggered.

Exact-head evidence is mandatory where PR/CI review applies: Current PR head SHA = Themis reviewed SHA = CI SHA. Any push, rebase, or amend invalidates the prior review. Technical acceptance, Mads merge approval, and release/deploy approval are separate gates; agents approve none of the latter two.

The canonical lifecycle and gate definitions live in `architecture/agent-loop-governance-v0.md`; do not duplicate or fork them here.

## Default command

```bash
./scripts/maelk-harness-check.sh
```
