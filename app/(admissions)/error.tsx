"use client";

/**
 * Admissions route-group error boundary.
 *
 * Catches client errors thrown anywhere under `(admissions)`. The
 * global `app/error.tsx` exists as a final safety net, but having
 * a per-namespace boundary lets us:
 *
 *   - Style the fallback in the admissions visual language (indigo
 *     accent rather than teal, namespace clearly stated)
 *   - Show a "back to dashboard" link instead of "back to home"
 *   - Skip the wellbeing-style softening — admissions errors can be
 *     presented in straightforward language
 *
 * Sentry has already captured the error by the time this renders.
 */

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui";

export default function AdmissionsErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[admissions] error boundary tripped", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        We&apos;ve already been notified. Your draft is safe — we autosave
        every change before this point. Try again, and if the same thing
        keeps happening please let your counsellor know.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button variant="primary" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/dashboard">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-6 text-xs text-slate-400">
          Reference: <code>{error.digest}</code>
        </p>
      ) : null}
    </main>
  );
}
