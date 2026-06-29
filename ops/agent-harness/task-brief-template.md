# Mælk Worker Task Brief

## Title

<one concrete task>

## Assignee

`maelk-builder`

## Goal

<what should change or be produced>

## Context

- Product direction: Mælk is a commerce/business operating system with shop-floor execution out of scope.
- First wedge: Product Launch OS.
- Source order: task brief → `AGENTS.md` → `architecture/` → `.claude/rules/` → existing code.

## In scope

- <specific files/areas>

## Out of scope

- secrets, credentials, DNS, hosting, payments, external sends, live integrations;
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
