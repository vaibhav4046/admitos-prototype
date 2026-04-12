# Dev runbook

> How to boot the AdmitOS MVP locally. Read this once before your
> first run; after that the `pnpm dev` shortcut is enough.

## Prereqs

- Node 20.x (use `nvm use` — `.nvmrc` is checked in)
- pnpm 9.x
- Docker (for the Supabase emulator)
- Redis 7.x (the BullMQ workers connect to a local Redis)

## First-time setup

```sh
pnpm install
cp .env.local.example .env.local
# Fill in the values — see "Env vars" below. The placeholders that
# ship in .env.local.example satisfy the Zod schema in lib/env.ts so
# `pnpm dev` will boot, but no real backend call will succeed until
# you replace them.

pnpm db:reset       # bring up the local Supabase emulator + run migrations
pnpm dev            # start Next.js on http://localhost:3000
pnpm worker         # in a second terminal — start the BullMQ workers
```

### Tailwind / PostCSS

Tailwind 3.4 is wired through `tailwind.config.ts` + `postcss.config.cjs`,
and the `@tailwind base/components/utilities` directives live in
`app/globals.css`. The dev deps (`tailwindcss`, `postcss`, `autoprefixer`)
are declared in `package.json` and will be installed by `pnpm install`.
The `content` glob in the Tailwind config covers `app/**`, `components/**`
and `lib/**` — including the bracketed route group folders. If you add a
new top-level folder that contains JSX, extend the glob.

### One-time host fix — remove the tombstoned root page

The M1 scaffold was generated in a sandbox that could not delete files.
As a result, both `app/page.tsx` and `app/(admissions)/page.tsx` ship in
the repo, and both resolve to the URL `/`. Next.js will refuse to build
with a "parallel pages" error until you remove the older one:

```sh
git rm app/page.tsx
git commit -m "chore: remove tombstoned root page"
```

`app/(admissions)/page.tsx` is the canonical student landing — `app/page.tsx`
contains a loud red "TOMBSTONE — DELETE THIS FILE" notice for exactly this
reason. After removal, `/` resolves to the admissions index page rendered
inside the admissions layout (with the `AdmissionsHeader` and the namespace
chrome).

## Env vars

Every required var is documented in `.env.example`. The Zod schema in
`lib/env.ts` validates the env at import time, so a missing var fails
loud at boot rather than silently at runtime.

A few notes:

- `SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS`,
  `SUPABASE_SERVICE_ROLE_KEY_WELLBEING`, and
  `SUPABASE_SERVICE_ROLE_KEY_COMMONS` are *separate* keys even though
  the M1 Q3 default puts all three schemas in one Supabase project.
  This is what makes the Q3 fork to two projects a one-file change.
- `REDIS_URL` is the standard `redis://` URL. BullMQ cannot use the
  Upstash REST URL — that's only for one-shot Redis operations.
- **`DEEPSEEK_*` env vars will throw at boot.** They are permanently
  banned. See `lib/env.ts` for the check.

## Smoke tests

After `pnpm dev` is running:

```sh
curl http://localhost:3000/api/admissions/health
curl -H "Referer: http://localhost:3000/wellbeing/" \
  http://localhost:3000/api/wellbeing/health
```

The wellbeing health check requires the `Referer` header — the
middleware in `middleware.ts` rejects wellbeing API requests whose
referer doesn't contain `/wellbeing/`. This is the same isolation
guard that runs in production.

## Tests + evals

```sh
pnpm test           # vitest unit tests
pnpm test:evals     # LLM-as-Judge runs against tests/evals/*.eval.json
```

The eval runner needs the prompt rows seeded in the local Supabase
emulator. If they aren't, the run is skipped per-suite (not failed).

## Common issues

- **`prompt_loader_failed`**: the prompt row isn't seeded yet. Run
  `pnpm db:seed prompts` (the seed script lands in M1 Week 2 — for
  now insert manually via `psql`).
- **BullMQ `MaxRetriesPerRequestError`**: the worker tried to talk to
  Redis but the connection isn't configured for blocking commands.
  Confirm `lib/queues/connection.ts` is the only file constructing
  the ioredis client and that `maxRetriesPerRequest: null` is set.
- **`audit_write_failed`**: the audit_event table isn't there yet.
  Run `pnpm db:reset` to apply the migrations, including the
  helpers + per-schema tables.
- **`banned_model: deepseek-...`**: somebody re-introduced a banned
  provider. The fix is *never* to relax the check — the fix is to
  use a different model.

## Where things live

```
admitos-mvp-platform/
├── app/                          ← Next.js App Router
│   ├── (admissions)/             ← admissions route group
│   ├── (wellbeing)/              ← wellbeing route group (isolated)
│   └── api/                      ← /api/admissions/* and /api/wellbeing/*
├── lib/
│   ├── api/                      ← instrumentedRoute wrapper
│   ├── audit/                    ← AuditEvent helpers
│   ├── auth/                     ← role guards, getCurrentUser
│   ├── cef/                      ← CEF wizard hooks
│   ├── env.ts                    ← Zod env validation
│   ├── llm/                      ← callLLM router + banned-model registry
│   ├── observability/            ← Sentry + LangSmith + PostHog
│   ├── prompts/                  ← prompt versioning
│   ├── queues/                   ← BullMQ queue names + ioredis singleton
│   └── supabase/                 ← service clients
├── src/workers/                  ← BullMQ worker registry + handlers
├── scripts/                      ← evals runner, dev tooling
├── supabase/migrations/          ← schema DDL (Week 2)
├── tests/                        ← vitest + eval fixtures
└── middleware.ts                 ← namespace isolation guard
```
