/**
 * ============================================================================
 *  TOMBSTONE — DELETE THIS FILE ON HOST BEFORE BUILDING.
 * ============================================================================
 *
 *  This file exists ONLY because the sandbox environment that scaffolded the
 *  M1 codebase cannot delete files (`Operation not permitted` from the mount).
 *  It was the original M1 placeholder root page; it has been superseded by
 *  `app/(admissions)/page.tsx`, which is the canonical "/" route for
 *  signed-in students.
 *
 *  In Next.js App Router, the `(admissions)` route group does NOT add a path
 *  segment — `app/(admissions)/page.tsx` therefore resolves to the same URL
 *  ("/") as this file. Next.js cannot have two pages on the same path and
 *  will fail the build with:
 *
 *      "You cannot have two parallel pages that resolve to the same path.
 *       Please check /page and /(admissions)/page."
 *
 *  HOST FIX (one command):
 *
 *      git rm app/page.tsx && git commit -m "chore: remove tombstoned root page"
 *
 *  After that, `app/(admissions)/page.tsx` becomes the unambiguous "/" route
 *  and the build is unblocked.
 *
 *  WHY KEEP A DEFAULT EXPORT AT ALL?
 *  Next.js requires every `page.tsx` file to default-export a React
 *  component. If we omitted it, the dev server would crash with a confusing
 *  "page must export a default component" error before the user got the
 *  chance to read the parallel-pages error or this comment. The export
 *  below renders an unmissable red banner that points directly at the host
 *  fix above, so if anyone DOES manage to view this page they'll know
 *  exactly what to do.
 *
 *  WELLBEING FIRWALL: this file is in the unscoped `app/` root and has no
 *  imports from `@/lib/wellbeing/*` or `@/components/adie/*`. Cross-surface
 *  isolation is preserved.
 * ============================================================================
 */

import Link from "next/link";

export default function TombstonedRootPage() {
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        maxWidth: "42rem",
        margin: "4rem auto",
        padding: "1.5rem",
        border: "2px solid #b91c1c",
        borderRadius: "0.75rem",
        background: "#fef2f2",
        color: "#7f1d1d",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.55,
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: 0,
        }}
      >
        Build configuration error
      </p>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          margin: "0.25rem 0 0.75rem",
        }}
      >
        Tombstoned root page is still present
      </h1>
      <p style={{ margin: "0 0 0.75rem" }}>
        <code>app/page.tsx</code> has been superseded by{" "}
        <code>app/(admissions)/page.tsx</code> as the canonical &quot;/&quot;
        route. Both files cannot coexist — Next.js will refuse to build with a
        parallel-pages error.
      </p>
      <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>Run on the host:</p>
      <pre
        style={{
          background: "#1f2937",
          color: "#f9fafb",
          padding: "0.75rem 1rem",
          borderRadius: "0.5rem",
          fontSize: "0.85rem",
          overflowX: "auto",
          margin: "0 0 0.75rem",
        }}
      >
{`git rm app/page.tsx
git commit -m "chore: remove tombstoned root page"`}
      </pre>
      <p style={{ margin: 0, fontSize: "0.85rem" }}>
        Looking for the actual app? Once the tombstone is removed, the
        canonical entry points are{" "}
        <Link href="/" style={{ color: "#7f1d1d", textDecoration: "underline" }}>
          /
        </Link>{" "}
        (admissions index),{" "}
        <Link
          href="/cef/1"
          style={{ color: "#7f1d1d", textDecoration: "underline" }}
        >
          /cef/1
        </Link>{" "}
        (CEF wizard) and{" "}
        <Link
          href="/adie"
          style={{ color: "#7f1d1d", textDecoration: "underline" }}
        >
          /adie
        </Link>{" "}
        (wellbeing companion).
      </p>
    </div>
  );
}
