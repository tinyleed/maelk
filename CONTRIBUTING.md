# Contributing to Mælk

Mælk is an early-stage Denmark-first, open-source, AI-native ERP platform for commerce operations. Native double-entry accounting is mandatory from the first serious version, while Product Launch OS remains an existing fake-data-backed prototype/module rather than the current platform goal.

This public repo is intentionally small and supervised. Please optimize for focused issues, small PRs, and verified changes rather than broad rewrites.

## Scope boundaries

In scope:

- commerce/business operating-system work;
- ERP platform architecture for product, supplier, purchasing, inventory, sales, pricing, compliance, accounting foundations, channels, approval, readiness, activity, localization, and AI-review flows;
- Product Launch OS prototype maintenance when it stays fake-data-backed and local-only;
- docs, tests, harness checks, and repo-local automation that make changes safer.

Out of scope:

- shop-floor or manufacturing execution features;
- secrets, credentials, tokens, payment settings, production data, or live integration writes;
- finance schema/code, ledger posting, fiscal reporting, or production accounting-readiness claims unless a maintainer explicitly approves that slice;
- DNS, hosting, deployment, branch protection, and external account changes without maintainer approval.

If a proposed change touches a boundary, open an issue first and wait for maintainer direction.

## Workflow

1. Open or find an issue before starting meaningful work.
2. Keep the PR small enough to review in one sitting.
3. Branch from `main` unless a maintainer asks otherwise.
4. Follow `AGENTS.md`, [`architecture/agent-loop-governance-v0.md`](architecture/agent-loop-governance-v0.md), and `.claude/rules/` before inventing new conventions.
5. Make the smallest coherent change that satisfies the issue acceptance criteria.
6. Run the harness before requesting review:

   ```bash
   ./scripts/maelk-harness-check.sh
   git diff --check
   ```

7. Paste relevant verification output into the PR body.

Maintainer- and agent-assigned tasks use an isolated worktree with one named writer. The task brief locks the exact base SHA, branch, absolute worktree, expected files, and side-effect boundaries. Do not edit another writer's worktree or prune one without explicit authorization and repository-state readback.

For reviewed PRs, record Exact base SHA, Current PR head SHA, Themis reviewed SHA, and CI SHA. Technical acceptance requires the current PR head, reviewed head, and CI head to be identical. Any push, rebase, or amend invalidates prior exact-head review and requires fresh CI and review evidence.

## Human approval gates

Contributors and agents may draft, analyze, test, and prepare changes. Maintainers or Mads/ANANKE must explicitly approve high-impact decisions, including:

- secrets, credentials, tokens, and security-sensitive settings;
- DNS, hosting, deployment, and external account changes;
- production data or live integration writes;
- pricing, compliance, go-live, and release decisions;
- merges, releases, and public delivery.

Do not attempt to bypass these gates in code, docs, automation, or PR process.

Technical acceptance, merge approval, and release/deploy approval are separate decisions. ANANKE may record technical acceptance; Mads must explicitly approve merge; an authorized human must separately approve release/deploy. A green check or Themis Pass implies none of the later gates, and AI/agents do not grant them.

The repository is public under its existing license, but the long-term full-OSS vs open-core product model remains undecided; do not make licensing or packaging commitments in drive-by contributions.

## PR expectations

A good PR includes:

- a linked issue;
- a short summary of changed files;
- acceptance criteria status;
- verification output from the harness and any relevant tests;
- screenshots, logs, or browser notes when the change affects user-facing behavior;
- an explicit safety checklist for secrets, live integrations, hosting/deploy, production data, shop-floor scope, and merge/release boundaries.
- mechanically fillable exact-base/current-head/reviewed-head/CI identity and the three approval-gate states.

## Local verification

The default repo check is:

```bash
./scripts/maelk-harness-check.sh
```

When app/package tooling exists for the changed area, also run the relevant package checks, for example:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Do not claim a change is ready without fresh command output.
