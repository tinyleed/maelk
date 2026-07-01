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
require_file architecture/maelk-operating-system-architecture-v0.md
require_file architecture/agent-loop-governance-v0.md
require_file .claude/rules/agent-loop-guardrails.md
require_file .claude/rules/shop-floor-boundary.md
require_file ops/agent-harness/task-brief-template.md
require_file ops/agent-harness/themis-review-checklist.md
require_file index.html
require_file design-prototype-v0.html
require_file CNAME
require_file .nojekyll
require_dir apps/app
require_file apps/app/README.md
require_file apps/app/product-launch-os/README.md
require_file apps/app/product-launch-os/index.html
require_file apps/app/product-launch-os/product-launch-os.css
require_file apps/app/product-launch-os/product-launch-os.js
require_file apps/app/product-launch-os/product-launch-os.fake-data.json
require_dir packages/database
require_dir packages/readiness

[[ ! -d apps/mes ]] || fail "forbidden apps/mes exists"

# Public repo framing guard: do not expose private inspiration source names in files.
if git grep --untracked -n -E 'Carbon|carbon|Carbon-inspired|Carbon-class|without-mes|without MES|apps/mes' -- . ':!scripts/maelk-harness-check.sh' >/tmp/maelk-public-framing-grep.txt; then
  cat /tmp/maelk-public-framing-grep.txt >&2
  fail "public inspiration/framing term found"
fi
rm -f /tmp/maelk-public-framing-grep.txt

python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
for name in ["index.html", "design-prototype-v0.html"]:
    text = Path(name).read_text(encoding="utf-8")
    HTMLParser().feed(text)
    for needle in ["Mælk samler commerce fra idé til live.", "Commerce operating system", "Product Launch OS", "button-fluid"]:
        if needle not in text:
            raise SystemExit(f"{name}: missing {needle!r}")
print("html_ok")
PY

PRODUCT_LAUNCH_JSON="apps/app/product-launch-os/product-launch-os.fake-data.json"
PRODUCT_LAUNCH_HTML="apps/app/product-launch-os/index.html"
PRODUCT_LAUNCH_SCRIPT="apps/app/product-launch-os/product-launch-os.js"

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

if [[ -f package.json ]]; then
  if command -v npm >/dev/null 2>&1; then
    npm test --if-present
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
