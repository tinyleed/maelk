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
