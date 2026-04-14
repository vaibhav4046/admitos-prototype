# UniOffer — engineering decisions log

> Living record of the architectural decisions made on the UniOffer MVP.
> Format is loose-ADR — each entry has a date, a context, the decision,
> and the consequences. Add new entries to the **top** of the file.

---

## 2026-04-09 — M1 Week 1 kickoff (Vaibhav, billable session 1)

**Context.** First billable session on Claude Max. Q3 (wellbeing
isolation mechanism) is unanswered, and three Thread 4 PDFs are still
pending download. Need to make forward progress without violating any
of Andy's hard constraints.

**Decisions.**

1. **Scope-lock the session to "safe" M1 Week 1 work.** Anything that
   depends on the Q3 answer or on the missing PDFs is deferred. This
   includes: real DDL for the three schemas, the CEF field schema, the
   essay rubric, the Adie persona prompt content, and the final API
   contracts.

2. **Default Q3 to Option 2** (single Supabase project + three
   service-role keys + middleware guard) per the pre-stated Friday
   fallback. The code in `lib/supabase/service-clients.ts` is the
   single point of change if Andy lands on Option 1 instead — every
   other file is namespace-agnostic.

3. **Three-schema enforcement at the type level.** `lib/supabase/types.ts`
   declares `SchemaNamespace = "admissions" | "wellbeing" | "commons_db"`.
   The service-client builder takes this as a discriminator and there
   is no other code path for choosing a schema.

4. **DeepSeek ban enforced in three layers.** Boot-time env scan in
   `lib/env.ts`, runtime model assertion in `lib/llm/banned.ts`, and
   ESLint `no-restricted-syntax` rule in `.eslintrc.cjs`. Single
   careless commit cannot reintroduce a banned provider.

5. **All LLM calls funnel through `callLLM` in `lib/llm/call.ts`.**
   The router loads the active prompt from the DB, renders it,
   enforces the model ban, runs the call inside a LangSmith trace,
   and fans out to the shadow prompt (if any) without leaking the
   shadow output to the user.

6. **Prompts live in the database, never in TS source.** The
   `prompt_version` table holds `{id, slot, version, status, system,
   user_template, config, model}`. Status is `active | shadow |
   deprecated`, with a partial unique index on slot when active so
   you cannot have two actives at once.

7. **AuditEvent is the spine of every mutating action.** The
   `auditedMutation` envelope wraps the business logic so the audit
   row and the mutation succeed atomically or roll back together.
   No UPDATE / DELETE RLS on `audit_event`. The same pattern lives
   in both schemas.

8. **All API routes go through `instrumentedRoute`.** The wrapper
   handles Sentry scoping, request-id propagation, error envelope,
   and an `audit()` helper pre-filled with namespace + actor +
   request id. Routes that bypass the wrapper will be caught in
   code review and bounced.

9. **Wellbeing telemetry never leaves the DB.** PostHog `capture()`
   throws on any event prefixed `adie_*`, `wellbeing_*`, `crisis_*`,
   `mental_health_*`. Sentry scrubs `extra["wellbeing.content"]` in
   `beforeSend` on client, server, and edge.

10. **CEF wizard is 7 route segments under `(admissions)/cef/[step]`.**
    Each step is its own page so deep-link, autosave, and resume all
    work without cross-step coupling. The `useCefAutosave` hook
    debounces saves at 600ms with abort + flush + beforeunload guard.

**Consequences.**

- Going forward, the only changes that should require touching
  cross-cutting code are (a) the Q3 fork landing and (b) the eventual
  switch from the dev provider stub to the real Anthropic client in
  `lib/llm/call.ts`. Everything else extends the scaffold rather than
  modifying it.

- The session built 50+ source files inside scope-lock. Nothing in
  the repo today depends on a Q3 answer or on a missing PDF.

---
