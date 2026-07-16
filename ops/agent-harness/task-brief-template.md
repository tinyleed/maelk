# Mælk Worker Task Brief

## Title

<one concrete task>

## Assignee

`maelk-builder`

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
<paths>
```

## Required verification

```bash
./scripts/maelk-harness-check.sh
```

Add tests/build commands if package scripts exist or the task changes executable app code.

## Done condition

- <observable condition>
- changed files listed;
- verification output included;
- caveats stated.

## Escalate/block if

- source files/rules conflict;
- requested change needs profile/config/secrets/live integration;
- harness fails and root cause is unclear;
- task scope is too broad for one slice.
