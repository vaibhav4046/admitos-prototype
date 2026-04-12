/**
 * CEF wizard layout.
 *
 * The Candidate Engagement Form is the 7-step intake the student
 * completes at signup. Each step is its own route segment so that:
 *
 *   - deep-linking works (counsellor can paste /cef/3 into chat)
 *   - progress restore on reload is just `router.push(resumeStep)`
 *   - each step's form state can be persisted independently via the
 *     `useCefAutosave` hook without cross-contamination
 *
 * The actual field schema for each step is locked inside Thread 4 PDF
 * #2 (cef-field-map.pdf) which is STILL MISSING. This layout therefore
 * only renders the chrome (progress bar, back/next shell) — the fields
 * themselves are not written in this commit.
 */

import type { ReactNode } from "react";

const STEPS = [
  { n: 1, title: "Basics" },
  { n: 2, title: "Academics" },
  { n: 3, title: "Interests" },
  { n: 4, title: "Context" },
  { n: 5, title: "Goals" },
  { n: 6, title: "Constraints" },
  { n: 7, title: "Review" },
] as const;

export default function CefLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-admitos-namespace="admissions"
      data-admitos-surface="cef"
      style={{
        maxWidth: "56rem",
        margin: "3rem auto",
        padding: "0 1.5rem",
      }}
    >
      <header>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Candidate Engagement Form
        </h1>
        <p style={{ color: "var(--color-muted)", marginTop: "0.25rem" }}>
          Seven quick steps. Autosaves as you go — you can close the tab at
          any time and come back where you left off.
        </p>
      </header>

      <nav aria-label="CEF progress" style={{ marginTop: "1.5rem" }}>
        <ol
          style={{
            display: "flex",
            gap: "0.5rem",
            listStyle: "none",
            padding: 0,
            margin: 0,
            flexWrap: "wrap",
          }}
        >
          {STEPS.map((s) => (
            <li
              key={s.n}
              style={{
                padding: "0.25rem 0.75rem",
                border: "1px solid var(--color-border)",
                borderRadius: "999px",
                fontSize: "0.85rem",
                color: "var(--color-muted)",
              }}
            >
              {s.n}. {s.title}
            </li>
          ))}
        </ol>
      </nav>

      <section style={{ marginTop: "2rem" }}>{children}</section>
    </div>
  );
}
