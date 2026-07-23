# Themis Review Checklist — Mælk

Use after a meaningful `maelk-builder` task or any risky ANANKE edit.

## Verdict

Choose one:

- Pass
- Pass with caveats
- Needs changes
- Blocked

A Pass is technical review evidence only. It is not approval to merge, release, or deploy.

## Review identity

Fill every applicable field:

- Task/issue: <identity>
- Exact base SHA: <40-character SHA>
- Current PR head SHA: <40-character SHA>
- Themis reviewed SHA: <40-character SHA>
- PR: <URL or number>
- CI run: <URL or run ID>
- CI SHA: <40-character SHA>
- Review timestamp (UTC): <YYYY-MM-DDTHH:MM:SSZ>
- Reviewer: <identity>

Identity gate:

- [ ] Current PR head SHA = Themis reviewed SHA = CI SHA.
- [ ] CI and review evidence belong to the current PR head, not an earlier push.
- [ ] The exact base and current head match the task brief and PR.

Any push, rebase, or amend invalidates this exact-head review. Repeat CI and Themis review for the new current PR head.

## Acceptance criteria

Check:

- task goal satisfied;
- only in-scope files changed;
- canonical goal alignment checked against `architecture/maelk-erp-platform-goal-v1.md` when product direction is touched;
- behavior and invariants verified on the real path, not only by matching source text;
- no secrets/credentials/live external effects;
- no finance schema/code, ledger posting, fiscal reporting, or accounting production-readiness claim introduced without explicit approval;
- no shop-floor/manufacturing execution scope introduced;
- Product Launch OS, when touched, remains fake-data-backed/local-only prototype scope rather than the current platform goal;
- no public source-inspiration wording introduced;
- harness output present and passing;
- relevant tests/builds/smokes and browser/runtime proof present when executable behavior changed;
- rollback path is clear.

## Required evidence

- task brief;
- git diff/stat;
- harness output;
- test/build/smoke and browser/runtime output when applicable;
- worker summary;
- ANANKE notes/caveats if any.

## Remaining human gates

Record independently; do not infer one from another:

- Technical acceptance (ANANKE): [ ] approved [ ] pending — <identity/timestamp/current head>
- Merge approval (Mads): [ ] approved [ ] pending — <identity/timestamp/current head>
- Release/deploy approval (human): [ ] approved [ ] pending [ ] not applicable — <identity/timestamp/release target>

Themis and other AI/agents do not check or grant merge or release/deploy approval. A Pass does not satisfy either human gate.

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
