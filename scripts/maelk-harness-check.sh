#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail() {
  echo "harness_fail: $*" >&2
  exit 1
}

require_file() {
  [[ -f "$1" ]] || fail "missing required file: $1"
}

require_dir() {
  [[ -d "$1" ]] || fail "missing required directory: $1"
}

require_file AGENTS.md
require_file CLAUDE.md
require_file architecture/maelk-erp-platform-goal-v1.md
require_file architecture/maelk-operating-system-architecture-v0.md
require_file architecture/product-launch-os-first-implementation-slice-v0.md
require_file architecture/agent-loop-governance-v0.md
require_file .claude/rules/agent-loop-guardrails.md
require_file .claude/rules/shop-floor-boundary.md
require_file ops/agent-harness/task-brief-template.md
require_file ops/agent-harness/themis-review-checklist.md
for retired_root_file in index.html design-prototype-v0.html CNAME DNS.md .nojekyll; do
  [[ ! -e "$retired_root_file" ]] || fail "retired root static-site file is still present: $retired_root_file"
done
require_dir apps/app
require_file apps/app/README.md
require_file apps/app/components.json
require_file apps/app/app/lib/client-safe-redirect.ts
require_file apps/app/app/lib/client-safe-redirect.test.ts
require_file apps/app/scripts/run-client-safe-redirect-tests.mjs
require_dir apps/api
require_file apps/api/package.json
require_file apps/api/.env.example
require_file apps/api/src/app.ts
require_file apps/api/src/api-app.ts
require_file apps/api/src/server.ts
require_file apps/api/src/worker.ts
require_file apps/api/test/app.test.mjs
require_file apps/api/test/postgres-session-store.integration.test.mjs
require_file docs/spa-express-supabase-setup.md
require_file docs/cloudflare-workers-preview.md
[[ ! -e docs/vercel-supabase-setup.md ]] || fail "stale Vercel setup doc is still present"
require_dir packages/database
require_dir packages/readiness
require_dir supabase
require_file supabase/config.toml
require_dir supabase/migrations
require_file supabase/migrations/20260721000100_auth_tenant_foundation_v0.sql
require_file supabase/tests/cross_tenant_rls_harness.sql
require_file scripts/check-worker-preview.mjs
require_file wrangler.jsonc

[[ ! -d apps/mes ]] || fail "forbidden apps/mes exists"

# Public repo framing guard: do not expose private inspiration source names in files.
if git grep --untracked -n -E 'Carbon|carbon|Carbon-inspired|Carbon-class|without-mes|without MES|apps/mes' -- . ':!scripts/maelk-harness-check.sh' >/tmp/maelk-public-framing-grep.txt; then
  cat /tmp/maelk-public-framing-grep.txt >&2
  fail "public inspiration/framing term found"
fi
rm -f /tmp/maelk-public-framing-grep.txt

GOAL_DOC="architecture/maelk-erp-platform-goal-v1.md"
for required_goal_text in \
  "Denmark-first" \
  "open-source" \
  "AI-native ERP platform" \
  "double-entry accounting" \
  "Multi-tenant and multi-company" \
  "localization packs" \
  "full OSS vs open-core" \
  "Product Launch OS" \
  "not the current platform goal" \
  "not the default next build lane" \
  "shop-floor"; do
  grep -Fq "$required_goal_text" "$GOAL_DOC" || fail "$GOAL_DOC missing required goal text: $required_goal_text"
done

if git grep --untracked -n -E 'The first product wedge is \*\*Product Launch OS\*\*|first wedge: \*\*Product Launch OS\*\*|First wedge: Product Launch OS|Product Launch OS remains the first wedge|The first wedge is \*\*Product Launch OS\*\*|First protected workflow surface|first Mælk Product Launch OS surface' -- \
  README.md AGENTS.md CONTRIBUTING.md docs apps ops .claude/rules ':!architecture/maelk-operating-system-architecture-v0.md' ':!architecture/product-launch-os-first-implementation-slice-v0.md' >/tmp/maelk-stale-product-launch-goal-grep.txt; then
  cat /tmp/maelk-stale-product-launch-goal-grep.txt >&2
  fail "stale Product Launch OS platform-goal wording found"
fi
rm -f /tmp/maelk-stale-product-launch-goal-grep.txt

echo "erp_platform_goal_doc_ok"

node scripts/check-stack-contract.mjs

echo "root_static_site_absent_ok"

PRODUCT_LAUNCH_JSON="apps/app/product-launch-os/product-launch-os.fake-data.json"
PRODUCT_LAUNCH_HTML="apps/app/product-launch-os/index.html"
PRODUCT_LAUNCH_SCRIPT="apps/app/product-launch-os/product-launch-os.js"

if [[ -d apps/app/product-launch-os ]]; then
  require_file apps/app/product-launch-os/README.md
  require_file "$PRODUCT_LAUNCH_HTML"
  require_file apps/app/product-launch-os/product-launch-os.css
  require_file "$PRODUCT_LAUNCH_SCRIPT"
  require_file "$PRODUCT_LAUNCH_JSON"

  if ! python3 -m json.tool "$PRODUCT_LAUNCH_JSON" >/tmp/maelk-product-launch-os.fake-data.json; then
    rm -f /tmp/maelk-product-launch-os.fake-data.json
    fail "malformed JSON: $PRODUCT_LAUNCH_JSON"
  fi
  rm -f /tmp/maelk-product-launch-os.fake-data.json

  python3 - "$PRODUCT_LAUNCH_JSON" <<'PY'
from pathlib import Path
import json
import sys

path = Path(sys.argv[1])
data = json.loads(path.read_text(encoding="utf-8"))

required_collections = {
    "companies",
    "users",
    "products",
    "skus",
    "suppliers",
    "supplierTerms",
    "costModels",
    "complianceRequirements",
    "channels",
    "launches",
    "launchGates",
    "approvals",
    "aiReviews",
    "activityEvents",
    "sourceLinks",
}
missing_collections = sorted(required_collections - set(data))
if missing_collections:
    raise SystemExit(f"{path}: missing collections: {', '.join(missing_collections)}")

for collection_name, records in data.items():
    if collection_name not in required_collections:
        raise SystemExit(f"{path}: unexpected collection: {collection_name}")
    if not isinstance(records, list):
        raise SystemExit(f"{path}: {collection_name} must be a list")
    for record in records:
        record_id = record.get("id", "<missing id>")
        for field in ["id", "createdBy", "createdAt"]:
            if field not in record:
                raise SystemExit(f"{path}: {collection_name}.{record_id} missing {field}")
        if collection_name != "companies" and "companyId" not in record:
            raise SystemExit(f"{path}: {collection_name}.{record_id} missing companyId")

gate_types = {"product", "supplier", "economics", "compliance", "channel", "inventory", "sales", "ai_review", "approval"}
events = data["activityEvents"]
for launch in data["launches"]:
    launch_gates = [gate for gate in data["launchGates"] if gate.get("launchId") == launch["id"]]
    found_gate_types = {gate.get("gateType") for gate in launch_gates}
    if found_gate_types != gate_types:
        missing = sorted(gate_types - found_gate_types)
        extra = sorted(found_gate_types - gate_types)
        raise SystemExit(f"{path}: {launch['id']} gate mismatch; missing={missing}; extra={extra}")
    for gate in launch_gates:
        has_gate_event = any(
            event.get("entityId") == gate["id"]
            and event.get("metadata", {}).get("launchId") == launch["id"]
            and event.get("metadata", {}).get("gateType") == gate["gateType"]
            for event in events
        )
        if not has_gate_event:
            raise SystemExit(f"{path}: {launch['id']}.{gate['gateType']} missing activity event")

for channel in data["channels"]:
    if channel.get("syncMode") != "disabled_fake_only":
        raise SystemExit(f"{path}: {channel['id']} has non-static syncMode")

for approval in data["approvals"]:
    if approval.get("status") in {"approved", "rejected"} and not approval.get("reason", "").strip():
        raise SystemExit(f"{path}: {approval['id']} is complete without a human reason")

print("product_launch_os_json_ok")
PY

  python3 - "$PRODUCT_LAUNCH_HTML" "$PRODUCT_LAUNCH_SCRIPT" <<'PY'
from html.parser import HTMLParser
from pathlib import Path
import sys

class StaticHTMLParser(HTMLParser):
    void_tags = {
        "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr",
    }

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_tags:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in self.void_tags:
            return
        if not self.stack:
            line, column = self.getpos()
            raise ValueError(f"unexpected closing </{tag}> at line {line}, column {column}")
        open_tag, (open_line, open_column) = self.stack.pop()
        if open_tag != tag:
            line, column = self.getpos()
            raise ValueError(
                f"mismatched closing </{tag}> at line {line}, column {column}; "
                f"expected </{open_tag}> for <{open_tag}> opened at line {open_line}, column {open_column}"
            )

    def close(self):
        super().close()
        if self.stack:
            open_tag, (line, column) = self.stack[-1]
            raise ValueError(f"unclosed <{open_tag}> opened at line {line}, column {column}")

html_path = Path(sys.argv[1])
script_path = Path(sys.argv[2])
html = html_path.read_text(encoding="utf-8")
script = script_path.read_text(encoding="utf-8")

parser = StaticHTMLParser()
try:
    parser.feed(html)
    parser.close()
except ValueError as exc:
    raise SystemExit(f"{html_path}: malformed HTML: {exc}") from exc

for needle in ["Product Launch OS", "product-launch-os.css", "product-launch-os.js"]:
    if needle not in html:
        raise SystemExit(f"{html_path}: missing {needle!r}")
for needle in [
    "product-launch-os.fake-data.json",
    "Readiness decision trace",
    "deriveDecisionTrace",
    "winningGate",
    "Next local-only action",
]:
    if needle not in script:
        raise SystemExit(f"{script_path}: missing {needle!r}")
for forbidden in ["Publish", "Sync inventory", "Send to supplier", "Approve go-live", "Change live price"]:
    if forbidden in html or forbidden in script:
        raise SystemExit(f"Product Launch OS static cockpit includes forbidden live-control label: {forbidden}")
print("product_launch_os_html_ok")
PY
else
  echo "product_launch_os_static_cockpit_absent_ok"
fi

if [[ -f package.json ]]; then
  if command -v npm >/dev/null 2>&1; then
    npm test --if-present
    npm run typecheck --if-present
    npm run lint --if-present
    npm run build --if-present
  else
    fail "package.json exists but npm is unavailable"
  fi
fi

git diff --check
git diff --cached --check
printf 'git_status=%s\n' "$(git status --short --branch | tr '\n' ' ' | sed 's/  */ /g')"
echo "maelk_harness_ok"
