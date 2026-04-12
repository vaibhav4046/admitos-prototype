/**
 * adie_message queue handler. WELLBEING SCHEMA ONLY.
 *
 * Fired when a student sends a message in the Adie chat. The handler:
 *
 *   1. Loads conversation history from `wellbeing.adie_conversation`
 *   2. Calls `callLLM(ADIE_CHAT, ...)` against the wellbeing-scoped
 *      service client
 *   3. Calls `callLLM(ADIE_CRISIS_CHECK, ...)` in parallel — if it
 *      returns `flag=true`, writes an AuditEvent
 *      ADIE_CRISIS_FLAG_RAISED and enqueues an audit_alerts job
 *   4. Writes the response message to `wellbeing.adie_message`
 *   5. NEVER touches PostHog. NEVER touches the admissions schema.
 *
 * The crisis-check pass is a separate prompt slot deliberately — we
 * want to be able to update the crisis prompt without redeploying the
 * chat prompt, and vice versa.
 *
 * Skeleton for M1.
 */

import "server-only";

import type { Processor } from "bullmq";

import { addBreadcrumb } from "@/lib/observability";

interface AdieMessageJobData {
  conversationId: string;
  userId: string;
  messageId: string;
  requestId: string;
}

export const handleAdieMessage: Processor<AdieMessageJobData, void> = async (
  job
) => {
  addBreadcrumb("queue.adie_message.start", {
    jobId: job.id,
    conversationId: job.data.conversationId,
  });

  // TODO(M1 Week 2):
  //   - load history (wellbeing schema only)
  //   - parallel callLLM(ADIE_CHAT) + callLLM(ADIE_CRISIS_CHECK)
  //   - if crisis flag → audit + audit_alerts job
  //   - write reply to wellbeing.adie_message

  addBreadcrumb("queue.adie_message.done.stub", { jobId: job.id });
};
