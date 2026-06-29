---
description: Index of Mælk architecture conventions and rule files.
paths: ["apps/**", "packages/**", "architecture/**", ".claude/rules/**"]
---

# Mælk Conventions Index

Load the focused rule for the area being touched.

| Area | Rule |
| --- | --- |
| Product/app/package overview | `project-overview.md` |
| Database, tenancy, audit, RLS | `conventions-database.md` |
| Service/data-access layer | `conventions-services.md` |
| Forms, validators, route actions | `conventions-forms.md` |
| UI/component system | `conventions-ui.md` |
| Commerce domain map | `commerce-domain-map.md` |
| Approval and AI gates | `approval-audit-system.md` |
| Shop-floor boundary | `shop-floor-boundary.md` |

## Always-true architecture facts

- Mælk is a commerce/business operating system, not a source fork of another product.
- Mælk can be ERP-like, but it must not include shop-floor/manufacturing execution.
- Product Launch OS is the first wedge.
- `companyId`, audit fields, approval reasons, and activity events are first-class.
- AI can draft/review/prepare; humans approve high-impact mutations.
- Current GitHub Pages root files must remain stable until a hosting migration is explicitly planned.
