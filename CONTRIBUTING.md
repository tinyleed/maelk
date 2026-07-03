# Contributing to Mælk

Mælk is an early-stage commerce/business operating system. The first wedge is Product Launch OS: a calm, audit-first way to move products from idea to live while keeping humans in control of high-impact decisions.

This public repo is intentionally small and supervised. Please optimize for focused issues, small PRs, and verified changes rather than broad rewrites.

## Scope boundaries

In scope:

- commerce/business operating-system work;
- Product Launch OS and adjacent product, supplier, pricing, compliance, channel, approval, readiness, activity, and AI-review flows;
- docs, tests, harness checks, and repo-local automation that make changes safer.

Out of scope:

- shop-floor or manufacturing execution features;
- secrets, credentials, tokens, payment settings, production data, or live integration writes;
- DNS, hosting, deployment, branch protection, and external account changes without maintainer approval.

If a proposed change touches a boundary, open an issue first and wait for maintainer direction.

## Workflow

1. Open or find an issue before starting meaningful work.
2. Keep the PR small enough to review in one sitting.
3. Branch from `main` unless a maintainer asks otherwise.
4. Follow `AGENTS.md`, `architecture/`, and `.claude/rules/` before inventing new conventions.
5. Make the smallest coherent change that satisfies the issue acceptance criteria.
6. Run the harness before requesting review:

   ```bash
   ./scripts/maelk-harness-check.sh
   git diff --check
   ```

7. Paste relevant verification output into the PR body.

## Human approval gates

Contributors and agents may draft, analyze, test, and prepare changes. Maintainers or Mads/ANANKE must explicitly approve high-impact decisions, including:

- secrets, credentials, tokens, and security-sensitive settings;
- DNS, hosting, deployment, and external account changes;
- production data or live integration writes;
- pricing, compliance, go-live, and release decisions;
- merges, releases, and public delivery.

Do not attempt to bypass these gates in code, docs, automation, or PR process.

## PR expectations

A good PR includes:

- a linked issue;
- a short summary of changed files;
- acceptance criteria status;
- verification output from the harness and any relevant tests;
- screenshots, logs, or browser notes when the change affects user-facing behavior;
- an explicit safety checklist for secrets, live integrations, hosting/deploy, production data, shop-floor scope, and merge/release boundaries.

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
