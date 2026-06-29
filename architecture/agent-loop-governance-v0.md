# Mælk Agent Loop Governance v0

Status: active operating model
Date: 2026-06-29

## Purpose

Mælk should be built with an explicit agent loop, not by ad hoc feature improvisation.

This document defines the working system:

```text
ANANKE        = mission control / product owner / final acceptance
maelk-builder = scoped implementation worker profile
Themis        = independent review/verdict profile
Kanban board  = durable task queue and audit trail
repo harness  = deterministic guardrails before any work is accepted
```

## Profiles

### ANANKE

Role:

- owns product direction;
- writes/approves task briefs;
- decides what gets built;
- verifies worker claims;
- invokes Themis when review is needed;
- reports to Mads.

ANANKE may edit repo files directly for small tasks, but substantial app work should go through a task brief and review gate.

### `maelk-builder`

Role:

- implements one scoped Mælk task at a time;
- works in `/Users/tiny-agent-ai/Projects/maelk`;
- follows repo `AGENTS.md`, architecture docs, and `.claude/rules`;
- runs harness checks before claiming completion;
- does not push, merge, deploy, mutate live services, or change profiles/config unless explicitly authorized.

### `themis`

Role:

- reviews diffs, plans, harness output, and worker summaries;
- returns verdict: Pass, Pass with caveats, Needs changes, or Blocked;
- does not fix by default;
- does not accept work without evidence.

## Loop

```text
1. ANANKE creates task brief
2. Task enters Mælk Kanban board
3. maelk-builder implements scoped slice
4. maelk-builder runs harness
5. ANANKE inspects diff/output
6. Themis reviews if meaningful/risky
7. ANANKE accepts, rejects, or sends back
8. Accepted work is committed/pushed by ANANKE only
```

## Definition of Done

A Mælk task is not done until all required items are true:

- task scope is satisfied;
- changed files are listed;
- no forbidden public-inspiration wording appears in repo files;
- no shop-floor execution concepts were introduced;
- no secrets were printed or changed;
- static site root files still parse if touched;
- `./scripts/maelk-harness-check.sh` passes;
- relevant tests/builds pass once the app has package scripts;
- Themis verdict is Pass/Pass with caveats for meaningful implementation slices;
- ANANKE has accepted the result.

## Action lanes

### Green — builder may do with task assignment

- create/update docs, architecture notes, repo-local rules, and templates;
- implement fake-data UI prototypes;
- add tests and pure domain logic;
- refactor inside assigned files;
- run local tests/builds/checks;
- write task progress comments.

### Yellow — ANANKE approval required

- add dependencies;
- alter package manager/app framework choices;
- introduce database schema/migrations;
- change public landing page copy;
- create branches/PRs;
- push commits;
- invoke external coding agents;
- create or unblock Kanban tasks that will dispatch automatically.

### Red — Mads approval required

- profile/config changes;
- credentials/API keys/auth;
- DNS/hosting/payment changes;
- live integrations or external sends;
- production data writes;
- autonomous recurring jobs;
- public posts/messages;
- force-pushes outside explicitly approved amend/cleanup work.

## Harness requirements

The repo harness must check:

- required architecture/agent files exist;
- no forbidden shop-floor execution app exists;
- no public external-inspiration wording appears in repo files;
- `index.html` and `design-prototype-v0.html` parse;
- live-root files are present: `index.html`, `design-prototype-v0.html`, `CNAME`, `.nojekyll`;
- git working tree state is visible in output;
- optional package checks run when `package.json` exists.

## Review trigger

Invoke Themis for:

- first version of a new app/module;
- schema/migration changes;
- approval/AI boundary changes;
- public site changes;
- anything a worker claims as complete after non-trivial edits;
- any failed harness/fix cycle.

## First controlled task

The first worker task should not be a feature. It should be a harness proof:

> Verify the Mælk repo guardrails and propose the smallest Product Launch OS implementation plan without editing product code.

That proves the loop before it builds the product. Boring? Yes. Correct? Also yes.
