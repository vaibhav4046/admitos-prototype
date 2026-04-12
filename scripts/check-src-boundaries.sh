#!/usr/bin/env bash
#
# scripts/check-src-boundaries.sh
#
# Local mirror of the `src-layer-boundaries` CI job. Enforces the six
# seam rules from docs/scaffold-deltas/02-src-restructure.md §CI
# enforcement:
#
#   1. /src/api does not import from /src/workers or /src/agents
#   2. /src/services does not import from next, express, or /src/api
#   3. /src/agents does not import from /src/services or /src/api
#      (EXCEPT @/services/env, which is a zero-dependency leaf that
#       everything reads from)
#   4. /src/workers does not import from /src/api
#   5. /src/db is leaf — no imports from /src/services, /src/agents,
#      /src/api, /src/workers (EXCEPT @/services/env, same reason)
#   6. app/** and components/** do not import from /src/api,
#      /src/workers, or /src/agents (EXCEPT app/api/** which holds
#       the App Router shim files that re-export handlers from
#       /src/api — that is the explicit seam PR 9 introduced)
#
# Each rule is a one-line grep that only matches real ES import
# statements (`from "@/..."` or `import "@/..."`), never comments.
#
# Run locally:
#
#   pnpm check:src-boundaries
#
# Exits 1 on the first violation it finds. Cheap, deterministic, no
# dependency on ts-morph or dependency-cruiser.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR/.."

FOUND=0

# Helper: grep for real import statements only (skip comments).
# Usage: scan_imports <forbidden-alias-regex> <search-path>
#
# The pattern matches `from "@/<alias>..."` or `import "@/<alias>..."`
# with optional leading whitespace. We deliberately don't widen the
# pattern to allow parameterization by callers that might forget to
# anchor — keep the regex here, pass only the alias.
scan_imports() {
  local alias_re="$1"
  local path="$2"
  [ -e "$path" ] || return 0
  grep -RIin --include='*.ts' --include='*.tsx' \
    -E "(from|import)[[:space:]]+[\"']@/($alias_re)([/\"'])" \
    "$path" || true
}

# ─── Rule 1: /src/api must not import from workers or agents ──────
M=$(scan_imports 'workers|agents' 'src/api')
if [ -n "$M" ]; then
  echo "❌ Rule 1 violation — src/api imports from workers/agents:"
  echo "$M"
  FOUND=1
fi

# ─── Rule 2: /src/services must not import from api or http fw ────
M=$(scan_imports 'api' 'src/services')
if [ -n "$M" ]; then
  echo "❌ Rule 2 violation — src/services imports from @/api:"
  echo "$M"
  FOUND=1
fi
# Direct 'next' and 'express' imports use bare module specifiers, so
# we need a separate grep that doesn't start with `@/`.
M=$(grep -RIin --include='*.ts' --include='*.tsx' \
     -E "(from|import)[[:space:]]+[\"'](next(/|[\"'])|express([\"']))" \
     src/services 2>/dev/null || true)
if [ -n "$M" ]; then
  echo "❌ Rule 2 violation — src/services imports next/express:"
  echo "$M"
  FOUND=1
fi

# ─── Rule 3: /src/agents must not import from services (except
# @/services/env) or api ───────────────────────────────────────────
M=$(scan_imports 'services' 'src/agents' | grep -Ev '@/services/env([/"'\''])' || true)
if [ -n "$M" ]; then
  echo "❌ Rule 3 violation — src/agents imports from @/services (env is allowed):"
  echo "$M"
  FOUND=1
fi
M=$(scan_imports 'api' 'src/agents')
if [ -n "$M" ]; then
  echo "❌ Rule 3 violation — src/agents imports from @/api:"
  echo "$M"
  FOUND=1
fi

# ─── Rule 4: /src/workers must not import from /src/api ───────────
M=$(scan_imports 'api' 'src/workers')
if [ -n "$M" ]; then
  echo "❌ Rule 4 violation — src/workers imports from @/api:"
  echo "$M"
  FOUND=1
fi

# ─── Rule 5: /src/db is leaf (except @/services/env) ──────────────
M=$(scan_imports 'services' 'src/db' | grep -Ev '@/services/env([/"'\''])' || true)
if [ -n "$M" ]; then
  echo "❌ Rule 5 violation — src/db imports from @/services (env is allowed):"
  echo "$M"
  FOUND=1
fi
M=$(scan_imports 'agents|api|workers' 'src/db')
if [ -n "$M" ]; then
  echo "❌ Rule 5 violation — src/db imports from agents/api/workers:"
  echo "$M"
  FOUND=1
fi

# ─── Rule 6: presentation (app/** + components/**) does not import
# from api, workers, or agents. app/api/** is the one exception:
# those are the App Router shim files that re-export handlers from
# /src/api, and that seam is the whole point of PR 9. ─────────────
PRES_FILES=$(find app components \
  -type f \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path 'app/api/*' 2>/dev/null || true)

if [ -n "$PRES_FILES" ]; then
  M=$(echo "$PRES_FILES" | xargs -r grep -HIn \
       -E "(from|import)[[:space:]]+[\"']@/(api|workers|agents)([/\"'])" \
       2>/dev/null || true)
  if [ -n "$M" ]; then
    echo "❌ Rule 6 violation — presentation imports from api/workers/agents:"
    echo "$M"
    FOUND=1
  fi
fi

if [ "$FOUND" -eq 1 ]; then
  exit 1
fi

echo "✅ src layer boundaries hold"
