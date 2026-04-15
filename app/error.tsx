"use client";

/**
 * Global error boundary.
 *
 * Next's `app/error.tsx` is a client component that catches uncaught
 * exceptions thrown during render. The Sentry instrumentation already
 * captures the error before this component runs (via `sentry.client.config.ts`)
 * — this file just gives the user a recoverable surface.
 *
 * The "reset" button is wired to Next's reset() callback which
 * attempts to re-render the segment. We don't expose the error
 * message to the user; in production it could leak detail, and in
 * development the dev overlay is more useful anyway.
 */

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The Sentry SDK has already reported this — we just log it
    // locally so it shows up in the browser devtools when debugging.
    // eslint-disable-next-line no-console
    console.error("[unioffer] render error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-rose-600">
        Something went wrong
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        We hit an unexpected error
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        The team has been notified. You can try again, or head back to
        your dashboard.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-slate-400">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
