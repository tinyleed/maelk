---
description: Index of Mælk architecture conventions and rule files.
paths: ["apps/**", "packages/**", "architecture/**", ".claude/rules/**"]
---

# Mælk Conventions Index

Load the focused rule for the area being touched.
Canonical current goal: `architecture/maelk-erp-platform-goal-v1.md`.

| Area | Rule |
| --- | --- |
| Product/app/package overview | `project-overview.md` |
| Database, tenancy, audit, RLS | `conventions-database.md` |
| Service/data-access layer | `conventions-services.md` |
| Forms, validators, route actions | `conventions-forms.md` |
| UI/component system | `conventions-ui.md` |
| Commerce domain map | `commerce-domain-map.md` |
| Approval and AI gates | `approval-audit-system.md` |
| Agent loop, worker, review, harness | `agent-loop-guardrails.md` |
| Shop-floor boundary | `shop-floor-boundary.md` |

## Always-true architecture facts

- Mælk is a Denmark-first, open-source, AI-native ERP platform for commerce operations, not a source fork of another product.
- Mælk is ERP-grade, but it must not include shop-floor/manufacturing execution.
- Native double-entry accounting is mandatory from the first serious version; do not add finance schema/code or claim legal/accounting production readiness without a separate approved task.
- One shared multi-tenant and multi-company core supports segments through tiers, permissions, configuration, and localization packs.
- Current runnable stack is React Router v8 SPA + same-origin Node.js/Express API + Tailwind v4 + shadcn/ui, with Supabase Auth/Postgres as the canonical auth/data target.
- Denmark is the first localization target; future countries should be explicit localization packs.
- Product Launch OS is an existing fake-data-backed prototype/module, not the current platform goal or default next build lane.
- `companyId`, audit fields, approval reasons, and activity events are first-class.
- AI can draft/review/prepare; humans approve high-impact mutations.
- Retired GitHub Pages root files must remain absent unless a hosting strategy is explicitly reopened.
