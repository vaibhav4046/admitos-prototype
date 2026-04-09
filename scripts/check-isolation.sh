#!/usr/bin/env bash
#
# scripts/check-isolation.sh
#
# Local mirror of the `cross-surface-imports` CI job. Run this before
# pushing a branch that touches either route group — it's much faster
# than waiting for CI to fail and tells you exactly which file broke
# the rule.
#
#   pnpm check:isolation
#
# The rule: files under `app/(wellbeing)/`, `components/adie/`,
# `lib/wellbeing/`, or the adie-message worker handler must not
# import from `@/components/admissions` or `@/lib/admissions`, and
# files under the admissions surface must not import from
# `@/components/adie` or `@/lib/wellbeing`. `components/ui/` is the
# shared primitive set and is deliberately allowed in both.
#
# Exits 1 on the first violation it finds.

set -euo pipefail

# Resolve repo root from wherever the script is called.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR/.."

FOUND=0

# ─── wellbeing → admissions leakage ───────────────────────────────
WELLBEING_PATHS=(
  "app/(wellbeing)"
  "components/adie"
  "lib/wellbeing"
  "workers/handlers/adie-message.ts"
)
BAD_ADMISSIONS_PATTERN='@/components/admissions|@/lib/admissions'

for p in "${WELLBEING_PATHS[@]}"; do
  [ -e "$p" ] || continue
  M=$(grep -RIin --include='*.ts' --include='*.tsx' -E "$BAD_ADMISSIONS_PATTERN" "$p" || true)
  if [ -n "$M" ]; then
    echo "❌ Wellbeing surface is importing admissions chrome:"
    echo "$M"
    echo
    echo "   Fix: extract the shared primitive into components/ui/, or"
    echo "   build a wellbeing-specific version under components/adie/."
    FOUND=1
  fi
done

# ─── admissions → wellbeing leakage ───────────────────────────────
ADMISSIONS_PATHS=(
  "app/(admissions)"
  "components/admissions"
  "components/cef"
  "lib/admissions"
)
BAD_WELLBEING_PATTERN='@/components/adie|@/lib/wellbeing'

for p in "${ADMISSIONS_PATHS[@]}"; do
  [ -e "$p" ] || continue
  M=$(grep -RIin --include='*.ts' --include='*.tsx' -E "$BAD_WELLBEING_PATTERN" "$p" || true)
  if [ -n "$M" ]; then
    echo "❌ Admissions surface is importing wellbeing chrome:"
    echo "$M"
    echo
    echo "   Fix: wellbeing copy and chrome are governed by a separate"
    echo "   privacy policy and never belong on an admissions page."
    FOUND=1
  fi
done

if [ "$FOUND" -eq 1 ]; then
  exit 1
fi

echo "✅ no cross-surface imports"
