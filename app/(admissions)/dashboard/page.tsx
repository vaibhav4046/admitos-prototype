/**
 * Admissions dashboard — the at-a-glance home for signed-in students.
 *
 * Three-tile layout per the M1 spec:
 *
 *   1. Candidate Engagement Form  — primary action, always present
 *   2. Essay drafts               — wakes up after CEF submit
 *   3. Counsellor notes           — wakes up after first 1:1
 *
 * This file is a server component. The interactive bits (autosave
 * status, real-time CEF progress) belong to dedicated client
 * children — keep this file boring so it doesn't trigger the
 * "use client" boundary up the tree.
 *
 * The data fetching is stubbed for M1 Week 1: we render placeholder
 * statuses. The real query will land in M1 Week 2 once the CEF DDL
 * is unblocked.
 *
 * Polish notes for the M1 visual pass:
 *   - The CEF tile is `featured` so it visually outweighs the other
 *     two — that's the action we want every student to take next.
 *   - All three cards have a hover lift via `shadow-card` →
 *     `shadow-cardHover` and a 200ms `ease-out` transition. The
 *     entire `<Link>` is the click target so the hit area matches
 *     the visual element.
 *   - The "Status:" line uses a colour-coded `<Badge>` so the
 *     activation state of each tile is legible at a glance.
 *   - The wellbeing-isolation footer is now a tinted callout, not a
 *     stray paragraph at the bottom of the page.
 */

import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  CardBody,
  PageHeader,
} from "@/components/ui";

type TileStatus = "ready" | "active" | "locked" | "empty";

interface DashboardTile {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  status: TileStatus;
  featured?: boolean;
}

const TILES: readonly DashboardTile[] = [
  {
    href: "/cef/1",
    eyebrow: "Step 4 of 7",
    title: "Candidate Engagement Form",
    body: "A guided seven-step intake form. Autosaved at every step — close the tab whenever you like.",
    cta: "Resume CEF",
    status: "ready",
    featured: true,
  },
  {
    href: "/cef/6",
    eyebrow: "Draft 3 in review",
    title: "Essay drafts",
    body: "Upload a draft to receive structured five-dimension feedback. A counsellor reviews every set of comments before they reach you.",
    cta: "Open essays",
    status: "active",
  },
  {
    href: "/counsellor",
    eyebrow: "Last note: 2 days ago",
    title: "Counsellor notes",
    body: "Read the latest notes from your UniOffer counsellor. Updated within 24 hours of each session.",
    cta: "Read notes",
    status: "active",
  },
];

const STATUS_LABEL: Record<TileStatus, { label: string; tone: React.ComponentProps<typeof Badge>["tone"] }> = {
  ready: { label: "In progress", tone: "info" },
  active: { label: "Updated", tone: "success" },
  locked: { label: "Locked", tone: "neutral" },
  empty: { label: "Nothing yet", tone: "neutral" },
};

export default function AdmissionsDashboardPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back"
        description="Pick up where you left off, or jump straight to a draft."
        actions={
          <Link
            href="/cef/1"
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Button variant="primary">Resume CEF →</Button>
          </Link>
        }
      />

      <section aria-labelledby="tiles-heading">
        <h2 id="tiles-heading" className="sr-only">
          Application surfaces
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => {
            const isReady = tile.status === "ready";
            const status = STATUS_LABEL[tile.status];
            return (
              <Link
                key={tile.href}
                href={tile.href}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                aria-label={`${tile.title} — ${status.label}`}
              >
                <Card
                  className={
                    "h-full shadow-card transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:shadow-cardHover " +
                    (tile.featured
                      ? "border-slate-900/10 ring-1 ring-slate-900/5"
                      : "")
                  }
                >
                  <CardBody className="flex h-full flex-col gap-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {tile.eyebrow}
                      </p>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-slate-900">
                        {tile.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {tile.body}
                      </p>
                    </div>
                    <p
                      className={
                        "mt-auto text-sm font-medium " +
                        (isReady
                          ? "text-slate-900 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
                          : "text-slate-500")
                      }
                    >
                      {tile.cta} <span aria-hidden="true">→</span>
                    </p>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="next-actions-heading">
        <div className="mb-3 flex items-end justify-between">
          <h2
            id="next-actions-heading"
            className="text-sm font-semibold uppercase tracking-wider text-slate-500"
          >
            Recommended next actions
          </h2>
        </div>
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-200">
              {[
                { what: "Tighten paragraph 2 of your personal statement (AI essay coach)", when: "5 min · /cef/6" },
                { what: "Add 2 more activities to reach the recommended 5+", when: "10 min · /cef/4" },
                { what: "Confirm your IELTS overall score (currently 7.5)", when: "1 min · /cef/3" },
                { what: "Book your next counsellor 1:1 — slot opens 18 Apr", when: "2 min · /counsellor" },
              ].map((row, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-5 py-3">
                  <p className="text-sm text-slate-800">{row.what}</p>
                  <span className="shrink-0 text-xs text-slate-500">{row.when}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <aside
        aria-label="Wellbeing isolation notice"
        className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-xs leading-relaxed text-slate-600"
      >
        <p>
          <span className="font-semibold text-slate-900">
            Your privacy is structurally protected.
          </span>{" "}
          Anything you write here is stored encrypted at rest. The wellbeing
          companion (
          <Link
            href="/adie"
            className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
          >
            Adie
          </Link>
          ) lives in a separate area and never feeds into your admissions
          record — your counsellor cannot read your conversations there.
        </p>
      </aside>
    </div>
  );
}
