# Phase C — Build & Verify (30 min)

Phases A and B must be complete.

## Tasks

### C.1 — Full gate sweep
```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm build
pnpm test
pnpm check:isolation
```

All six must pass. If anything fails:
- Route conflict between `app/page.tsx` and a route group → delete the tombstone
- Tailwind preflight vs `.uo-landing` CSS → add `@layer base, components, utilities, landing;` and move landing.css into `@layer landing`
- Font FOUT → verify `next/font/google` imports are in `app/layout.tsx`, not elsewhere
- Hydration warning on typing placeholder → `suppressHydrationWarning` on the `<input>`

### C.2 — Verify Andy's 7-item checklist
```bash
# Item 1 — admitos scan returns zero non-pipeline hits
grep -ri "admitos\|AdmitOS" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.env*" -l . | grep -v node_modules | grep -v .next | grep -v admitos-training-pipeline

# Item 3 — /contact-sales route exists
ls app/contact-sales/

# Item 4 — no stray "undecided" text
grep -rn "undecided" app/ --include="*.tsx"

# Item 5 — language switcher has zero DE references
grep -rn "'de'\|\"de\"\|German" app/ --include="*.tsx" --include="*.ts"

# Item 6 — pricing school limits present
grep -rn "Up to 5 schools\|Up to 12 schools" app/ --include="*.tsx"
```

Paste the outputs in the PR description.

### C.3 — Manual smoke test
- Landing loads on `localhost:3000` with `#0d2538` background
- Loading screen: green cat breathing animation
- All 13 animations from the master prompt QA checklist work
- Chat agent route (`/app/chat` or equivalent) uses the same `#0d2538`
- Theme toggle: dark ↔ light smooth transition
- Language switcher: 10 languages, no DE, non-EN "Coming soon"
- Pricing: Basic (5 schools) + Plus (12 schools) visible
- Contact Sales button routes to `/contact-sales`, not `/signin`
- No Adie FAB on landing
- No emoji anywhere

### C.4 — Lighthouse + axe
```bash
npx lighthouse http://localhost:3000 --preset=desktop --output=json --output-path=/tmp/lh-desktop.json
npx lighthouse http://localhost:3000 --form-factor=mobile --output=json --output-path=/tmp/lh-mobile.json
```
Target: Performance ≥ 85, Accessibility ≥ 95, axe violations = 0.

## End of Phase C

```bash
git add -A
git commit -m "chore(v2): Phase C — build green, all gates passing, QA checklist verified"
```

Report: "Phase C complete. All gates green. Lighthouse: perf X, a11y Y. Ready for Phase D (deploy)." Do not proceed automatically.
