/**
 * audit_alerts queue handler.
 *
 * Subscribes to AuditEvent rows that match alerting rules — primarily
 * crisis flags from Adie, GDPR DSAR requests, and counsellor-rejected
 * essays — and dispatches an out-of-band notification (Slack webhook
 * for staff, email for the affected user where applicable).
 *
 * The job payload is the AuditEvent id, NOT a copy of the row, so the
 * worker re-reads from the source of truth. This prevents stale
 * alerting if an audit row is amended (it can't be, but defense in
 * depth).
 *
 * Skeleton for M1.
 */

import "server-only";

import type { Processor } from "bullmq";

import { addBreadcrumb } from "@/lib/observability";

interface AuditAlertJobData {
  auditEventId: string;
  namespace: "admissions" | "wellbeing";
  requestId: string;
}

export const handleAuditAlert: Processor<AuditAlertJobData, void> = async (
  job
) => {
  addBreadcrumb("queue.audit_alerts.start", {
    jobId: job.id,
    auditEventId: job.data.auditEventId,
  });

  // TODO(M1 Week 2):
  //   - re-read audit_event row by id
  //   - look up alerting rule
  //   - dispatch Slack / email
  //   - write a follow-up audit row "alert.dispatched"

  addBreadcrumb("queue.audit_alerts.done.stub", { jobId: job.id });
};
