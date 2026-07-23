# Mælk Worker Task Brief

## Title

<one concrete task>

## Assignee

`maelk-builder`

## Tracking

- Issue/task: <issue URL, number, or task identity>
- Milestone/PR lane: <tracking lane>
- Risk class: <Green/Yellow/Red and why>
- Approvals already granted: <actor, scope, and timestamp; or none>

## Git lane

- Exact base SHA: <40-character SHA>
- Branch: <branch>
- Absolute worktree: <absolute-worktree-path>
- Single writer: <profile/person>
- Push/PR authorization: `none` or `exact actor/scope`
- Merge authorization: `never`

Stop before editing if the checked-out branch, base, worktree, or writer ownership differs.

## Goal

<what should change or be produced>

## Context

- Product direction: Mælk is a Denmark-first, open-source, AI-native ERP platform for commerce operations with shop-floor execution out of scope.
- Canonical current goal: `architecture/maelk-erp-platform-goal-v1.md`.
- Product Launch OS is an existing fake-data-backed prototype/module, not the current platform goal or default next build lane.
- Source order: task brief → `AGENTS.md` → `architecture/` → `.claude/rules/` → existing code.

## In scope

- <specific files/areas>

## Out of scope

- secrets, credentials, DNS, hosting, payments, external sends, live integrations;
- finance schema/code, ledger posting, fiscal reporting, or accounting production-readiness claims unless explicitly approved;
- shop-floor/manufacturing execution;
- public source-inspiration wording;
- unrelated UI polish.

## Allowed files

```text
<paths that may change>
```

## Expected files

- Expected modifications: <paths or none>
- Expected additions: <paths or none>
- Forbidden/unexpected areas: <paths or categories>

Stop and escalate before touching an unlisted file; explain any accepted variance in the handoff.

## Required checks

```text
<exact checks required for this task>
```

### Behavior and invariants

- Observable result: <one directly verifiable outcome>
- Invariant(s): <behavior/data/safety properties that must remain true>
- Evidence: <how behavior is proved rather than source text merely matched>

## Browser/runtime proof

- Required: <yes/no and why>
- Path/scenario: <real user or runtime path>
- Evidence to capture: <screenshot, console, log, response, or explicit N/A>

## Side-effect boundaries

- Allowed local effects: <edits/checks/build artifacts>
- Forbidden external/live effects: <provider, user, email, data, deploy, DNS, settings, secrets>
- Push/PR authorization: `none` or `exact actor/action`; never implies merge
- Merge authorization: `never`

## Done condition

- <observable condition>
- changed files listed;
- verification output included;
- behavior/invariant evidence included;
- caveats stated;
- worktree frozen for handoff with exact current head and status reported.

## Stop conditions

- checked-out state differs from the locked Git lane;
- another writer or unexplained modification appears;
- work exceeds allowed/expected files or side-effect boundaries;
- a secret, provider, setting, security-channel, or other human choice is needed;
- required verification fails for an unclear reason.

## Escalate/block if

- source files/rules conflict;
- requested change needs profile/config/secrets/live integration;
- harness fails and root cause is unclear;
- task scope is too broad for one slice;
- any stop condition is reached.
