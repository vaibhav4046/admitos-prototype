# AdmitOS architecture (M1 snapshot)

> Snapshot taken 2026-04-09. The two unblocks (Q3 wellbeing isolation
> mechanism + Thread 4 missing PDFs) will change a few details. Anything
> marked **PENDING** is the area that flips when the unblock lands.

## Surfaces

There are three logical surfaces, each rendered by a different Next
route group, served by a different schema, audited into a different
audit table, and traced into a separate set of Sentry / LangSmith
namespaces:

1. **Admissions** — `app/(admissions)/*` + `app/api/admissions/*`. Reads
   and writes the `admissions` Postgres schema. The CEF wizard, essay
   feedback loop, dashboard, counsellor surface.

2. **Wellbeing** — `app/(wellbeing)/*` + `app/api/wellbeing/*`. Reads and
   writes the `wellbeing` schema only. The Adie chat surface.
   **Telemetry never leaves the database.** No PostHog event ever
   originates here, no Sentry extra ever contains a wellbeing message
   body, no log line ever serialises a wellbeing-content field.

3. **Commons** — shared reference data (school lists, country lists,
   exam boards). Lives in `commons_db` schema. Read-only from the
   application.

## Isolation guarantees (defence in depth)

Per-request, the following all have to hold or the request is killed:

| Layer            | Mechanism                                                                  |
| ---------------- | -------------------------------------------------------------------------- |
| URL              | Route groups physically separate `(admissions)` from `(wellbeing)`.         |
| Edge middleware  | `middleware.ts` rejects cross-namespace headers + admissions referers.      |
| Service role     | Three distinct Supabase service-role keys; the wrong one for the URL fails. **PENDING Q3** — may flip to two physical Supabase projects. |
| Postgres RLS     | Per-schema policies. Cross-schema reads forbidden by `pg_hba`.              |
| Audit            | Separate `audit_event` tables per schema.                                   |
| Telemetry        | `posthog.capture()` throws on `adie_*` / `wellbeing_*` / `crisis_*` events. Sentry `beforeSend` deletes any `extra["wellbeing.content"]`. Logger redacts banned key patterns. |

If any single layer here fails, the next one catches it. We never
rely on a single check.

## Mandatory observability layers (per Thread 4)

1. **LangSmith** — every LLM call is wrapped with `traced()` and
   logged via `logEval(...)` for the LLM-as-Judge runner. Active +
   shadow prompts both run on every call so we can compare without
   user impact.

2. **Sentry** — all uncaught errors. Three init configs (client,
   server, edge) all have a `beforeSend` that scrubs the
   `wellbeing.content` extra key. The server config also tags
   `service: admitos-web` and `app_env`.

3. **PostHog** — product events only. Event names live in
   `lib/observability/event-names.ts`; the `capture()` wrapper throws
   if anyone tries to ship an `adie_*` / `wellbeing_*` / `crisis_*` /
   `mental_health_*` event. CI greps for the same patterns to catch
   anything that slips past the type system.

## Async pipeline (BullMQ)

Four queues, names locked by V2 (Thread 5):

| Queue              | Schema     | Purpose                                                  |
| ------------------ | ---------- | -------------------------------------------------------- |
| `cef_submitted`    | admissions | Fans out to A0 intake + A1 DNA when a student submits.   |
| `essay_uploaded`   | admissions | Triggers the A5 essay feedback pipeline.                 |
| `audit_alerts`     | admissions | Internal alerting on audit-sensitive events.             |
| `adie_message`     | wellbeing  | Adie message handling. Payload carries IDs only — never the body. |

Wellbeing payloads in Redis carry IDs and metadata only; the worker
fetches the actual content from the wellbeing schema when it runs.
This keeps wellbeing content out of shared infrastructure.

## API request lifecycle

Every API route handler goes through `instrumentedRoute(opts, handler)`:

```
request
  ↓ middleware sets x-admitos-request-id (req_<16hex>) + x-admitos-namespace
  ↓ instrumentedRoute opens a Sentry scope, validates request id, builds ctx
  ↓ handler runs, calls ctx.audit(...) for any state change
    ↓ writes audit row BEFORE returning (atomic-write-before-return)
  ↓ instrumentedRoute serialises response, attaches request id header
  ↓ on AuthError → 401/403, no Sentry
  ↓ on any other throw → 500, message hidden in production, Sentry capture
```

State-changing routes additionally:

- verify CSRF (`lib/security/csrf.ts`, signed double-submit, 1h TTL)
- rate-limit (`lib/security/rate-limit.ts`, Redis sliding window, fail-open by default)
- validate the body via Zod (use `parseInto` to get a `Result<T, ZodFieldErrors>`)
- enqueue downstream work via the typed helpers in `lib/queues/enqueue.ts`

## Prompt management

Prompts are NEVER hardcoded in source. They live in the `prompts` table
with status `active | shadow | deprecated`. A partial unique index
enforces "exactly one active per slot". The loader (`lib/prompts/loader.ts`)
caches active+shadow versions for 60s and routes wellbeing slots
(`adie.*`) to the wellbeing schema's prompts table.

`callLLM(input)` runs the active version, then fans out to the shadow
version silently in the background, then logs both via LangSmith. The
LLM-as-Judge eval runner uses the same router so the eval suite scores
both the active version and any candidate shadow.

## Banned: DeepSeek

Banned in four layers:
1. `lib/llm/banned.ts` — runtime regex match throws on assertion
2. `lib/env.ts` boot-time scan throws on any `*deepseek*` env var
3. `.eslintrc.cjs` — `Literal[value=/deepseek/i]` is a hard error
4. `.github/workflows/ci.yml` — grep job greps the diff before merge

If any of those four ever stop firing, the next one still does.

## Open questions

- **Q3** — Wellbeing isolation mechanism. The default is "single
  Supabase project + three service-role keys + middleware guard",
  but Andy might choose "two physical Supabase projects" instead.
  All code that touches Supabase clients lives behind
  `lib/supabase/service-clients.ts` so the switch is one file.
- **Thread 4 missing PDFs** — the CEF field schema, the prompt
  versioning DDL, and the ARE/School-Readiness derivation spec are
  all pending. Anything DDL-shaped is gated until they land.
