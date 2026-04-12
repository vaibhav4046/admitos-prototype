/**
 * API helpers barrel.
 *
 *   import { instrumentedRoute } from "@/api/_core";
 *
 * Every API route handler should wrap its export in this. The wrapper
 * is the single chokepoint for Sentry scoping, request id propagation,
 * AuditEvent injection, and error envelope normalization.
 */

export {
  instrumentedRoute,
  type InstrumentedRouteContext,
  type InstrumentedRouteOptions,
} from "./instrumented-route";

export {
  jsonError,
  jsonValidationError,
  jsonRateLimited,
  jsonCsrfFailure,
  type ErrorEnvelope,
  type ErrorEnvelopeOptions,
} from "./error-envelope";

export { parseJsonBody, type ParseJsonBodyContext } from "./parse-body";

export { jsonSuccess, type JsonSuccessOptions } from "./json-success";
