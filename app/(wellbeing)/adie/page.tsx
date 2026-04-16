/**
 * Adie wellbeing companion — landing page.
 *
 * M1 placeholder. The real Adie chat surface is a client component with
 * a streaming message feed, a crisis-flag listener, and a "talk to a
 * human" escalation button. That ships in M2 once the Adie persona
 * prompt is loaded via `@/agents/_core/prompts` and the `adie.crisis_check` slot
 * is registered.
 *
 * Hard rules for anything imported from this file:
 *
 *   - No PostHog. The wrapper throws on `adie_*` events anyway, but we
 *     don't even import the helper here so the wellbeing bundle never
 *     pulls it in by accident.
 *   - No structured logger output containing message body content.
 *   - No admissions Supabase client. The `wellbeing` schema is reached
 *     via its own service-role key and middleware guard.
 *   - Pure presentational components (`@/components/ui`) are fine —
 *     they have zero side effects and zero shared state.
 *
 * Visual contract: this surface is intentionally calmer than the
 * admissions surface. No conversion CTAs, no urgency, no progress
 * bars, no "next step" framing. The teal palette and the breathing
 * spacing are the point. If you find yourself adding a primary CTA
 * here, stop and check whether it belongs in admissions instead.
 *
 * The page is rendered inside `app/(wellbeing)/layout.tsx`, which
 * owns the page-level `<main>` element. Do NOT add another `<main>`.
 */

import { Card, CardBody } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function AdieIndexPage() {
  return (
    <div className="space-y-10">
      <div className="text-balance">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-soft)" }}>
          A calm space
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--fg)" }}>
          Hi. I&apos;m Adie.
        </h1>
        <p className="mt-3 max-w-xl text-balance text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          A calm space to talk about how the admissions process is landing
          for you. I&apos;m a companion, not a therapist — and nothing you
          say here is ever shared with your counsellor or attached to your
          application.
        </p>
      </div>

      <Card style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
        <CardBody className="px-6 py-6">
          <div className="space-y-4">
            <div className="rounded-lg px-4 py-3 text-sm leading-relaxed" style={{ background: "var(--bg-elevated)", color: "var(--fg-muted)" }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-soft)" }}>
                Adie
              </p>
              <p className="mt-1">
                Hey — glad you stopped by. There&apos;s no agenda here. We can
                just talk about how the week&apos;s landing, or sit quietly
                for a minute. Whatever feels right.
              </p>
            </div>
            <label htmlFor="adie-msg" className="sr-only">
              Message Adie
            </label>
            <textarea
              id="adie-msg"
              rows={3}
              placeholder="Take your time. Type whatever&apos;s on your mind…"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: "var(--bg-elevated)", color: "var(--fg)", border: "1px solid var(--border)" }}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs" style={{ color: "var(--fg-soft)" }}>
                Nothing you type is stored or shared with your counsellor.
              </p>
              <button
                type="button"
                className="inline-flex items-center rounded-md px-3.5 py-2 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
              >
                Send
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      <section
        aria-labelledby="adie-crisis-heading"
        className="rounded-xl p-5 text-sm"
        style={{ background: "color-mix(in srgb, var(--warn) 14%, var(--bg-surface))", color: "var(--fg)", border: "1px solid color-mix(in srgb, var(--warn) 40%, transparent)" }}
      >
        <h2
          id="adie-crisis-heading"
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--warn)" }}
        >
          If you&apos;re in crisis right now
        </h2>
        <p className="mt-2 leading-relaxed">
          Please reach out to a local support line. In the UK:{" "}
          <a
            href="tel:116123"
            className="font-semibold underline underline-offset-2 hover:no-underline"
          >
            Samaritans 116&nbsp;123
          </a>
          . Outside the UK, please contact your local emergency services.
        </p>
      </section>

      <aside
        className="rounded-xl px-5 py-4 text-xs leading-relaxed"
        style={{ background: "var(--bg-surface)", color: "var(--fg-muted)", border: "1px solid var(--border)" }}
      >
        <p>
          <span className="font-semibold" style={{ color: "var(--fg)" }}>
            Your privacy is structurally protected.
          </span>{" "}
          Adie lives in a separate area from your admissions record.
          Anything you say here is never used to evaluate your application
          and is never sent to your counsellor.
        </p>
      </aside>
    </div>
  );
}
