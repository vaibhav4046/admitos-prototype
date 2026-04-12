/**
 * CefStepShell — common chrome around every CEF step page.
 *
 * Renders:
 *   - A progress strip ("Step 3 of 7") with a real visual bar
 *   - The step title + optional description
 *   - The step's body slot (children) inside a card
 *   - A back/next bar at the bottom that respects the 7-step bounds
 *   - The autosave status footer (client child)
 *
 * The shell is a server component. The autosave status import below
 * is a client component (`AutosaveStatus`) — Next handles the
 * boundary because it's a marked "use client" file.
 *
 * Step content (the actual form fields) is provided by the caller
 * via children, so this file knows nothing about the field schema.
 * That's deliberate: when the field schema lands in M1 Week 2 we
 * change one set of leaf files, not this shell.
 *
 * IMPORTANT: This component is rendered INSIDE the admissions
 * layout, which already provides the page-level `<main>` element.
 * We must NOT add another `<main>` here — two `<main>` elements on
 * one page is invalid HTML and triggers a hydration warning. Use a
 * plain wrapper `<div>` instead. Caught during the M1 visual QA pass
 * (see SESSION-TIMER.md, mid-session #7).
 */

import Link from "next/link";

import { AutosaveStatus } from "@/components/AutosaveStatus";
import { Button } from "@/components/ui";

const TOTAL_STEPS = 7;

export interface CefStepShellProps {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function CefStepShell({
  step,
  title,
  description,
  children,
}: CefStepShellProps) {
  const prev = step > 1 ? step - 1 : null;
  const next = step < TOTAL_STEPS ? step + 1 : null;
  // We're on the final review step iff there's no "next" link to render.
  // This is the only place the submit button is shown, so the button
  // must be ENABLED here — the previous code accidentally set
  // `disabled={isReview}` which made submit permanently un-clickable.
  const isReview = next === null;
  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Step {step} of {TOTAL_STEPS}
          </p>
          <p className="text-xs font-medium text-slate-500" aria-hidden="true">
            {progressPct}%
          </p>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`CEF wizard progress, step ${step} of ${TOTAL_STEPS}`}
        >
          <div
            className="h-full rounded-full bg-slate-900 transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {children}
      </div>

      <nav
        aria-label="CEF step navigation"
        className="mt-6 flex items-center justify-between gap-4"
      >
        {prev ? (
          <Link
            href={`/cef/${prev}`}
            className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Button variant="secondary">← Back</Button>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}

        {isReview ? (
          <Button variant="primary" type="submit">
            Submit application
          </Button>
        ) : (
          <Link
            href={`/cef/${next}`}
            className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Button variant="primary">Next →</Button>
          </Link>
        )}
      </nav>

      <div className="mt-6">
        <AutosaveStatus />
      </div>
    </div>
  );
}
