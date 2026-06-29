# Themis Review Checklist — Mælk

Use after a meaningful `maelk-builder` task or any risky ANANKE edit.

## Verdict

Choose one:

- Pass
- Pass with caveats
- Needs changes
- Blocked

## Acceptance criteria

Check:

- task goal satisfied;
- only in-scope files changed;
- no secrets/credentials/live external effects;
- no shop-floor/manufacturing execution scope introduced;
- no public source-inspiration wording introduced;
- harness output present and passing;
- relevant tests/builds/smokes present when executable behavior changed;
- rollback path is clear.

## Required evidence

- task brief;
- git diff/stat;
- harness output;
- test/build/smoke output when applicable;
- worker summary;
- ANANKE notes/caveats if any.

## Finding format

```text
Severity: Critical | High | Medium | Low
Finding:
Evidence:
Required action:
```

## Persistence routing

Recommend updates if needed:

- repo `AGENTS.md` / `.claude/rules`;
- architecture docs;
- Hermes skill;
- Kanban task/comment;
- memory only for stable cross-session preference/fact.
