# Product Launch OS first implementation slice v0

Status: plan gate, not implemented
Date: 2026-06-29
Task: `t_b6a013be`

## Task restatement

Draft the first repo-local implementation plan for Product Launch OS after Themis passed the harness proof, without implementing the app slice yet.

## Done condition for this plan

This plan is complete when it gives the next builder exact repo files, fake data shape, verification commands, and no-live-integration boundaries for the first Product Launch OS build slice.

## Slice goal

Create the smallest visible Product Launch OS proof inside the repo:

```text
fake launch records
→ derived launch gate readiness
→ AI review summary stub
→ human approval reason requirement
→ activity/audit timeline
→ one static launch cockpit surface
```

The slice should prove Mælk's operating loop without adding live integrations, credentials, production data, deployment, package dependencies, or framework decisions.

## Non-goals

Do not implement in this plan task.

The follow-on build slice must not:

- touch root live-site files: `index.html`, `design-prototype-v0.html`, `CNAME`, `.nojekyll`;
- add credentials, `.env` files, secrets, DNS, hosting, payments, deploys, or live integration writes;
- publish to channels or send external supplier/customer messages;
- mutate inventory, accounting, pricing, compliance, or go-live state outside fake data;
- introduce shop-floor/manufacturing execution scope;
- add dependencies, package manager decisions, or app framework scaffolding without explicit ANANKE approval.

## Exact files for the follow-on implementation slice

Create or update only these files unless ANANKE expands scope:

```text
apps/app/README.md
apps/app/product-launch-os/README.md
apps/app/product-launch-os/index.html
apps/app/product-launch-os/product-launch-os.css
apps/app/product-launch-os/product-launch-os.js
apps/app/product-launch-os/product-launch-os.fake-data.json
scripts/maelk-harness-check.sh
```

Optional only if the follow-on task explicitly approves package/app tooling:

```text
package.json
tsconfig.json
apps/app/app/modules/launches/launches.models.ts
apps/app/app/modules/launches/launches.fixtures.ts
apps/app/app/modules/launches/launches.readiness.ts
apps/app/app/modules/launches/launches.readiness.test.ts
apps/app/app/modules/launches/ui/ProductLaunchCockpit.tsx
```

If package/app tooling is not explicitly approved, stay with the dependency-free static files above.

## Static cockpit requirements

`apps/app/product-launch-os/index.html` should be a repo-local prototype page, not a deployed public landing page. It should load the adjacent CSS/JS and fake JSON using relative paths.

The page should show one selected launch and a short list of seeded launches:

- launch title, owner, target channel, target date, and current state;
- readiness gates grouped by product, supplier, economics, compliance, channel, inventory, sales, AI review, and approval;
- blockers and next safe action;
- AI review summary as advisory/stub output only;
- approval gate showing that a human reason is required before approval/rejection;
- activity/audit timeline showing state changes and review notes;
- no live publish/send/sync controls.

Allowed button labels are local/prototype-only, for example:

```text
View launch
Draft approval note
Mark fake reason entered
```

Do not add buttons such as:

```text
Publish
Sync inventory
Send to supplier
Approve go-live
Change live price
```

## Fake data shape

Use fake, internal, non-customer records only. IDs should be stable strings with short prefixes. Every tenant-owned record includes `companyId`, `createdBy`, and `createdAt`.

`apps/app/product-launch-os/product-launch-os.fake-data.json` should follow this shape:

```json
{
  "companies": [
    {
      "id": "co_demo_maelk",
      "name": "Mælk Demo Company",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:00:00Z"
    }
  ],
  "users": [
    {
      "id": "usr_ops_lead",
      "companyId": "co_demo_maelk",
      "name": "Launch lead",
      "role": "commerce_operator",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:00:00Z"
    }
  ],
  "products": [
    {
      "id": "prd_oat_barista",
      "companyId": "co_demo_maelk",
      "name": "Oat Barista 1L",
      "status": "draft",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:05:00Z"
    }
  ],
  "skus": [
    {
      "id": "sku_oat_barista_1l",
      "companyId": "co_demo_maelk",
      "productId": "prd_oat_barista",
      "code": "OAT-BARISTA-1L",
      "variantName": "1L carton",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:06:00Z"
    }
  ],
  "suppliers": [
    {
      "id": "sup_nordic_demo",
      "companyId": "co_demo_maelk",
      "name": "Nordic Demo Supplier",
      "status": "review_needed",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:07:00Z"
    }
  ],
  "supplierTerms": [
    {
      "id": "st_oat_barista_initial",
      "companyId": "co_demo_maelk",
      "supplierId": "sup_nordic_demo",
      "productId": "prd_oat_barista",
      "currency": "DKK",
      "unitCost": 11.2,
      "moq": 480,
      "leadTimeDays": 21,
      "status": "draft",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:08:00Z"
    }
  ],
  "costModels": [
    {
      "id": "cost_oat_barista_launch",
      "companyId": "co_demo_maelk",
      "productId": "prd_oat_barista",
      "currency": "DKK",
      "unitCost": 11.2,
      "targetSellPrice": 24.95,
      "estimatedGrossMarginPct": 55,
      "status": "needs_human_review",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:09:00Z"
    }
  ],
  "complianceRequirements": [
    {
      "id": "comp_oat_label_review",
      "companyId": "co_demo_maelk",
      "productId": "prd_oat_barista",
      "requirementType": "label_review",
      "status": "blocked",
      "missingEvidence": ["final ingredient list", "allergen statement"],
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:10:00Z"
    }
  ],
  "channels": [
    {
      "id": "chn_demo_webshop",
      "companyId": "co_demo_maelk",
      "name": "Demo webshop draft",
      "channelType": "webshop",
      "syncMode": "disabled_fake_only",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:11:00Z"
    }
  ],
  "launches": [
    {
      "id": "lnch_oat_barista_q3",
      "companyId": "co_demo_maelk",
      "productId": "prd_oat_barista",
      "ownerId": "usr_ops_lead",
      "targetChannelId": "chn_demo_webshop",
      "targetLaunchDate": "2026-09-01",
      "status": "review",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:12:00Z"
    }
  ],
  "launchGates": [
    {
      "id": "gate_oat_compliance",
      "companyId": "co_demo_maelk",
      "launchId": "lnch_oat_barista_q3",
      "gateType": "compliance",
      "status": "blocked",
      "blockers": ["final ingredient list missing", "allergen statement missing"],
      "requiredApprovalId": "appr_oat_compliance",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:13:00Z"
    }
  ],
  "approvals": [
    {
      "id": "appr_oat_compliance",
      "companyId": "co_demo_maelk",
      "entityType": "launchGate",
      "entityId": "gate_oat_compliance",
      "action": "approve_compliance_readiness",
      "status": "requested",
      "riskSummary": "Label evidence is incomplete; human compliance approval cannot be granted yet.",
      "reason": "",
      "requestedBy": "usr_ops_lead",
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:14:00Z"
    }
  ],
  "aiReviews": [
    {
      "id": "air_oat_launch_review",
      "companyId": "co_demo_maelk",
      "launchId": "lnch_oat_barista_q3",
      "summary": "Launch is promising but blocked by compliance evidence and human cost review.",
      "flags": ["missing compliance evidence", "approval reason required"],
      "preparedActions": ["draft approval checklist", "summarize missing fields"],
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:15:00Z"
    }
  ],
  "activityEvents": [
    {
      "id": "evt_oat_gate_blocked",
      "companyId": "co_demo_maelk",
      "entityType": "launchGate",
      "entityId": "gate_oat_compliance",
      "actorId": "usr_ops_lead",
      "action": "gate_marked_blocked",
      "metadata": { "blockerCount": 2 },
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:16:00Z"
    }
  ],
  "sourceLinks": [
    {
      "id": "src_oat_supplier_quote",
      "companyId": "co_demo_maelk",
      "entityType": "supplierTerm",
      "entityId": "st_oat_barista_initial",
      "label": "Fake supplier quote note",
      "sourceType": "internal_note",
      "url": null,
      "createdBy": "usr_ops_lead",
      "createdAt": "2026-06-29T10:17:00Z"
    }
  ]
}
```

The follow-on build may add 2-3 more launches to demonstrate ready, blocked, and needs-review states, but it should not expand beyond the object families above.

## Readiness and approval behavior

`product-launch-os.js` should derive UI state from fake records, not from a single manual `ready=true` flag.

Gate status vocabulary:

```text
ready
needs_review
blocked
not_started
```

A launch is display-ready only when all of these are true in fake data:

- product and SKU records exist;
- supplier terms exist and are not blocked;
- cost model has a target price and human review status;
- compliance requirements have evidence or explicit blocker text;
- target channel exists with `syncMode: "disabled_fake_only"`;
- any high-impact approval has a non-empty `reason` before approved/rejected UI state is shown;
- an activity event exists for each displayed gate transition;
- AI review is advisory and cannot approve anything.

## Verification for the follow-on build

Minimum commands:

```bash
git status --short && git status --branch --short
python3 -m json.tool apps/app/product-launch-os/product-launch-os.fake-data.json >/tmp/maelk-product-launch-os.fake-data.json
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
for path in [Path('apps/app/product-launch-os/index.html')]:
    HTMLParser().feed(path.read_text(encoding='utf-8'))
print('product_launch_os_html_ok')
PY
./scripts/maelk-harness-check.sh
git diff --check
```

`./scripts/maelk-harness-check.sh` should be updated in the follow-on build so the new fake JSON and static HTML checks run automatically.

If, and only if, package scripts are added with explicit approval, also run:

```bash
npm test
npm run lint
npm run build
```

## Acceptance criteria for the follow-on build

- Only the exact follow-on files are touched, unless ANANKE expands scope.
- Root GitHub Pages files remain untouched and still parse through the harness.
- The cockpit is backed by fake JSON records with `companyId` and audit fields.
- Readiness is derived from gates, blockers, approvals, evidence, and sync state.
- AI review is shown as a draft/review aid only.
- Human approval/rejection cannot be represented as complete without a non-empty reason.
- No live integration, publish, supplier send, inventory sync, accounting, price mutation, credential, deployment, DNS, or payment behavior exists.
- No shop-floor/manufacturing execution terms or flows are introduced.
- Harness output includes `html_ok`, `product_launch_os_html_ok`, git status, and `maelk_harness_ok`.

## Review gate

This plan should go through ANANKE/Themis review before the follow-on build task is created. The follow-on build should also be reviewed before acceptance because it creates the first visible Product Launch OS surface.
