/**
 * Stable PostHog event-name registry.
 *
 * Add events here, never inline. The reason: PostHog's funnel and
 * cohort definitions key off the literal event name, so a rename in
 * code (without a corresponding rename in PostHog) silently breaks
 * dashboards. Centralizing the names here means a rename is a single
 * search-and-replace in the codebase + a coordinated update in PostHog.
 *
 * ### Naming convention
 *
 * `<surface>.<noun>.<verb>` — lowercase, snake within each segment.
 *
 *   - cef.step.viewed
 *   - cef.step.completed
 *   - essay.draft.uploaded
 *   - dashboard.tile.clicked
 *
 * ### Wellbeing rule
 *
 * NO event in this registry starts with `adie_*`, `wellbeing_*`,
 * `crisis_*`, or `mental_health_*`. The PostHog wrapper in
 * `lib/observability/posthog.ts` enforces this with a `throw` —
 * adding such an event here would be caught by the unit test in
 * `tests/lib/posthog.banned-events.test.ts` and by CI grep, but
 * the first line of defence is just *don't add it*.
 */

export const EVENT = {
  // Auth surface (admissions side only)
  AUTH_SIGNED_IN: "auth.user.signed_in",
  AUTH_SIGNED_OUT: "auth.user.signed_out",

  // CEF wizard
  CEF_STEP_VIEWED: "cef.step.viewed",
  CEF_STEP_AUTOSAVED: "cef.step.autosaved",
  CEF_STEP_COMPLETED: "cef.step.completed",
  CEF_SUBMISSION_COMPLETED: "cef.submission.completed",

  // Dashboard / nav
  DASHBOARD_VIEWED: "dashboard.viewed",
  DASHBOARD_TILE_CLICKED: "dashboard.tile.clicked",

  // Essay (admissions only — feedback flow)
  ESSAY_DRAFT_UPLOADED: "essay.draft.uploaded",
  ESSAY_FEEDBACK_VIEWED: "essay.feedback.viewed",
  ESSAY_FEEDBACK_COUNSELLOR_APPROVED: "essay.feedback.counsellor_approved",
} as const;

export type EventName = (typeof EVENT)[keyof typeof EVENT];
