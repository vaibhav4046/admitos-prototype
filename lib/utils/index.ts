/**
 * lib/utils — small primitives that don't fit anywhere else.
 *
 * Keep this folder tight. If a util grows beyond ~80 LOC or develops
 * its own dependencies, it earns its own folder. The goal is for
 * `import { ... } from "@/lib/utils"` to never surprise anyone.
 */

export {
  ok,
  err,
  isOk,
  isErr,
  mapOk,
  unwrap,
  unwrapOr,
  tryCatch,
  tryCatchAsync,
} from "./result";
export type { Ok, Err, Result } from "./result";

export {
  generateRequestId,
  requestIdFromHeaders,
  isValidRequestId,
} from "./request-id";

export { parseInto } from "./zod-result";
export type { ZodFieldErrors } from "./zod-result";

export { wordCount, trimmedCharCount } from "./word-count";

export {
  pluralise,
  formatDateTime,
  formatBytes,
  formatRelative,
  initialsFor,
  displayNameFromEmail,
} from "./format";
