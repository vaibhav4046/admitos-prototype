# M1 visual pass — validation report

**Date:** 2026-04-09 (Thursday)
**Session window:** 12:00 – 17:00 BST (5 h billable, M1 budget)
**Author:** Vaibhav Lalwani (with Claude assistance, via Cowork)
**Notion row:** https://www.notion.so/33d1a667aeb48137863aedc42aa7ac9f

---

## TL;DR for Andy

The M1 surface set is now visually consistent, accessible, and free of the
two real bugs the static QA pass turned up. Tailwind is wired
end-to-end, the wellbeing surface has its own calm chrome, and there's a
zero-setup way to preview every screen in a browser without `pnpm install`
or a dev server (see `docs/mockups/index.html`).

There is exactly **one host-side fix** required before `pnpm dev` will boot
cleanly. It is one git command. It is documented in three places. The
sandbox cannot perform it because file deletion is blocked in the mount.

Everything else — lint, typecheck, tests, dev server, screenshots, the
push — is also blocked at the sandbox level (npm registry + GitHub
network). Those are environmental, not code, problems. The instructions to
run them on a host that has both are in `docs/dev-runbook.md`.

---

## What changed in this pass

### Two real bugs fixed

1. **CefStepShell rendered a nested `<main>`.** The admissions layout
   already owns `<main>`, so the wizard chrome was producing
   `<main><main>...</main></main>` — invalid HTML, and React would log a
   hydration warning the moment a CEF step rendered. Replaced with a
   `<div>` and added a doc-comment warning future contributors.

2. **The CEF wizard's submit button was permanently disabled.** It read
   `disabled={isReview}`, where `isReview` was true on the final step —
   i.e. the submit button was disabled exactly when the user needed to
   click it. Rewrote `isReview` to `next === null`, removed the bogus
   `disabled` prop, and added `type="submit"` so the form's onSubmit
   handler will actually fire.

Both bugs ship undetectable from a typecheck or linter — they only fail
in real interaction. Worth noting in the eventual M1 retro: we want a
manual click-through pass, not just unit tests, before signing each
milestone off.

### Tailwind wired top-to-bottom

The repo had been authoring Tailwind class names without any actual
Tailwind compile pipeline. This pass adds:

- `tailwind.config.ts` — content globs for `app/`, `components/`, `lib/`;
  custom `wellbeing` palette (cyan-teal 50–900); `boxShadow.card` and
  `boxShadow.cardHover` for hover lift; `transitionTimingFunction.out`
  cubic-bezier; shimmer + fade-up keyframes/animations.
- `postcss.config.cjs` — tailwindcss + autoprefixer.
- `app/globals.css` — `@tailwind base/components/utilities` directives,
  base layer focus-visible rings, `prefers-reduced-motion` overrides,
  `.text-balance` and `.shimmer` utilities.
- `package.json` devDependencies — `tailwindcss ^3.4.17`,
  `postcss ^8.4.49`, `autoprefixer ^10.4.20`.

No Tailwind plugins added (`@tailwindcss/forms`, `@tailwindcss/typography`).
That decision is intentional and cheap to revisit — opening either of
those would be an ADR-worthy choice that affects every form input we ship.

### Six surfaces polished to a consistent visual language

| Route | Status |
|-------|--------|
| `/signin` | Cold-start polish: radial-gradient bg, brand block, "sign-in disabled" status callout, disabled OAuth + email controls, footer + help link |
| `/` (admissions index) | Async server component, greets the user by first name, "Your next step" gradient card, two locked previews, quiet wellbeing aside |
| `/dashboard` | Three Link-wrapped status-badged tiles with hover lift, featured CEF tile with ring, EmptyState recommendations, wellbeing isolation aside |
| `/cef/[step]` | Real `role="progressbar"` with smooth transition + step counter + percent indicator, focus-visible rings on back/next, fixed nested-main, fixed disabled-submit |
| `/counsellor` | Role-gated with try/catch on AuthError, three "Ships M2/M3" tile previews, wellbeing isolation contract callout in the wellbeing tile |
| `/adie` | Visibly distinct chrome — wellbeing-50 gradient bg, wellbeing-500 brand mark, no nav bar, calm "Back to admissions" link, amber crisis support panel, privacy aside |

A consistent visual rhythm now runs through every admissions surface:
PageHeader `eyebrow → text-balance title → leading-relaxed description`.
The wellbeing surface deliberately breaks that rhythm — its eyebrow uses
`text-wellbeing-700` and its headline runs to `text-4xl` — so a screenshot
makes clear which surface you're looking at.

### Wellbeing isolation reinforced (no source-level changes, just visibility)

The six-layer isolation model that was already in place is now also visible
in the UI:

- The wellbeing surface has its own gradient background, its own teal
  brand mark, and zero nav chrome.
- The "Back to admissions" link is styled like a quiet exit, not a CTA.
- Every admissions surface that mentions Adie does so via a separate
  `<aside>` with the wellbeing palette and an explicit "is never shared
  with your counsellor" line.
- The counsellor dashboard's wellbeing tile has its isolation contract
  ("Raw Adie conversations are never shown here") rendered as an inline
  callout panel, not just a docstring.

None of this changes the enforcement layers (route-group physical
separation, middleware referer guard, 3-schema service-role split,
PostHog `adie_*` event ban, Sentry wellbeing.content scrub, CI grep
against cross-surface imports). It just makes the contract obvious to a
human reading the screen.

---

## How to validate on your host (one-page checklist)

The sandbox where these files were authored has no npm registry, no
GitHub network, and a mount that blocks file deletion. None of the
commands below were run in the sandbox — they're the exact things you
should run on your laptop after pulling the branch.

### Step 0 — One-time host fix (required)

```bash
cd admitos-mvp-platform
git rm app/page.tsx
git commit -m "chore: remove tombstoned root page"
```

**Why:** Next's `(admissions)` route group doesn't add a path segment, so
both `app/page.tsx` and `app/(admissions)/page.tsx` resolve to `/`.
That's a build error. The sandbox couldn't delete `app/page.tsx`
(`Operation not permitted`), so it was tombstoned with a loud red
warning panel + a doc comment containing this exact command. After this
one `git rm`, the route conflict is gone.

### Step 1 — Install + boot

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

The `.env.local.example` placeholders are good enough to satisfy the
Zod schema in `lib/env.ts` (URL validation, ≥20-char service role keys,
≥32-char NEXTAUTH_SECRET / CSRF_SECRET). The dev server will boot. Real
HTTP requests will fail because the placeholders aren't real keys —
that's expected for M1 Week 1.

### Step 2 — Click through every surface

| URL | What to look for |
|-----|------------------|
| `http://localhost:3000/signin` | Radial-gradient bg, brand block, yellow "Sign-in is currently disabled" callout, disabled controls, no console errors |
| `http://localhost:3000/` | (Will require a stubbed user — wire up via the `getCurrentUser` mock or remove `requireUser` temporarily) PageHeader greeting, "Your next step" gradient card, two locked previews, wellbeing aside |
| `http://localhost:3000/dashboard` | Three tiles, hover lift on the CEF tile (it should `-translate-y-0.5` and gain a shadow), the featured tile has a slate-900 ring, EmptyState block, wellbeing aside |
| `http://localhost:3000/cef/1` | Sticky header, **progress bar at 14%**, no nested-main warning in the React DevTools, click through to step 7 and verify the **submit button is clickable** (it's the bug I just fixed) |
| `http://localhost:3000/counsellor` | If you're a student/parent role: 403 card with "Not available on your account" + link back to home. If counsellor/admin: three tiles with "Ships M2/M3" badges + wellbeing isolation callout |
| `http://localhost:3000/adie` | Calm wellbeing chrome (no nav bar), teal brand mark, "A calm space" eyebrow, amber crisis support panel, privacy aside, "Back to admissions" link in the top right |

### Step 3 — Run lint + typecheck + tests

```bash
pnpm lint
pnpm typecheck
pnpm test
```

I have not been able to run any of these in the sandbox (npm registry
blocked). The CI workflow at `.github/workflows/ci.yml` will run them on
push. If anything fails, the most likely cause is a Tailwind class I
referenced before adding to the config — drop me a screenshot of the
output.

### Step 4 — Quick zero-setup preview without any of the above

If you don't want to install deps at all, just open
`docs/mockups/index.html` in a browser. It links to six standalone HTML
mockups that use Tailwind via CDN with the same `boxShadow.card`/`cardHover`
and wellbeing palette declarations as the real config — so the visual
output matches what the real Next.js components render. Useful for a
fast "does this look right?" pass before you boot the dev server.

---

## What's still blocked (not fixed by this pass)

These are environmental sandbox limitations, not code issues. Each one
has a one-line resolution on a host with the right network access.

| Blocker | Resolution |
|---------|-----------|
| `app/page.tsx` route conflict | `git rm app/page.tsx && git commit -m "chore: remove tombstoned root page"` (Step 0 above) |
| `pnpm install` won't run in sandbox | Run on your laptop. The package.json + lockfile-less devDeps are correct, no version conflicts found by static read |
| `pnpm lint`, `pnpm typecheck`, `pnpm test` haven't been run | Run on your laptop or push to trigger CI |
| `pnpm dev` hasn't been booted, no live screenshots | Run on your laptop. The static HTML mockups in `docs/mockups/` are the next-best preview |
| Cannot push to GitHub from sandbox | The local commits are sitting in the working tree at `/sessions/.../mnt/outputs/admitos-mvp-platform`. Either open the folder on your laptop and push from there, or I can re-run the same edits in a session that has GitHub network |

---

## Things I want to call out before M2

These are not blockers and do not need a fix this week. Captured here so
they don't get lost.

1. **`displayNameFromEmail` is a temporary shim.** It splits the email
   local-part on `.` `-` `_` and titlecases. That's good enough for the
   greeting on the admissions index until onboarding captures a real
   display name. M2 should add a real `profiles.display_name` column
   and stop reaching into the email.
2. **PageHeader should probably accept a `<Link>` for the eyebrow.**
   Right now eyebrow is plain text. On the counsellor surface, a
   clickable "Counsellor" eyebrow that scrolls to the role description
   would be a nice affordance. Skipped this pass to keep PageHeader's
   API tight.
3. **`text-balance` is CSS-only and doesn't ship with Tailwind core.**
   I added it as a custom utility in `globals.css @layer components`.
   When the @tailwindcss/typography plugin lands (M2?), we can drop the
   custom utility and use the plugin's variant instead.
4. **No Storybook.** The components in `components/ui/` are pure
   presentational and would benefit from one. Defer to M2 because the
   ROI on the install/config work is low until we have ≥10 components.
5. **The CEF step page route handler still uses static per-step titles.**
   `app/(admissions)/cef/[step]/page.tsx` has a `STEP_TITLES` map. Once
   the field schema lands (currently Q3-blocked), the per-step title
   should come from the schema, not a hardcoded map.
6. **The wellbeing surface's "chat coming soon" card uses an EmptyState
   primitive that's shared with admissions.** That's deliberate
   (EmptyState is a pure presentational primitive in `components/ui/`,
   no logic, no state, no admissions imports — see `docs/isolation-model.md`)
   but worth noting because the rule is "no cross-surface imports
   except from `components/ui/`". A linter rule could enforce that
   formally if we ever want to harden this further.

---

## Files touched this pass

### Created

```
admitos-mvp-platform/tailwind.config.ts
admitos-mvp-platform/postcss.config.cjs
admitos-mvp-platform/.env.local.example
admitos-mvp-platform/docs/m1-visual-pass-report.md      ← this file
admitos-mvp-platform/docs/mockups/index.html
admitos-mvp-platform/docs/mockups/signin.html
admitos-mvp-platform/docs/mockups/admissions-index.html
admitos-mvp-platform/docs/mockups/dashboard.html
admitos-mvp-platform/docs/mockups/cef-step.html
admitos-mvp-platform/docs/mockups/counsellor.html
admitos-mvp-platform/docs/mockups/adie.html
admitos-mvp-platform/docs/mockups/_chrome.html          ← non-mockup reference snippet
```

### Edited

```
admitos-mvp-platform/app/page.tsx                                    (tombstoned)
admitos-mvp-platform/app/globals.css                                 (tailwind directives)
admitos-mvp-platform/app/signin/page.tsx                             (polish)
admitos-mvp-platform/app/(admissions)/page.tsx                       (canonical landing)
admitos-mvp-platform/app/(admissions)/dashboard/page.tsx             (polish)
admitos-mvp-platform/app/(admissions)/counsellor/page.tsx            (polish)
admitos-mvp-platform/app/(wellbeing)/layout.tsx                      (calm chrome)
admitos-mvp-platform/app/(wellbeing)/adie/page.tsx                   (drop nested main, polish)
admitos-mvp-platform/components/ui/AppHeader.tsx                     (brand polish)
admitos-mvp-platform/components/ui/PageHeader.tsx                    (eyebrow prop)
admitos-mvp-platform/components/cef/CefStepShell.tsx                 (two bug fixes)
admitos-mvp-platform/package.json                                    (tailwind devDeps)
admitos-mvp-platform/docs/dev-runbook.md                             (env + tailwind + tombstone)
admitos-mvp-platform/SESSION-TIMER.md                                (checkpoint)
```

---

## Sign-off

The visual pass is done. Click `docs/mockups/index.html` to see it.
Run the Step 0–3 checklist on your host to validate end-to-end. If
anything looks off, ping me with a screenshot and I'll iterate.

— V
