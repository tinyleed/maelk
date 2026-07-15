# mælk

**Mælk** is a Denmark-first, open-source, AI-native ERP platform for commerce operations, with shop-floor/manufacturing execution out of scope.

Hosting/app status:

- No repo-root static website is maintained here anymore.
- Mælk v0 standard is a React Router v8 Framework SPA with TypeScript, Tailwind v4, shadcn/ui, a same-origin Node.js/Express API, and Supabase Auth/Postgres as the canonical auth/data target.
- Hosting is undecided. The current runnable shape is local Express serving `apps/app/build/client`; `mælk.com` / `xn--mlk-yla.com`, deploys, and external service projects remain human-gated.

Current product direction:

- canonical current goal: Denmark-first AI-native ERP platform for commerce operations;
- native double-entry accounting is mandatory from the first serious version, without claiming production accounting/legal readiness yet;
- one shared multi-tenant and multi-company core supports segments through tiers, permissions, configuration, and localization packs;
- Denmark leads the first localization pack; future countries should be added through explicit localization architecture rather than forks;
- full OSS vs open-core remains undecided; this repo stays public under the existing license while that product decision is open;
- product/PIM, suppliers, purchasing, inventory, sales/offers/orders, pricing, compliance, accounting foundations, channels, approvals, AI review, and readiness;
- hard boundary: no shop-floor app, work centers, labor/machine time, routing execution, or production operation tracking;
- Product Launch OS remains an existing fake-data-backed module/prototype, not the current platform goal or default next build lane;
- design language: lowercase `mælk`, `æ` as signature asset, cream/cocoa/caramel palette, sparse Milkglass controls.

Architecture entrypoint:

- [`architecture/maelk-erp-platform-goal-v1.md`](architecture/maelk-erp-platform-goal-v1.md)
- Historical context: [`architecture/maelk-operating-system-architecture-v0.md`](architecture/maelk-operating-system-architecture-v0.md)
- [`AGENTS.md`](AGENTS.md)
- [`.claude/rules/conventions-index.md`](.claude/rules/conventions-index.md)
- [`docs/spa-express-supabase-setup.md`](docs/spa-express-supabase-setup.md)

Original architecture rule:

> Build Mælk's own commerce operating model. Do not source-fork external products, copy schemas wholesale, or carry manufacturing execution assumptions into the system.

The old repo-root GitHub Pages prototype has been retired. Do not re-add `index.html`, `design-prototype-v0.html`, `CNAME`, `DNS.md`, or `.nojekyll` unless the hosting strategy is deliberately reopened.

## Open source

Mælk is public under the MIT license. Contributions should start with an issue, stay small enough for focused review, and include fresh output from `./scripts/maelk-harness-check.sh` plus `git diff --check`.

CI runs the same secret-free harness through GitHub Actions on pull requests and pushes to `main`.

Read [`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), and [`docs/maintainer-workflow.md`](docs/maintainer-workflow.md) before opening meaningful changes. Human approval remains required for secrets, DNS/hosting, deployment, production data, live integrations, pricing/compliance/go-live decisions, merges, and releases.
