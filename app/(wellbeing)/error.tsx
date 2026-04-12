"use client";

/**
 * Wellbeing route-group error boundary.
 *
 * Required because the global `app/error.tsx` boundary lives in a
 * different namespace and might pull in admissions providers. We
 * mount a wellbeing-local boundary so any caught error is rendered
 * inside the wellbeing tree (still showing the teal tint, no
 * admissions chrome).
 *
 * ### Hard rules
 *
 *   - We must NOT log the `error.message` through any wellbeing
 *     observability path that could leak content. The `error.digest`
 *     produced by Next is safe to show.
 *   - We must NOT call PostHog (it's banned for this surface anyway).
 *   - We must NOT show technical details to the user — they're
 *     already in a fragile state, the error UI should be calm.
 *
 * Sentry has already captured the error by the time this component
 * renders (the wrapper in `src/api/_core/instrumented-route.ts` does
 * that server-side, and Sentry's client SDK does it for client errors).
 */

import { useEffect } from "react";

export default function WellbeingErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Intentionally minimal. We do not log error.message — it might
    // contain wellbeing content. The digest is already in Sentry.
    // eslint-disable-next-line no-console
    console.warn("[wellbeing] error boundary tripped", {
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Something went a bit sideways
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Adie hit a snag and stepped away for a moment. Nothing you wrote
        has been shared anywhere — wellbeing conversations always stay in
        their own space.
      </p>

      <button
        onClick={() => reset()}
        className="mt-8 inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
      >
        Try again
      </button>

      {error.digest ? (
        <p className="mt-6 text-xs text-slate-400">
          Reference: <code>{error.digest}</code>
        </p>
      ) : null}
    </main>
  );
}
