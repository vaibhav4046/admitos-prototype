"use client";

/**
 * `<AutosaveStatus />` — small footer indicator for the CEF wizard.
 *
 * Reads from the `useCefAutosave` hook's status output and shows one
 * of the four possible UI states:
 *
 *   idle    "—"
 *   dirty   "Editing…"
 *   saving  "Saving…"  (with a spinner)
 *   saved   "Saved a few seconds ago" (with a relative-time tick)
 *   error   "Couldn't save — retrying"
 *
 * The component does NOT manage its own polling. The relative time
 * uses a 30-second interval which is fine because the longest a
 * student typically stares at one step is a couple of minutes.
 *
 * Visual style is intentionally restrained — this is a status line,
 * not a CTA.
 */

import { useEffect, useState } from "react";

import type { AutosaveStatus as Status } from "@/lib/cef/use-cef-autosave";

interface AutosaveStatusProps {
  // Props are optional so the server-rendered `CefStepShell` can mount
  // this component without knowing the autosave state. Once the CEF
  // wizard is wired to `useCefAutosave`, the hook output is passed in
  // explicitly from a client wrapper. Defaults render the "idle" dash.
  status?: Status;
  lastSavedAt?: Date | null;
  errorMessage?: string | null;
}

function relative(from: Date | null): string {
  if (!from) return "";
  const seconds = Math.round((Date.now() - from.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function AutosaveStatus({
  status = "idle",
  lastSavedAt = null,
  errorMessage,
}: AutosaveStatusProps) {
  // Tick every 30s so the relative-time string keeps refreshing.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  let label: string;
  let color: string;

  switch (status) {
    case "idle":
      label = "—";
      color = "var(--color-muted)";
      break;
    case "dirty":
      label = "Editing…";
      color = "var(--color-muted)";
      break;
    case "saving":
      label = "Saving…";
      color = "var(--color-muted)";
      break;
    case "saved":
      label = `Saved ${relative(lastSavedAt)}`;
      color = "var(--color-muted)";
      break;
    case "error":
      label = errorMessage ? `Couldn't save: ${errorMessage}` : "Couldn't save — retrying";
      color = "#b91c1c";
      break;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        fontSize: "0.8rem",
        color,
        marginTop: "0.5rem",
      }}
    >
      {label}
    </div>
  );
}
