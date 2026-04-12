# Wellbeing isolation model

> Single source of truth for **why** and **how** the AdmitOS wellbeing
> surface (Adie) is kept physically and logically separate from the
> admissions surface. If you're about to write code that crosses the
> two, read this first.

## Why this exists

AdmitOS ships two surfaces that live under the same domain but serve
very different purposes:

| Surface        | Route group         | Audience           | Data class                    |
|----------------|---------------------|--------------------|-------------------------------|
| Admissions     | `app/(admissions)/` | student, parent, counsellor, admin | PII (names, schools, essays) |
| Wellbeing      | `app/(wellbeing)/`  | student only        | PHI-adjacent (mental-health chat) |

A student using Adie expects their conversations to **never** influence
their admissions record, **never** appear in a counsellor dashboard,
and **never** be captured by product analytics. A small mistake — a
single `import { something } from "@/lib/admissions"` inside a wellbeing
file — is enough to turn that promise into a lie.

We therefore enforce isolation at **six** independent layers. No single
layer is the last line of defence; each catches a different class of
mistake. A regression has to slip past all six to actually ship.

## Layer 1 — Next.js route group layout isolation

`app/(admissions)/layout.tsx` and `app/(wellbeing)/layout.tsx` are
separate layout boundaries. Each can mount its own providers (PostHog,
Sentry scope, feature flags) without composing the other's providers.
Crucially, `(wellbeing)` does NOT mount PostHog at all — so a rogue
`capture()` call from a wellbeing component simply has no transport to
actually send the event.

**Where to look:** `app/(admissions)/layout.tsx`,
`app/(wellbeing)/layout.tsx`.

## Layer 2 — Middleware referer check

`middleware.ts` inspects every `/api/wellbeing/*` request and refuses
it if the `referer` header does not contain `/wellbeing/`. This blocks
the "admissions page JavaScript calls a wellbeing endpoint" class of
mistake — the cross-origin referer would be from `/dashboard` or
`/cef`, which the middleware treats as an isolation violation.

**Where to look:** `middleware.ts`, `tests/lib/middleware-namespace.test.ts`.

## Layer 3 — Three Supabase schemas, three service-role keys

The database lives in a single Supabase project but is carved into
three schemas:

- `admissions` — CEF, essays, ARE, counsellor notes, audit events
- `wellbeing` — Adie conversations, crisis flags, wellbeing audit events
- `commons_db` — user profiles, consent, tenant config

There is one service-role key per schema
(`SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS`, `..._WELLBEING`, `..._COMMONS`)
and the corresponding service clients in `lib/supabase/service-clients.ts`
are the only way to read or write each schema. An admissions worker
cannot accidentally SELECT from a wellbeing table because its service
role has no SELECT privileges on that schema. Enforced by Supabase RLS
at the database layer.

**Where to look:** `lib/supabase/service-clients.ts`,
`lib/supabase/types.ts`, `tests/lib/supabase-namespaces.test.ts`.

## Layer 4 — PostHog `adie_*` event name ban

`lib/observability/posthog.ts` wraps the `posthog-node` and `posthog-js`
clients in a `capture()` helper that **throws** if the event name
starts with `adie_`, `wellbeing_`, `crisis_`, or `mental_health_`.
`.eslintrc.cjs` refuses `from "posthog"` imports outside the wrapper.
A CI grep job (`wrapped-posthog-grep`) is the belt-and-braces layer on
top of the ESLint rule.

The registered event list itself lives in
`lib/observability/event-names.ts` and is unit-test pinned against the
same four prefix bans plus substring bans for `adie`, `wellbeing`,
`crisis`, and `mental.?health`.

**Where to look:** `lib/observability/posthog.ts`,
`lib/observability/event-names.ts`, `tests/lib/event-names.test.ts`,
`tests/lib/posthog.banned-events.test.ts`, `.eslintrc.cjs`.

## Layer 5 — Sentry `wellbeing.content` scrub

All three Sentry configs (`sentry.client.config.ts`,
`sentry.server.config.ts`, `sentry.edge.config.ts`) run a `beforeSend`
hook that strips any breadcrumb or event `extra` key matching
`wellbeing.content` or `adie.message.body`. The structured logger in
`lib/log/index.ts` does the same scrub before mirroring breadcrumbs
into Sentry, so even a stray `log.info("adie", { content: msg })` call
can't leak the chat body into observability.

`AdieMessagePayload` in the queues layer carries only `messageLength`
(an integer), never the body — the body is persisted to the wellbeing
schema and read back by the worker using the wellbeing service client.

**Where to look:** `sentry.*.config.ts`, `lib/log/index.ts`,
`src/db/queues/names.ts`, `src/workers/handlers/adie-message.ts`.

## Layer 6 — Cross-surface import ban (CI + local)

The newest layer. A GitHub Actions job (`cross-surface-imports`) and a
local bash script (`pnpm check:isolation`) scan every `.ts`/`.tsx`
file under the wellbeing surface for imports from `@/components/admissions`
or `@/lib/admissions`, and vice-versa for admissions files importing
`@/components/adie` or `@/lib/wellbeing`. `components/ui/` is
deliberately shared because its primitives are pure presentational
(they import only `cn`, React, and their own props).

**Where to look:** `.github/workflows/ci.yml` (job
`cross-surface-imports`), `scripts/check-isolation.sh`,
`package.json` (`check:isolation` script).

## What is allowed to be shared

Only `components/ui/` and the pure-utility modules in `lib/utils/`,
`src/api/_core/` (the response envelopes), `lib/observability/`
(through its wrapped helpers), and `src/services/audit/` (when the
`namespace` field is explicitly passed). Everything else — copy, chrome, service
clients, hooks, types that reference DB shapes — lives under either
`admissions` or `wellbeing` and does not cross the line.

A useful rule of thumb: **if the file needs to know which surface it's
serving in order to render correctly, it must live under that surface's
folder, not in a shared location.** `AppHeader.tsx` passed this test
(it takes nav and user as props and doesn't care which surface) and is
therefore allowed in `components/ui/`. `AdmissionsHeader.tsx` fails it
(the nav config and sign-out handler are admissions-specific) and
therefore lives in `components/admissions/`.

## If you need to add a new shared primitive

1. Can it be written without importing anything that says "admissions"
   or "adie" or "wellbeing"? If not, stop — build two separate
   primitives instead.
2. Does it take its copy and configuration as props? If not, refactor
   so it does.
3. Can you write a test for it under `tests/components/` in the plain
   Node vitest environment (no jsdom)? If not, extract the pure logic
   into a sibling file and test that.
4. Put it in `components/ui/` and document it there. Add an entry to
   this file under "What is allowed to be shared" if it's non-obvious.

## If a CI layer fires

Treat an isolation-layer failure the same way you treat a failed test:
it is telling you the invariant is broken, not that the check is wrong.
**Do not modify the check to make it pass** without an explicit
architectural discussion. The checks are narrow on purpose — they only
fire on genuinely unsafe imports. If you disagree with a specific
decision, open an ADR in `docs/decisions.md` first.
