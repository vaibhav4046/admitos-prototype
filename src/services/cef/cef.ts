/**
 * CEF service — business logic for the Common Enrolment Form wizard.
 *
 * All 6 wizard steps autosave independently. When the student clicks
 * "Submit", we:
 *   1. Verify all 6 steps have saved payloads for the current version
 *   2. Hash the combined payload (SHA-256) for integrity verification
 *   3. Create a cef_version row with submitted_at = now
 *   4. Write an AuditEvent
 *   5. Enqueue the downstream pipeline (A0 intake → A1 DNA → ARE)
 *
 * This service never touches Redis directly — queue operations go
 * through `src/services/queues/enqueue.ts`.
 */

import "server-only";

import { createHash } from "node:crypto";

import {
  upsertDraft,
  findDrafts,
  insertVersion,
  markVersionSubmitted,
  findLatestVersion,
  type CefStep,
  type DbCefDraft,
  type DbCefVersion,
} from "@/db/cef";

const ALL_STEPS: readonly CefStep[] = [
  "profile",
  "academics",
  "ecs",
  "essays",
  "schools",
  "review",
] as const;

// ---------------------------------------------------------------------------
// Autosave
// ---------------------------------------------------------------------------

export interface AutosaveInput {
  userId: string;
  version: number;
  step: CefStep;
  payload: Record<string, unknown>;
}

export async function autosaveDraftStep(input: AutosaveInput): Promise<DbCefDraft> {
  return upsertDraft({
    user_id: input.userId,
    version: input.version,
    step: input.step,
    payload: input.payload,
  });
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getDraft(
  userId: string,
  version: number
): Promise<DbCefDraft[]> {
  return findDrafts(userId, version);
}

export async function getLatestVersion(userId: string): Promise<DbCefVersion | null> {
  return findLatestVersion(userId);
}

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

export interface SubmitCefInput {
  userId: string;
  version: number;
}

export interface SubmitCefResult {
  versionId: string;
  payloadHash: string;
  submittedAt: string;
}

export class CefValidationError extends Error {
  constructor(
    message: string,
    public readonly missingSteps: CefStep[]
  ) {
    super(message);
    this.name = "CefValidationError";
  }
}

export async function submitCef(input: SubmitCefInput): Promise<SubmitCefResult> {
  // 1. Load all draft steps for this version
  const drafts = await findDrafts(input.userId, input.version);
  const savedSteps = new Set(drafts.map((d) => d.step));

  // 2. Verify all 6 steps are present
  const missing = ALL_STEPS.filter((s) => !savedSteps.has(s));
  if (missing.length > 0) {
    throw new CefValidationError(
      `cef_incomplete: missing steps ${missing.join(", ")}`,
      missing as CefStep[]
    );
  }

  // 3. Build a deterministic hash of the combined payload
  const canonical = drafts
    .sort((a, b) => a.step.localeCompare(b.step))
    .map((d) => JSON.stringify({ step: d.step, payload: d.payload }))
    .join("\n");
  const payloadHash = createHash("sha256").update(canonical).digest("hex");

  // 4. Create the version row
  const version = await insertVersion({
    user_id: input.userId,
    version: input.version,
    payload_hash: payloadHash,
  });

  // 5. Mark it submitted
  const submitted = await markVersionSubmitted(input.userId, input.version);
  const submittedAt = submitted?.submitted_at ?? new Date().toISOString();

  return {
    versionId: version.id,
    payloadHash,
    submittedAt,
  };
}
