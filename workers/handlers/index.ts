/**
 * Barrel for the worker handler functions.
 *
 * The registry import in `workers/index.ts` reaches into individual
 * files, but anywhere else that needs to reference a handler (e.g.
 * unit tests, manual replay scripts) should go through this barrel
 * so renaming a file is a one-edit operation.
 */

export { handleCefSubmitted } from "./cef-submitted";
export { handleEssayUploaded } from "./essay-uploaded";
export { handleAuditAlert } from "./audit-alerts";
export { handleAdieMessage } from "./adie-message";
