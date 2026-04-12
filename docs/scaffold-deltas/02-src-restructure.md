# Scaffold delta 02 — `/src/{api,services,agents,workers,db}` restructure

> **Source of truth:** Andy's Full Project Kickoff Brief (2026-04-09 15:43 BST).
> **Trigger:** Brief mandates the `/src/*` layout as a non-negotiable, with a hard rule that HTTP handlers in `/src/api` contain no business logic, all business logic lives in framework-free `/src/services`, every LLM call goes through `/src/agents`, BullMQ job handlers live in `/src/workers`, and all DB queries live in `/src/db`.
> **Status:** Design doc, not yet applied. Blocked on Andy's approval of `docs/training-data-plan.md`.

## Why this matters

The current scaffold follows the Next.js App Router convention: `app/`, `lib/`, `components/`, `workers/`. This worked for the foundations burst because it lets you move fast, but it creates three problems that Andy is specifically trying to prevent:

1. **Business logic leaks into route handlers.** Without an enforced `services` boundary, it is natural to write Zod validation, DB calls, and decision logic directly inside `app/api/.../route.ts`. That file is now untestable without spinning up a Next runtime, and the logic is untyped and uncomposable.

2. **LLM calls scatter.** Without an enforced `agents` boundary, someone will eventually call `callLLM()` from a component, from a route handler, or from a worker. Observability, prompt versioning, cost accounting, and LangSmith trace grouping all break the moment this happens.

3. **DB queries scatter.** Without an enforced `db` boundary, Supabase calls end up in components, in workers, in services, and in routes. RLS policies become impossible to reason about because you can't audit the query surface.

Andy's `/src/*` layout is the industry-standard hexagonal architecture applied to our stack. It's not aesthetic — it's the enforcement layer for the three rules above.

## What the layout looks like

```
/src
  /api          HTTP handlers only. Thin. Zod parse → services → envelope.
  /services     Business logic. Pure(-ish) functions. No Next, no Express, no Supabase client. Takes deps by constructor arg.
  /agents       ALL LLM calls. Prompt loading, LangSmith tracing, cost accounting, model routing all happens here.
  /workers      BullMQ job handlers. Thin. Parse job → call services/agents → ack.
  /db           All DB access. Supabase client creation, typed queries, row mappers.
```

Everything outside `/src` (i.e. `app/`, `components/`) is **presentation only**. App Router pages import from `/src/services` (or `/src/db` read helpers) but never from `/src/api` and never from `/src/workers`.

## The seam rules (enforced by CI)

1. **`/src/api/*` can import from `/src/services` and `/src/db` (read-only helpers). It cannot import from `/src/workers` or `/src/agents` directly.** LLM calls go via services.

2. **`/src/services/*` can import from `/src/db` and `/src/agents`. It cannot import from `/src/api` (that would be a cycle) and it cannot import from `next/*`, `express/*`, or any framework package.** This is what makes services testable in a plain Node vitest environment.

3. **`/src/agents/*` can import from `/src/db` (for prompt loading).** It cannot import from `/src/services` (cycle) and it cannot import from `/src/api`.

4. **`/src/workers/*` can import from `/src/services`, `/src/db`, `/src/agents`.** Workers are the other "thin" layer — they parse a job envelope and delegate to services.

5. **`/src/db/*` is leaf.** It cannot import from any other `/src/*` folder. It only knows Supabase and row types.

6. **`app/**/*`** (presentation) can import from `/src/services` and `/src/db` read helpers and nothing else.

### CI enforcement

Extend `.github/workflows/ci.yml` with a new `src-layer-boundaries` job that runs six greps:

```bash
# Rule 1: api does not import from workers or agents
grep -R "from ['\"]@/workers" src/api/ && exit 1
grep -R "from ['\"]@/agents" src/api/ && exit 1

# Rule 2: services does not import from next/express/api
grep -R "from ['\"]next" src/services/ && exit 1
grep -R "from ['\"]express" src/services/ && exit 1
grep -R "from ['\"]@/api" src/services/ && exit 1

# Rule 3: agents does not import from services or api
grep -R "from ['\"]@/services" src/agents/ && exit 1
grep -R "from ['\"]@/api" src/agents/ && exit 1

# Rule 4: workers — no restriction beyond not importing api
grep -R "from ['\"]@/api" src/workers/ && exit 1

# Rule 5: db is leaf
grep -R "from ['\"]@/services" src/db/ && exit 1
grep -R "from ['\"]@/agents" src/db/ && exit 1
grep -R "from ['\"]@/api" src/db/ && exit 1
grep -R "from ['\"]@/workers" src/db/ && exit 1

# Rule 6: presentation does not import from api or workers or agents
grep -R "from ['\"]@/api" app/ components/ && exit 1
grep -R "from ['\"]@/workers" app/ components/ && exit 1
grep -R "from ['\"]@/agents" app/ components/ && exit 1
```

Same pattern as the existing `cross-surface-imports` job. Cheap, deterministic, no dependency on ts-morph or dependency-cruiser.

## Mapping current → target

| Current location | Target location | Notes |
| --- | --- | --- |
| `app/api/admissions/cef/submit/route.ts` | stays at that path (App Router requires it) but imports from `/src/api/admissions/cef/submit.ts` | The App Router file becomes a 2-line shim: `import { POST as handler } from '@/api/admissions/cef/submit'; export const POST = handler` |
| `app/api/admissions/auth/signin/route.ts` | same shim pattern → `/src/api/admissions/auth/signin.ts` | |
| `app/api/admissions/auth/signout/route.ts` | same shim pattern → `/src/api/admissions/auth/signout.ts` | |
| `app/api/admissions/health/route.ts` | same shim pattern → `/src/api/admissions/health.ts` | |
| `app/api/wellbeing/health/route.ts` | same shim pattern → `/src/api/wellbeing/health.ts` | Wellbeing stays physically isolated — `src/api/wellbeing/` is its own subtree and the cross-surface CI grep extends to `src/` too. |
| `lib/auth/server.ts` | `/src/services/auth/session.ts` | The whole of `lib/auth/` becomes a service. |
| `lib/security/csrf.ts` | `/src/services/security/csrf.ts` | |
| `lib/security/rate-limit.ts` | `/src/services/security/rate-limit.ts` | |
| `lib/supabase/*` | `/src/db/supabase/*` | |
| `lib/queues/*` | split: `queues.ts` (name constants + connection) → `/src/db/queues/client.ts`; `enqueue.ts` (typed helpers) → `/src/services/queues/enqueue.ts` |
| `lib/llm/*` | `/src/agents/_core/*` — becomes the shared chassis for every agent |
| `lib/prompts/*` | `/src/agents/_core/prompts/*` |
| `lib/observability/*` | `/src/agents/_core/observability/*` for the LLM-specific parts; `/src/services/observability/*` for the general Sentry / PostHog wrappers |
| `lib/audit/*` | `/src/services/audit/*` |
| `lib/env.ts` | `/src/services/env.ts` — the one file everything reads from |
| `lib/api/instrumented-route.ts` | `/src/api/_core/instrumented-route.ts` |
| `lib/api/error-envelope.ts` | `/src/api/_core/error-envelope.ts` |
| `lib/api/json-success.ts` | `/src/api/_core/json-success.ts` |
| `lib/api/parse-body.ts` | `/src/api/_core/parse-body.ts` |
| `workers/handlers/*` | `/src/workers/handlers/*` (straight move) |
| `workers/registry.ts` | `/src/workers/registry.ts` (straight move) |
| `components/*` | **stays at `components/*`** — presentation layer does not move. |
| `tests/*` | **stays at `tests/*`** but imports update |

### TSConfig path aliases

Current:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

Target (explicit, one per top-level src subfolder so the CI greps can be written against the aliases, not relative paths):
```json
{
  "paths": {
    "@/api/*":      ["./src/api/*"],
    "@/services/*": ["./src/services/*"],
    "@/agents/*":   ["./src/agents/*"],
    "@/workers/*":  ["./src/workers/*"],
    "@/db/*":       ["./src/db/*"],
    "@/components/*": ["./components/*"],
    "@/app/*":      ["./app/*"]
  }
}
```

No more generic `@/*`. The loss of "just put a slash" is deliberate — it forces every import to declare which layer it's crossing, which is exactly the reading experience you want when reviewing a PR.

## PR sequence

One PR per seam, smallest-first, so each can be reverted independently if CI goes red:

1. `chore(src): add empty /src directory structure and update tsconfig paths` — no code moves yet, just scaffolding. CI unchanged. Verifies the path aliases resolve.
2. `refactor(src): move lib/env.ts to src/services/env.ts` — smallest leaf move. Touches every file that imports env. Verifies the refactor tooling.
3. `refactor(src): move lib/supabase → src/db/supabase` — next leaf. Verifies db layer.
4. `refactor(src): move lib/queues → split to src/db/queues + src/services/queues` — first split.
5. `refactor(src): move lib/auth, lib/security, lib/audit → src/services/*` — all at once, each is a leaf.
6. `refactor(src): move lib/llm, lib/prompts, lib/observability/llm-cost → src/agents/_core` — the agents chassis.
7. `refactor(src): move lib/api/* → src/api/_core/*` — the route chassis.
8. `refactor(src): move workers/ → src/workers/` — straight move.
9. `refactor(src): move app/api/**/route.ts to shims importing from src/api` — the presentation/api split. This is the visible change for Andy.
10. `chore(ci): add src-layer-boundaries grep job` — enforcement.

Each PR ends with `pnpm typecheck && pnpm test` green before merge.

## Risk and rollback

**Risk is medium.** Nine moves, each touches many import sites. The CI typecheck catches most breakage, but there's always a runtime import we forget.

**Mitigation:** run the changes as ten small PRs instead of one. If PR 5 breaks, revert 5 and keep 1–4. The worst we lose is 20 minutes of rework.

**Rollback:** revert the PR that broke. No data changes, no migrations, no schema.

## Risk we will NOT take

- We are **not** using a codemod for this. The ts-morph / jscodeshift moves for this kind of refactor leave you with subtly broken imports in the 3% of files that have dynamic imports or template-string require paths. Manual moves + typecheck + test is slower but has zero mystery failures.
- We are **not** doing it in one big-bang PR. Big refactors that touch >50 files in one commit are unreviewable and unrevertable.

## Definition of done

- Every file in the repo either lives in `app/`, `components/`, `src/`, `tests/`, or `scripts/`. Nothing in `lib/` or `workers/` at the root.
- `pnpm typecheck` zero errors.
- `pnpm test` zero failures.
- The new `src-layer-boundaries` CI job green.
- The existing `cross-surface-imports` CI job green (wellbeing firewall still holds).
- The existing `banned-providers` CI job green.
- A follow-up ADR (`docs/decisions.md`) capturing "we adopted `/src/*` layout per Andy's brief — here are the seam rules".
