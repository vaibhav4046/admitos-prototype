/**
 * Zod ↔ Result bridge.
 *
 * Anywhere a route handler validates a body, we want:
 *
 *   const parsed = parseInto(BodySchema, raw);
 *   if (isErr(parsed)) return jsonError(400, parsed.error);
 *
 * That's much nicer than the four-line `safeParse` ladder. The
 * helper preserves the Zod field-error map exactly so callers can
 * surface per-field issues to the UI without re-running the parse.
 */

import { z } from "zod";

import { ok, err, type Result } from "./result";

export interface ZodFieldErrors {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
}

export function parseInto<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown
): Result<z.infer<T>, ZodFieldErrors> {
  const r = schema.safeParse(input);
  if (r.success) return ok(r.data);
  const flat = r.error.flatten();
  return err({ formErrors: flat.formErrors, fieldErrors: flat.fieldErrors });
}
