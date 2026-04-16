# Phase A — Setup & Blocking Fixes (30 min)

You are working in the `unioffer-mvp-platform` repo (aka `admitos-mvp-platform` folder locally). Andy Yu (CEO) blocked PR #2 and needs a visual redesign + 7 merge fixes. This phase handles the non-visual blocking items and pulls Andy's latest brand assets.

Read `CLAUDE-CODE-MASTER-PROMPT.md` sections 1–3 for full context before executing.

## Tasks — execute in order, commit after each

### A.0 — Pull latest brand assets
```bash
git status
git pull origin $(git branch --show-current)
```

Andy uploaded the final designer-made green cat logo on 16 Apr. Confirm it exists:
```bash
find . -path "*/node_modules" -prune -o \( -iname "*cat*" -o -iname "*logo*" -o -iname "*unioffer*" \) -type f -print | grep -v node_modules | grep -v .next | sort
```

Report the file paths back. If no green cat icon is present, STOP and tell the user to push/pull the designer assets.

### A.1 — Create redesign branch
```bash
git checkout -b feat/landing-page-v2 2>/dev/null || git checkout feat/landing-page-v2
```

### A.2 — Admitos grep scan (Item 1)
```bash
grep -ri "admitos\|AdmitOS" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" \
  --include="*.env*" -l . \
  | grep -v node_modules | grep -v .next | grep -v admitos-training-pipeline \
  > /tmp/admitos-scan.txt
cat /tmp/admitos-scan.txt
```
Fix every hit by renaming `admitos` → `unioffer`. Final scan must return zero lines. 11 hits in `admitos-training-pipeline/` are acceptable — keep them.

### A.3 — Create /contact-sales route (Item 3)
Use the snippet in `CLAUDE-CODE-MASTER-PROMPT.md` Section 2 Item 3 verbatim. File: `app/contact-sales/page.tsx`. Background `#0d2538`, accent `#7c3aed`.

### A.4 — Remove stray "undecided" text node (Item 4)
```bash
grep -rn "undecided" app/ --include="*.tsx" --include="*.ts" --include="*.jsx"
```
Delete every match in page-rendered content (leave any legitimate `undecided` state keys alone).

### A.5 — Language switcher (Item 5)
Replace the current language list with the exact 10-language priority order from Section 2 Item 5. Remove DE. All non-EN entries show "Coming soon" with `aria-disabled`.

### A.6 — Pricing school limits (Item 6)
Add to the Pricing feature lists:
- Basic: "Up to 5 schools (US or UK track)"
- Plus: "Up to 12 schools (US + UK dual track)"

### A.7 — Adie FAB suppression (Item 7)
Ensure the Adie FAB renders only when `user` (or equivalent auth state) is truthy. Verify it's hidden on `/` for logged-out visitors.

## End of Phase A

```bash
pnpm typecheck && pnpm lint
git add -A
git commit -m "chore(v2): Phase A — blocking fixes (grep scan, /contact-sales, lang switcher, pricing limits, Adie FAB, stray text)"
```

Then tell the user: "Phase A complete. Ready for Phase B (visual redesign)." Do not proceed to Phase B automatically.
