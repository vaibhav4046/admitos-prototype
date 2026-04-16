# Phase E — Update PR #2 (15 min)

Phases A–D must be complete and preview URL working.

## Tasks

### E.1 — Update PR description
Use the PR description template in `CLAUDE-CODE-MASTER-PROMPT.md` Section 12 Phase E. Substitute:
- `[PREVIEW_URL]` → the Vercel preview URL from Phase D
- `[PASTE SCAN OUTPUT]` → the admitos grep scan output (should be empty)
- Lighthouse scores from Phase C

```bash
gh pr edit 2 --body "$(cat <<'PREOF'
## Preview

**Landing page:** https://YOUR-PREVIEW.vercel.app
**Chat agent:** https://YOUR-PREVIEW.vercel.app/app/chat

## Andy's 7-Item Merge Checklist

- [x] Repo rename scan — zero admitos/AdmitOS matches outside pipeline. 11 pipeline hits deferred.
- [x] Visual redesign — V2 prototype converted. No emoji. Libre Baskerville + Inter. Manus.im-level spacing. `#0d2538` canonical night bg (landing + chat agent).
- [x] Contact Sales → /contact-sales (NOT /signin).
- [x] 'undecided' text node removed.
- [x] Language switcher — DE removed, 10-language priority order, Coming soon on non-EN.
- [x] Pricing school limits — Basic up to 5, Plus up to 12.
- [x] Adie FAB suppressed on unauthenticated landing.

## Andy's 8 Answered Questions

1. Routes: / landing, /app dashboard ✓
2. Repo rename: grep scan below ✓
3. GA4: new property for unioffer.ai (TODO comment added) ✓
4. OG image: green cat + wordmark on #0d2538, placeholder deployed pending approval ✓
5. Pipeline rename: 11 hits deferred to dedicated PR ✓
6. V3.1 copy: final, school limits added ✓
7. Credits: Path B documented as Week 3 scope ✓
8. Languages: 10-language order, DE removed ✓

## Brand Treatment (global)
- Canonical night bg: `#0d2538` (sampled from Andy's logo plate)
- Green cat icon — nav, footer, loading screen, favicons
- Old UO monogram and navy-red wordmark removed
- Landing and chat agent both use `#0d2538` — matches logo plate exactly

## Animations — all 13 live, GPU-accelerated, 120fps target
Loading (cat breathing) · page reveal · typing placeholder · scroll reveals (staggered) · SVG flow lines · section line draw · composer shimmer · card hover · timeline glow · pricing border rotation · theme toggle · CTA pulse · ambient orbs · sticky nav blur · dashboard skeleton · dashboard card entry.

## Validation
- Lighthouse Performance (desktop): XX
- Lighthouse Performance (mobile): XX
- Lighthouse Accessibility: XX
- axe violations: 0
- Tests: 345/345 green
- All CI gates pass

## Grep Scan — zero admitos/AdmitOS hits outside pipeline
```
[paste /tmp/admitos-scan.txt here]
```

## Deferred
- admitos-training-pipeline/ rename → dedicated PR
- Post-registration flow → next session
- OG image final → pending Andy approval
- GA4 property → post-launch
- Credits tables → Week 3 Path B
PREOF
)"
```

### E.2 — Flip PR to ready for review
```bash
gh pr ready 2
```

### E.3 — Notify Andy
Tell the user Phase E is complete and suggest they send Andy:

> "Phase A–E complete. Preview at [URL]. PR #2 ready for review. All 7 checklist items done, canonical #0d2538 bg applied to landing + chat agent. Your call on merge."

## End of Phase E

Report: "Phase E complete. PR #2 flipped to ready for review. [preview URL]." Stop here.
