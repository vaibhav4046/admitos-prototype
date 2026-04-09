/**
 * CEF wizard entry page.
 *
 * Hitting `/cef` lands the student on step 1, or resumes at whatever
 * step they last saved. The resume logic queries
 * `admissions.cef_submission` for the most recent row for this user
 * and reads the `current_step` column.
 *
 * In M1 the resume query is stubbed — we always start at step 1. Once
 * the CEF field schema is finalized we'll wire the real DB read here.
 */

import { redirect } from "next/navigation";

export default function CefEntryPage() {
  // TODO(M1): read resume step from admissions.cef_submission
  const resumeStep = 1;
  redirect(`/cef/${resumeStep}`);
}
