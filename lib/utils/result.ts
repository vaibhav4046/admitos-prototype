/**
 * Result<T, E> — explicit success/error envelope.
 *
 * Used by anything that wants to push errors into the type system
 * without throwing. The convention across the codebase:
 *
 *   - Throws → "this should never happen in normal operation" (programmer
 *     bug, banned config, missing env). Caught by `instrumentedRoute` and
 *     turned into a 500.
 *
 *   - Result → "this is an expected failure mode the caller has to
 *     handle" (validation failure, rate limit hit, optimistic-concurrency
 *     conflict). Never reaches Sentry as an error — it's normal flow.
 *
 * The split matters because Sentry alert noise kills triage. Anything
 * that throws is treated as "wake someone up if it spikes". Anything
 * returned as `err()` is just data and gets logged at INFO/WARN.
 *
 * The shape is intentionally identical to the Rust convention so it
 * reads instantly to anyone who's used `Result` before.
 */

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Narrowing helper — `if (isOk(r))` lets TS see r.value without the
 * caller having to write `if (r.ok)`. Mostly here for readability in
 * places where the call site has more interesting things to look at.
 */
export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.ok === true;
}

export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return r.ok === false;
}

/**
 * Map the success value through a synchronous function. Errors are
 * passed through untouched. Useful for chaining transformations
 * without nested `if (r.ok)` ladders.
 *
 *   const result = mapOk(loaded, (x) => x.id);
 */
export function mapOk<T, U, E>(
  r: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return r.ok ? ok(fn(r.value)) : r;
}

/**
 * Unwrap or throw — for places where a logic error in the calling
 * code is the only way the result could be `err`. Throws an Error
 * with the supplied prefix so the stack trace is meaningful.
 */
export function unwrap<T, E>(r: Result<T, E>, message?: string): T {
  if (r.ok) return r.value;
  throw new Error(
    `${message ?? "result_unwrap_on_err"}: ${
      typeof r.error === "string" ? r.error : JSON.stringify(r.error)
    }`
  );
}

/**
 * Unwrap with a fallback. Cannot fail — use it where the caller has
 * a sensible default it would substitute on error anyway.
 */
export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return r.ok ? r.value : fallback;
}

/**
 * Try to run a synchronous function that may throw, capturing the
 * error into a Result envelope. The error is normalised to a string
 * so the caller doesn't have to deal with `unknown`.
 *
 *   const r = tryCatch(() => JSON.parse(input));
 */
export function tryCatch<T>(fn: () => T): Result<T, string> {
  try {
    return ok(fn());
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e));
  }
}

/**
 * Async version of tryCatch.
 */
export async function tryCatchAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T, string>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e));
  }
}
