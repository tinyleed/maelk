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
- works only in the absolute worktree assigned by the task brief;
- follows repo `AGENTS.md`, architecture docs, and `.claude/rules`;
- runs harness checks before claiming completion;
- is the single writer for that worktree while the task is active;
- does not push, merge, release, deploy, mutate live services, or change profiles/config unless the applicable human gate explicitly authorizes it.

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
7. ANANKE records technical acceptance, rejection, or sends back
8. A separately authorized actor may commit/push; every new PR head requires fresh exact-head evidence
9. Mads decides whether to approve merge
10. Release/deploy requires its own human approval
```

## Delivery contract and worktree lifecycle

Every meaningful task brief locks the tracking issue, Exact base SHA, branch, absolute worktree path, and Single writer before editing starts. It also names expected files, observable behavior/invariants, checks, side-effect boundaries, and stop conditions. A mismatch in any locked identity is a block, not an invitation to repair state by assumption.

The lifecycle is explicit:

1. **Create:** an authorized controller creates the branch/worktree from the exact base and records both in the task brief.
2. **Own:** exactly one writer owns the assigned worktree. Other agents and maintainers remain read-only there until handoff.
3. **Freeze:** after implementation and checks, the writer stops editing and reports the current head, diff, status, and evidence. Review applies only to that frozen identity.
4. **Prune:** cleanup happens only after merge/abandonment authorization and readback of registered worktrees and branch state. Never prune or delete from memory or assumption.

Before cleanup, read back repository state from the repository and target worktree:

```bash
git worktree list --porcelain
git -C <worktree> branch --show-current
git -C <worktree> rev-parse HEAD
git -C <worktree> status --short
git branch --contains <head-sha>
git merge-base --is-ancestor <head-sha> origin/main
gh pr view <pr-number> --json state,mergedAt,headRefOid,mergeCommit
```

Confirm the exact target, owner, dirty state, branch retention need, and merge/abandonment decision before cleanup. An ancestry check can be false after a squash merge, so verify the actual PR state instead of assuming that a non-ancestor branch is unmerged. Do not delete or prune an active, unknown, dirty, or mismatched worktree. These are readback commands, not cleanup authorization.

## Exact-head review identity

Technical acceptance is valid only when **Current PR head SHA = Themis reviewed SHA = CI SHA**. Record the task, Exact base SHA, exact current head SHA, PR identity, CI run, CI SHA, UTC timestamp, and reviewer in the review evidence.

Any push, rebase, or amend changes the PR head and invalidates prior exact-head CI and Themis review. Fresh CI and fresh Themis review are required for the new head; source-text similarity is not sufficient evidence.

## Separate approval gates

These gates are independent and must not be collapsed:

1. **Technical acceptance:** ANANKE confirms scope, invariants, checks, and exact-head review evidence.
2. **Merge approval:** Mads explicitly approves merging the identified current PR head.
3. **Release/deploy approval:** a human explicitly approves the identified release or deployment action.

A Themis Pass or technical acceptance does not authorize merge, release, or deploy. AI systems and agents never grant those human approvals.

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
- current PR head SHA, Themis reviewed SHA, and CI SHA are identical when PR/CI evidence is required;
- ANANKE has recorded technical acceptance;
- merge approval and release/deploy approval remain separately recorded human gates and are not implied by Done.

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
- authorize or perform pushes outside the writer/push boundary locked by the task brief;
- invoke external coding agents;
- create or unblock Kanban tasks that will dispatch automatically.

### Red — Mads approval required

- merge, release, deploy, and go-live;
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
- root GitHub Pages files are absent: `index.html`, `design-prototype-v0.html`, `CNAME`, `DNS.md`, `.nojekyll`;
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
