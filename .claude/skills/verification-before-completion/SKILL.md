---
name: verification-before-completion
description: Require fresh evidence before claiming Mælk work is complete or correct.
---

# Verification Before Completion

Evidence before claims.

Before saying a task is done, identify and run the proof:

- docs/architecture only: file existence + diff check + markdown sanity;
- code: tests/lint/typecheck/build;
- UI: browser/manual verification with console check when possible;
- data/schema: migration/seed validation in a disposable environment before real DB;
- external effects: approval before action, then verify the external state.

Do not rely on confidence, previous runs, or agent self-report.
