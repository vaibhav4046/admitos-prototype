/**
 * Admissions index — the canonical "/" page for signed-in students.
 *
 * M1 scope: this is the FIRST screen a student sees after sign-in.
 * It needs to do exactly three jobs in priority order:
 *
 *   1. Welcome the student by name and orient them ("you are here").
 *   2. Surface ONE primary call to action — the CEF wizard — so they
 *      can start (or resume) the seven-step intake without thinking.
 *   3. Quietly preview what's coming (essays, counsellor notes) so the
 *      product feels alive instead of empty, without faking data we
 *      don't yet have.
 *
 * Everything else lives one click away in the dashboard. We deliberately
 * keep this page narrow and decisive — if a student lands here and the
 * page asks "do you want to do six things?", we've already lost them.
 *
 * This page is rendered inside `app/(admissions)/layout.tsx`, which:
 *   - Owns the page-level `<main>` element (do NOT add another here)
 *   - Calls `getCurrentUser()` once and renders the AdmissionsHeader
 *   - Provides the namespaced `<main>` chrome with `data-admitos-namespace`
 *
 * Wellbeing isolation: this file imports nothing from `@/components/adie`
 * or `@/lib/wellbeing/*`. The CI cross-surface import grep enforces it.
 *
 * !!! ROUTE CONFLICT NOTE !!!
 * Both this file and `app/page.tsx` resolve to "/" in Next.js App Router
 * (the `(admissions)` group does NOT add a path segment). On the host,
 * `app/page.tsx` MUST be removed via `git rm app/page.tsx` for the
 * build to succeed. The sandbox can't delete files, so the conflict is
 * documented loudly in `app/page.tsx` itself. This file is the survivor.
 */

import Link from "next/link";

import { Button, Card, CardBody, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/services/auth/server";
import { displayNameFromEmail } from "@/lib/utils";

export default async function AdmissionsIndexPage() {
  const user = await getCurrentUser();
  const greetingName = user
    ? displayNameFromEmail(user.email).split(" ")[0] || "there"
    : "there";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Admissions"
        title={`Welcome${user ? `, ${greetingName}` : ""}.`}
        description="Pick up where you left off, or start your application journey from the Candidate Engagement Form."
      />

      <section
        aria-labelledby="primary-cta-heading"
        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Your next step
        </p>
        <h2
          id="primary-cta-heading"
          className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
        >
          Start the Candidate Engagement Form
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          A seven-step guided form that captures everything your AdropEDU
          counsellor needs to build your shortlist. Autosaved at every
          step — close the tab whenever you like, your progress is safe.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/cef/1"
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Button variant="primary" size="lg">
              Start the CEF →
            </Button>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Button variant="secondary" size="lg">
              Go to dashboard
            </Button>
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="next-up-heading"
        className="space-y-4"
      >
        <div>
          <h2
            id="next-up-heading"
            className="text-lg font-semibold text-slate-900"
          >
            What&apos;s coming next
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            These surfaces light up as your application progresses.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardBody>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Essay drafts
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                Five-dimension AI feedback
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Upload an essay draft and get clarity, structure, evidence,
                voice and impact feedback within minutes. Counsellor review
                queued automatically.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Counsellor notes
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                Direct line to your AdropEDU counsellor
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Once your CEF is submitted, your assigned counsellor will
                share a shortlist, comments and your next deadlines here.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <p className="border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
        Looking for the wellbeing companion? Adie lives at{" "}
        <Link
          href="/adie"
          className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
        >
          /adie
        </Link>
        . It is a separate, calmer surface — none of your conversations
        there are visible from these admissions screens.
      </p>
    </div>
  );
}
