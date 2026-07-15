# Mælk maintainer workflow

Mælk is public, but it is still a supervised early-stage Denmark-first, open-source, AI-native ERP platform project for commerce operations. Maintainers should keep the repo easy for contributors and agents to work on without loosening human approval gates.

## Operating model

- Product direction and final acceptance stay with ANANKE/Mads.
- Contributors and agents work from issues, small branches, and explicit acceptance criteria.
- The default verification is harness-first: `./scripts/maelk-harness-check.sh` plus `git diff --check`.
- `main` is protected: changes must go through PRs and pass the required `Repository harness` GitHub Actions check before normal merge.
- `main` also requires branches to be up to date before merge, and blocks force pushes and branch deletion.
- Admin enforcement and required review count are intentionally off in the first branch-protection pass; do not use admin bypass for normal maintainer workflow.
- Meaningful changes should be reviewed before merge; do not merge your own risky change without independent review.
- Canonical current goal lives in `architecture/maelk-erp-platform-goal-v1.md`.
- Current runnable stack is React Router v8 SPA + same-origin Express API + Supabase browser auth boundary + shadcn/ui; hosting/deployment remains a separate human-gated decision.
- Native double-entry accounting is mandatory from the first serious version, but finance schema/code and production accounting-readiness claims require a separate approved slice.
- Product Launch OS remains an existing fake-data-backed prototype/module, not the current platform goal or default next build lane.
- Shop-floor/manufacturing execution scope stays out of the project.

## Recommended label taxonomy

These are recommendations for maintainers to create deliberately later. This document does not create labels.

Type labels:

- `type:bug`
- `type:feature`
- `type:docs`
- `type:maintainer-task`
- `type:security`

Component labels:

- `area:product-launch-os`
- `area:app-shell`
- `area:commerce-domain`
- `area:approvals-readiness`
- `area:ai-review`
- `area:docs-harness`
- `area:github-workflow`

State labels:

- `status:needs-triage`
- `status:ready`
- `status:blocked`
- `status:needs-review`
- `status:accepted`

Safety labels:

- `gate:human-approval`
- `gate:security-sensitive`
- `gate:external-service`
- `gate:release`

## Issue triage

For every incoming issue:

1. Confirm it fits the Mælk commerce/business operating-system scope.
2. Confirm it does not introduce shop-floor/manufacturing execution work.
3. Check whether it needs human approval for secrets, DNS/hosting, deployment, production data, live integrations, accounting, pricing, compliance, go-live, merge, or release decisions.
4. Ask for missing acceptance criteria or verification steps before marking it ready.
5. Prefer one issue per small, independently reviewable change.

Close or redirect issues that are only requests for gated external changes unless ANANKE/Mads has approved that lane.

## PR review flow

A PR is ready for review when it includes:

- a related issue or Kanban task;
- a summary of changed files;
- acceptance criteria status;
- fresh verification output;
- screenshots, logs, or browser notes for user-facing behavior;
- a completed safety checklist.

Reviewers should check:

1. Scope stayed inside the issue/task and allowed files.
2. The diff does not add secrets, live writes, deployment behavior, or unapproved external settings.
3. The diff does not add shop-floor/manufacturing execution scope.
4. The harness and relevant package checks passed.
5. Documentation and `.claude/rules/` remain consistent when architecture changes.
6. Human approval gates are explicit for pricing, compliance, go-live, merges, releases, and public delivery.

## Dependency updates

Dependabot is intentionally low-noise and limited to GitHub Actions. Treat dependency PRs as maintainer tasks:

- inspect the diff;
- run or wait for the harness/CI checks;
- avoid batching unrelated code changes into the dependency PR;
- merge only after maintainer review.

Do not add package-manager ecosystems to Dependabot until the app/package dependency policy is explicit.

## Security handling

Security-sensitive reports should stay private until maintainers approve disclosure. Never ask reporters to paste secrets or exploit details into public issues.

For security fixes:

1. Create a minimal private handling path.
2. Patch in the smallest reviewable branch.
3. Run the harness and relevant tests.
4. Document impact, user action if any, and follow-up hardening.
5. Coordinate release/disclosure through ANANKE/Mads.

## Merge and release gates

Maintainers may prepare merge/release notes, but human approval is required before:

- merging meaningful feature or governance PRs;
- cutting releases;
- deploying or changing hosting;
- changing DNS or external accounts;
- using production data;
- approving pricing, compliance, or go-live outcomes.

When in doubt, leave the PR open with a clear blocker note rather than improvising around the gate.
