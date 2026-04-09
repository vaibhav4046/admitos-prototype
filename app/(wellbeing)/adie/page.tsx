/**
 * Adie wellbeing companion — landing page.
 *
 * M1 placeholder. The real Adie chat surface is a client component with
 * a streaming message feed, a crisis-flag listener, and a "talk to a
 * human" escalation button. That ships in M2 once the Adie persona
 * prompt is loaded via `lib/prompts/` and the `adie.crisis_check` slot
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

import { Card, CardBody, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function AdieIndexPage() {
  return (
    <div className="space-y-10">
      <div className="text-balance">
        <p className="text-xs font-semibold uppercase tracking-wider text-wellbeing-700">
          A calm space
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Hi. I&apos;m Adie.
        </h1>
        <p className="mt-3 max-w-xl text-balance text-base leading-relaxed text-slate-600">
          A calm space to talk about how the admissions process is landing
          for you. I&apos;m a companion, not a therapist — and nothing you
          say here is ever shared with your counsellor or attached to your
          application.
        </p>
      </div>

      <Card className="border-wellbeing-100 bg-white/70 shadow-card">
        <CardBody className="px-6 py-8">
          <EmptyState
            title="Chat space coming soon"
            description="The conversation interface ships in M2. In the meantime, nothing you write here is stored anywhere."
          />
        </CardBody>
      </Card>

      <section
        aria-labelledby="adie-crisis-heading"
        className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
      >
        <h2
          id="adie-crisis-heading"
          className="text-xs font-semibold uppercase tracking-wider"
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

      <aside className="rounded-xl border border-slate-200 bg-white/80 px-5 py-4 text-xs leading-relaxed text-slate-600">
        <p>
          <span className="font-semibold text-slate-900">
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
