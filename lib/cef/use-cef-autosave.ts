"use client";

/**
 * useCefAutosave — debounced-save hook for the CEF wizard.
 *
 * The CEF is a 7-step form that autosaves on every field change. We
 * don't want to hammer the API on every keystroke, so saves are
 * debounced by `delayMs` (default 600ms). The hook exposes:
 *
 *   - `state`       the current form value (you own it externally via
 *                   useState and pass it in)
 *   - `status`      one of `idle | dirty | saving | saved | error`
 *   - `lastSavedAt` Date | null, useful for a "Saved a moment ago" UI
 *   - `flush()`     force an immediate save (use on Next/Back click)
 *   - `error`       Error | null
 *
 * ### Failure behavior
 *
 * If a save fails, we:
 *   - mark status=error
 *   - KEEP the dirty flag so the next change re-triggers a save
 *   - never wipe the user's in-memory state
 *
 * If the user navigates away while dirty, the `beforeunload` handler
 * warns them. We don't attempt "background sync via service worker"
 * heroics — if the network is dead, the user sees it.
 *
 * ### Field schema caveat
 *
 * Until the CEF field schema PDF lands, the hook accepts an opaque
 * `unknown` state blob and ships it to the API as-is. Once the schema
 * is locked we'll parameterize this with a Zod type so the wire format
 * is checked client-side.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export interface UseCefAutosaveOptions<T> {
  /** Current step number (1..7) — sent with every save. */
  step: number;
  /** CEF submission id, if known. `null` until the first save returns. */
  submissionId: string | null;
  /** Current form state. Triggers autosave when this reference changes. */
  state: T;
  /** Debounce window in ms. Defaults to 600. */
  delayMs?: number;
  /** Override the save endpoint (mostly for tests). */
  endpoint?: string;
  /** Called with the fresh server payload after a successful save. */
  onSaved?: (payload: { submissionId: string; savedAt: string }) => void;
}

export interface UseCefAutosaveResult {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  error: Error | null;
  flush: () => Promise<void>;
}

const DEFAULT_ENDPOINT = "/api/admissions/cef/autosave";

export function useCefAutosave<T>(
  opts: UseCefAutosaveOptions<T>
): UseCefAutosaveResult {
  const {
    step,
    submissionId,
    state,
    delayMs = 600,
    endpoint = DEFAULT_ENDPOINT,
    onSaved,
  } = opts;

  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef<T>(state);
  const submissionIdRef = useRef<string | null>(submissionId);
  const inflightRef = useRef<AbortController | null>(null);

  // Keep refs up to date without re-triggering effects.
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);
  useEffect(() => {
    submissionIdRef.current = submissionId;
  }, [submissionId]);

  const doSave = useCallback(async () => {
    // Cancel any in-flight save — we only care about the most recent one.
    if (inflightRef.current) {
      inflightRef.current.abort();
    }
    const ac = new AbortController();
    inflightRef.current = ac;

    setStatus("saving");
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submissionIdRef.current,
          step,
          state: latestStateRef.current,
        }),
        signal: ac.signal,
      });
      if (!res.ok) {
        throw new Error(`autosave_failed: ${res.status} ${res.statusText}`);
      }
      const json = (await res.json()) as {
        submissionId: string;
        savedAt: string;
      };
      submissionIdRef.current = json.submissionId;
      setLastSavedAt(new Date(json.savedAt));
      setStatus("saved");
      onSaved?.(json);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err as Error);
      setStatus("error");
    } finally {
      if (inflightRef.current === ac) inflightRef.current = null;
    }
  }, [endpoint, step, onSaved]);

  // Debounced trigger on state change.
  useEffect(() => {
    setStatus((prev) => (prev === "saving" ? prev : "dirty"));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void doSave();
    }, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, delayMs, doSave]);

  // Warn on navigate away while dirty/saving/error.
  useEffect(() => {
    if (status === "idle" || status === "saved") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await doSave();
  }, [doSave]);

  return { status, lastSavedAt, error, flush };
}
