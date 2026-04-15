/**
 * Dynamic CEF step page.
 *
 * The step route is `/cef/[step]` where `[step]` is a number 1–7.
 *
 * For the M1 investor preview, each step renders a realistic, read-only
 * field layout (the field schema PDF — Thread 4 PDF #2 — is still
 * pending, so values aren't wired through the autosave path yet). The
 * structure here matches the Common Application + UCAS subset Andy
 * agreed for the MVP. Once the schema PDF lands, each `Step{N}Body`
 * block is replaced by the live form components without touching the
 * page route or the shell chrome.
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

// ---------------------------------------------------------------------------
// Field primitives — pure presentational, no client state. Keeps the page a
// server component so we don't ship JS for the wizard until the live form
// schema lands.
// ---------------------------------------------------------------------------

function Field({
  label,
  children,
  hint,
  span = "col-span-1",
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  span?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${span}`}>
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function TextInput({ placeholder, defaultValue }: { placeholder?: string; defaultValue?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
    />
  );
}

function Select({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  return (
    <select
      defaultValue={defaultValue ?? options[0]}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function TextArea({ rows = 4, placeholder, defaultValue }: { rows?: number; placeholder?: string; defaultValue?: string }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
    />
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-2 mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Per-step bodies
// ---------------------------------------------------------------------------

function Step1Basics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Legal first name"><TextInput placeholder="Mei" /></Field>
      <Field label="Legal last name"><TextInput placeholder="Tanaka" /></Field>
      <Field label="Preferred name (optional)"><TextInput placeholder="Mei" /></Field>
      <Field label="Date of birth"><TextInput placeholder="DD / MM / YYYY" /></Field>
      <Field label="Email address" span="sm:col-span-2"><TextInput placeholder="you@example.com" /></Field>
      <Field label="Phone"><TextInput placeholder="+44 7700 900123" /></Field>
      <Field label="Country of citizenship">
        <Select options={["United Kingdom", "China", "India", "Japan", "Korea", "Singapore", "United States", "Other"]} />
      </Field>
      <Field label="Current school" span="sm:col-span-2"><TextInput placeholder="e.g. Harrow International School" /></Field>
      <Field label="Year group">
        <Select options={["Year 11", "Year 12", "Year 13", "Gap year", "Other"]} defaultValue="Year 13" />
      </Field>
      <Field label="Counsellor email (optional)"><TextInput placeholder="counsellor@school.org" /></Field>
    </div>
  );
}

function Step2Education() {
  return (
    <div className="space-y-6">
      <div>
        <SectionHeading>Current curriculum</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Curriculum">
            <Select options={["A-Levels", "IB Diploma", "AP", "BTEC", "Gaokao", "Other"]} defaultValue="A-Levels" />
          </Field>
          <Field label="Expected graduation">
            <Select options={["May 2026", "June 2026", "July 2026", "December 2026", "May 2027"]} defaultValue="June 2026" />
          </Field>
        </div>
      </div>
      <div>
        <SectionHeading>Subjects and predicted grades</SectionHeading>
        <div className="space-y-2">
          {[
            ["Mathematics", "A*"],
            ["Further Mathematics", "A"],
            ["Physics", "A*"],
            ["Economics", "A"],
          ].map(([subject, grade]) => (
            <div key={subject} className="grid grid-cols-3 gap-3">
              <Field label="Subject" span="col-span-2"><TextInput defaultValue={subject} /></Field>
              <Field label="Predicted">
                <Select options={["A*", "A", "B", "C", "D", "E", "U"]} defaultValue={grade} />
              </Field>
            </div>
          ))}
          <button type="button" className="mt-2 text-xs font-medium text-slate-700 hover:text-slate-900">
            + Add another subject
          </button>
        </div>
      </div>
      <div>
        <SectionHeading>GCSE summary</SectionHeading>
        <Field label="Total 9–7 grades (or international equivalent)" span="sm:col-span-2">
          <TextInput defaultValue="9 grades at 9, 1 grade at 8" />
        </Field>
      </div>
    </div>
  );
}

function Step3TestScores() {
  return (
    <div className="space-y-6">
      <div>
        <SectionHeading>Standardised tests</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="SAT — total"><TextInput placeholder="0–1600" defaultValue="1510" /></Field>
          <Field label="SAT — date"><TextInput placeholder="MM / YYYY" defaultValue="11 / 2025" /></Field>
          <Field label="ACT — composite"><TextInput placeholder="0–36" /></Field>
          <Field label="ACT — date"><TextInput placeholder="MM / YYYY" /></Field>
        </div>
      </div>
      <div>
        <SectionHeading>English proficiency</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Test">
            <Select options={["Not required", "IELTS", "TOEFL iBT", "Duolingo English Test", "PTE Academic"]} defaultValue="IELTS" />
          </Field>
          <Field label="Overall score"><TextInput defaultValue="7.5" /></Field>
        </div>
      </div>
      <div>
        <SectionHeading>Subject tests &amp; AP / IB scores</SectionHeading>
        <Field label="Add any AP, SAT Subject, or IB Higher Level results">
          <TextArea
            rows={3}
            placeholder="e.g. AP Calculus BC — 5; AP Physics C: Mechanics — 5"
            defaultValue="AP Calculus BC — 5
AP Physics C: Mechanics — 5"
          />
        </Field>
      </div>
    </div>
  );
}

function Step4Activities() {
  const ROWS = [
    { name: "Maths Olympiad — School team captain", hours: "5 hrs / week, 40 weeks", role: "Team captain" },
    { name: "Robotics Club — Lead software engineer", hours: "8 hrs / week, 36 weeks", role: "Lead engineer" },
    { name: "Volunteer tutor — Local primary school", hours: "2 hrs / week, 30 weeks", role: "Volunteer" },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        List up to 10 activities. Order by significance — admissions readers focus on the top 3.
      </p>
      {ROWS.map((row, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Activity title" span="sm:col-span-2"><TextInput defaultValue={row.name} /></Field>
            <Field label="Position / role"><TextInput defaultValue={row.role} /></Field>
            <Field label="Time commitment"><TextInput defaultValue={row.hours} /></Field>
          </div>
          <Field label="Description (≤ 150 characters)">
            <TextArea rows={2} placeholder="What did you do, and what changed because of it?" />
          </Field>
        </div>
      ))}
      <button type="button" className="text-xs font-medium text-slate-700 hover:text-slate-900">
        + Add another activity
      </button>
    </div>
  );
}

function Step5Honours() {
  const ROWS = [
    { name: "British Maths Olympiad — Gold", level: "National", year: "2025" },
    { name: "UK Senior Physics Challenge — Distinction", level: "National", year: "2024" },
    { name: "School Prize for Mathematics", level: "School", year: "2024" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        List up to 5 honours. Most selective universities cap this at 5 entries.
      </p>
      {ROWS.map((row, i) => (
        <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
          <Field label="Honour" span="sm:col-span-2"><TextInput defaultValue={row.name} /></Field>
          <Field label="Level">
            <Select options={["School", "Regional", "National", "International"]} defaultValue={row.level} />
          </Field>
          <Field label="Year"><TextInput defaultValue={row.year} /></Field>
        </div>
      ))}
      <button type="button" className="text-xs font-medium text-slate-700 hover:text-slate-900">
        + Add another honour
      </button>
    </div>
  );
}

function Step6PersonalStatement() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <SectionHeading>Personal statement — draft 3</SectionHeading>
          <p className="text-xs text-slate-500">Last edited 14 Apr · 612 / 650 words · 4,098 / 4,000 characters</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Within UCAS limit
        </span>
      </div>
      <Field label="Statement">
        <TextArea
          rows={12}
          defaultValue={"My fascination with how systems behave under pressure started the day my school's robotics control loop crashed mid-competition. The fix wasn't in the motors — it was in how we'd modelled latency between sensor reads. That afternoon turned into a year of reading control theory papers I barely understood, then slowly did. I want to study Engineering because the gap between elegant maths and a robot that actually catches a ball is exactly the kind of problem I want to spend a decade getting better at..."}
        />
      </Field>
      <div className="rounded-lg border border-slate-200 bg-amber-50/40 p-4">
        <p className="text-xs font-semibold text-amber-900">AI essay coach feedback (3 suggestions)</p>
        <ul className="mt-2 space-y-1 text-xs text-amber-900/90">
          <li>• Opening hook is strong — keep the robotics story but tighten paragraph 2.</li>
          <li>• Paragraph 4 introduces three new ideas; pick one to develop.</li>
          <li>• Closing reads as a list — replace with one specific image of you doing the work.</li>
        </ul>
      </div>
    </div>
  );
}

function Step7Review() {
  const ROWS: Array<[string, string, "ok" | "warn"]> = [
    ["Basics", "Mei Tanaka · DOB 14/02/2008 · Year 13", "ok"],
    ["Education", "A-Levels · 4 subjects · Predicted A*A*AA", "ok"],
    ["Test scores", "SAT 1510 · IELTS 7.5 · 2 AP scores", "ok"],
    ["Activities", "3 of 10 entered", "warn"],
    ["Honours", "3 of 5 entered", "warn"],
    ["Personal statement", "Draft 3 — within UCAS limit", "ok"],
  ];
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Quick check of every section. Click any row to jump back and edit. Submission opens once every row is green.
      </p>
      <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
        {ROWS.map(([label, summary, state]) => (
          <li key={label} className="flex items-center justify-between bg-white px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{summary}</p>
            </div>
            <span
              className={
                state === "ok"
                  ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
              }
            >
              {state === "ok" ? "Ready" : "Recommended"}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">
        Submission is a final action — you&apos;ll be able to download a PDF receipt afterwards.
      </p>
    </div>
  );
}

function StepBody({ step }: { step: number }) {
  switch (step) {
    case 1: return <Step1Basics />;
    case 2: return <Step2Education />;
    case 3: return <Step3TestScores />;
    case 4: return <Step4Activities />;
    case 5: return <Step5Honours />;
    case 6: return <Step6PersonalStatement />;
    case 7: return <Step7Review />;
    default: return null;
  }
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
      <StepBody step={step} />
    </CefStepShell>
  );
}

// Pre-generate the 7 step paths so the static shell renders instantly.
export function generateStaticParams() {
  return Array.from({ length: TOTAL_STEPS }, (_, i) => ({
    step: String(i + 1),
  }));
}
