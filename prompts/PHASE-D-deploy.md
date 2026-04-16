# Phase D — Deploy to Vercel (15 min)

Phases A, B, C must be complete and all gates green.

## Tasks

### D.1 — Push branch
```bash
git push origin HEAD
```

### D.2 — Deploy to Vercel
```bash
vercel deploy --no-wait 2>&1 | tee /tmp/vercel-deploy.log
PREVIEW_URL=$(grep -oE 'https://[a-z0-9-]+\.vercel\.app' /tmp/vercel-deploy.log | head -1)
echo "Preview: $PREVIEW_URL"
```

If `vercel deploy` fails:
- Login check: `vercel whoami` — if missing, run `vercel login`
- Project link: `vercel link` — attach to the unioffer-cowork project
- Retry

### D.3 — Smoke test the preview URL
Open the preview URL. Verify on the LIVE deployment:
- `#0d2538` body background (landing + chat agent)
- Green cat logo in nav
- All animations fire
- `/contact-sales` resolves
- No Adie FAB on landing
- OG image present (even if placeholder)

### D.4 — Static fallback (emergency)
If Next.js broke animations on Vercel but the prototype HTML works, fall back:
```bash
cp docs/prototypes/unioffer-landing.html public/landing-v2.html
cp docs/prototypes/unioffer-dashboard.html public/dashboard-v2.html
```
Add rewrites to `next.config.mjs` (see master prompt Section 11.3). Redeploy. A live URL with working animations beats a broken build.

## End of Phase D

Report: "Phase D complete. Preview URL: [URL]. Ready for Phase E (PR update)." Do not proceed automatically.
