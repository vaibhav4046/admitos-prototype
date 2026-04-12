/**
 * Observability barrel. Use `import { captureError, traced, capture } from "@/lib/observability"`.
 *
 * Re-exports the three layers mandated by Thread 4:
 *   - Sentry (error tracking)
 *   - LangSmith (LLM trace + eval store)
 *   - PostHog (product events — NEVER wellbeing events)
 */

export { captureError, addBreadcrumb } from "./sentry";
export { traced, logEval, langsmithEnabled } from "./langsmith";
export { capture, shutdown as posthogShutdown } from "./posthog";
export { EVENT, type EventName } from "./event-names";
