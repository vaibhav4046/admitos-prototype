/**
 * Dynamic CEF step page.
 *
 * The step route is `/cef/[step]` where `[step]` is a number 1–7.
 * The actual field components for each step will be rendered here
 * once the CEF field schema PDF lands (Thread 4, blocker B-PDF2).
 *
 * Until then, this file uses the `CefStepShell` chrome and renders a
 * placeholder body. When the field schema lands we replace the
 * placeholder body with a switch on `step` that imports the per-step
 * field components.
 */

import { notFound } from "next/navigation";

import { CefStepShell } from "@/components/cef/CefStepShell";

const TOTAL_STEPS = 7;

const STEP_TITLES: Record<number, { title: string; description: string }> = {
  1: { title: "Basics", description: "Your name, contact details, and current school." },
  2: { title: "Education", description: "Your academic history and predicted grades." },
  3: { title: "Test scores", description: "SAT, ACT, IELTS, TOEFL — whatever's relevant." },
  4: { title: "Activities", description: "Clubs, sports, jobs, volunteering, side projects." },
  5: { title: "Honours and awards", description: "Recognised achievements during high school." },
  6: { title: "Personal statement", description: "Your essay drafts and counsellor feedback." },
  7: { title: "Review", description: "Final check before you submit. You can come back to edit anything." },
};

function parseStep(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_STEPS) return null;
  return n;
}

export default async function CefStepPage({
  params,
}: {
  // Next 15 delivers `params` as a Promise in dynamic segments. We
  // await it once at the top of the component and use the resolved
  // shape everywhere else — no shim.
  params: Promise<{ step: string }>;
}) {
  const { step: rawStep } = await params;
  const step = parseStep(rawStep);
  if (step === null) notFound();

  // `STEP_TITLES` is defined above for every valid step 1..TOTAL_STEPS,
  // and `parseStep` rejects anything outside that range — the lookup
  // is therefore total. The `!` silences `noUncheckedIndexedAccess`.
  const meta = STEP_TITLES[step]!;

  return (
    <CefStepShell step={step} title={meta.title} description={meta.description}>
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        Placeholder. Field schema pending Thread 4 PDF #2 (cef-field-map.pdf).
      </div>
    </CefStepShell>
  );
}

// Pre-generate the 7 step paths so the static shell renders instantly.
export function generateStaticParams() {
  return Array.from({ length: TOTAL_STEPS }, (_, i) => ({
    step: String(i + 1),
  }));
}
