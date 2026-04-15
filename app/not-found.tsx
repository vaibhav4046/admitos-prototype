/**
 * Global 404 page.
 *
 * Plain server component with no client deps. Renders a simple
 * "lost?" message and a link back to the dashboard. We deliberately
 * don't expose the requested URL — surfacing it would be a tiny
 * vector for log injection / phishing if a user shares a screenshot.
 */

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        We can&apos;t find that page
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        The link may be old, or you might not have access. Head back to
        your dashboard to find what you were looking for.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Back to home
      </Link>
    </main>
  );
}
