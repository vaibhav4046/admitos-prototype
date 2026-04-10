/**
 * Counsellor dashboard — admissions-surface landing page for counsellor
 * and admin roles.
 *
 * M1 Week 1 scope: stub only. The real surfaces land in M2/M3 and will
 * include:
 *
 *   - Student roster with CEF progress + recent activity
 *   - HITL queue for A5 essay feedback awaiting counsellor sign-off
 *   - Aggregated wellbeing signals (NOT raw Adie chat — see the
 *     wellbeing isolation model)
 *   - Flag-tagged escalations
 *
 * ### Auth boundary
 *
 * This page is the first real use of `requireRole(["counsellor",
 * "admin"])` from a server component. If a student or parent
 * navigates to `/counsellor`, `requireRole` throws an `AuthError`
 * with status 403, which we catch here and render as a friendly
 * "not authorised" card. We do NOT redirect — a silent redirect
 * would hide the fact that a student had a tab they could open but
 * didn't get to see, which is exactly the confusion the UI gating
 * in `components/admissions/nav-config.ts` is trying to prevent.
 * (Students and parents shouldn't even SEE the nav link; this page
 * is the belt-and-braces defence when someone pastes the URL.)
 *
 * ### Wellbeing firewall
 *
 * This file explicitly does NOT import anything from
 * `@/components/adie`, `@/lib/wellbeing`, or the wellbeing Supabase
 * client. The counsellor surface consumes a small, aggregated view
 * of wellbeing signals via a dedicated API in M3 — it does not
 * reach into the wellbeing schema directly.
 */

import Link from "next/link";

import {
  Badge,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { AuthError, requireRole } from "@/services/auth/server";

export const metadata = {
  title: "Counsellor — AdmitOS",
  description: "Counsellor dashboard for AdropEDU admissions workflows.",
};

interface CounsellorTile {
  eyebrow: string;
  title: string;
  body: string;
  ship: string;
  isolation?: string;
}

const COUNSELLOR_TILES: readonly CounsellorTile[] = [
  {
    eyebrow: "Roster",
    title: "Student roster",
    body: "CEF progress, recent activity, and next-action cues for every student assigned to you.",
    ship: "M2 Week 1",
  },
  {
    eyebrow: "HITL queue",
    title: "Essay HITL queue",
    body: "Drafts awaiting your sign-off before A5 feedback reaches the student. Every item has the generated feedback, the flagged uncertainty, and an approve / reject action.",
    ship: "M3 Week 1",
  },
  {
    eyebrow: "Wellbeing",
    title: "Wellbeing signals",
    body: "Aggregated wellbeing trends for students who have consented to share signals with their counsellor.",
    isolation:
      "Raw Adie conversations are never shown here — counsellors see only the aggregated signal layer.",
    ship: "M3 Week 2",
  },
];

export default async function CounsellorPage() {
  // Role gate — throws AuthError(403) for student/parent and
  // AuthError(401) for signed-out users. We catch both so the page
  // renders a readable message instead of letting Next.js surface a
  // raw 500.
  try {
    await requireRole(["counsellor", "admin"]);
  } catch (err) {
    if (err instanceof AuthError) {
      return (
        <div className="mx-auto max-w-xl space-y-6 py-12">
          <PageHeader
            eyebrow="Counsellor"
            title="Not available on your account"
            description={
              err.status === 401
                ? "Sign in with a counsellor account to view this page."
                : "The counsellor dashboard is only available to AdropEDU counsellors and admins. If you think you should have access, contact your AdropEDU counsellor."
            }
          />
          <Card>
            <CardBody className="px-6 py-6">
              <p className="text-sm leading-relaxed text-slate-600">
                You can still continue your application from the{" "}
                <Link
                  href="/"
                  className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                >
                  admissions home page
                </Link>
                .
              </p>
            </CardBody>
          </Card>
        </div>
      );
    }
    throw err;
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Counsellor"
        title="Counsellor dashboard"
        description="Student progress, HITL queue, and escalations in one place."
      />

      <section aria-labelledby="counsellor-tiles-heading">
        <h2 id="counsellor-tiles-heading" className="sr-only">
          Counsellor surfaces
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COUNSELLOR_TILES.map((tile) => (
            <Card
              key={tile.title}
              className="h-full shadow-card transition-shadow duration-200 ease-out hover:shadow-cardHover"
            >
              <CardBody className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {tile.eyebrow}
                  </p>
                  <Badge tone="neutral">Ships {tile.ship}</Badge>
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-900">
                    {tile.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {tile.body}
                  </p>
                  {tile.isolation ? (
                    <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                      <span className="font-semibold text-slate-900">
                        Isolation contract:
                      </span>{" "}
                      {tile.isolation}
                    </p>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="counsellor-recent-heading">
        <h2
          id="counsellor-recent-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500"
        >
          Recent activity
        </h2>
        <EmptyState
          title="Nothing yet"
          description="Student activity will appear here once the M2 wiring lands."
        />
      </section>
    </div>
  );
}
