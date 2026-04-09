/**
 * tests/lib/queue-names.test.ts
 *
 * The BullMQ queue names are LOCKED by the V2 spec and the worker
 * registration — the PRD refers to them verbatim. A typo here will
 * silently create a ghost queue that jobs fall into and never get
 * processed, so we pin both the exact strings AND the per-queue
 * schema routing.
 *
 * The `ADIE_MESSAGE → wellbeing` mapping is the one that really
 * matters — it's the physical-isolation seam. If anyone ever flips
 * it to "admissions" by mistake the audit trail ends up in the
 * wrong schema and we've leaked a wellbeing breadcrumb.
 */

import { describe, expect, it } from "vitest";

import {
  ALL_QUEUE_NAMES,
  QUEUE,
  QUEUE_SCHEMA,
  type QueueName,
} from "@/lib/queues/names";

describe("QUEUE constants", () => {
  it("has the four exact names locked by V2", () => {
    // Don't rename or add without updating the worker registration
    // and telling Andy. These strings MUST match the PRD and the
    // worker process-queues list verbatim.
    expect(QUEUE).toEqual({
      CEF_SUBMITTED: "cef_submitted",
      ESSAY_UPLOADED: "essay_uploaded",
      AUDIT_ALERTS: "audit_alerts",
      ADIE_MESSAGE: "adie_message",
    });
  });

  it("ALL_QUEUE_NAMES is exactly the set of QUEUE values", () => {
    expect([...ALL_QUEUE_NAMES].sort()).toEqual(
      Object.values(QUEUE).sort()
    );
  });

  it("every queue name is lower snake_case", () => {
    for (const name of ALL_QUEUE_NAMES) {
      expect(name).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });

  it("queue names are unique", () => {
    const seen = new Set<string>(ALL_QUEUE_NAMES);
    expect(seen.size).toBe(ALL_QUEUE_NAMES.length);
  });
});

describe("QUEUE_SCHEMA routing", () => {
  it("routes adie_message to the wellbeing schema and only the wellbeing schema", () => {
    // This is the physical isolation seam. Do NOT flip this.
    // If you ever want to process adie_message from an admissions
    // worker you are violating the wellbeing boundary — talk to
    // Andy and the CAO first.
    expect(QUEUE_SCHEMA[QUEUE.ADIE_MESSAGE]).toBe("wellbeing");
  });

  it("routes cef_submitted, essay_uploaded, audit_alerts to admissions", () => {
    expect(QUEUE_SCHEMA[QUEUE.CEF_SUBMITTED]).toBe("admissions");
    expect(QUEUE_SCHEMA[QUEUE.ESSAY_UPLOADED]).toBe("admissions");
    expect(QUEUE_SCHEMA[QUEUE.AUDIT_ALERTS]).toBe("admissions");
  });

  it("covers every queue name — no orphans", () => {
    // A queue that lands in ALL_QUEUE_NAMES without a QUEUE_SCHEMA
    // entry would make the worker throw at startup. Lock it here
    // instead of discovering it in prod.
    for (const name of ALL_QUEUE_NAMES) {
      expect(QUEUE_SCHEMA[name]).toBeDefined();
      // And each entry is one of the two allowed schemas:
      expect(["admissions", "wellbeing"]).toContain(QUEUE_SCHEMA[name]);
    }
  });

  it("the schema router is exhaustive — every QueueName maps somewhere", () => {
    // This also catches the case where someone adds a new queue
    // and forgets to update QUEUE_SCHEMA. TS would flag it at
    // compile time; this test flags it at runtime too.
    const routed = Object.keys(QUEUE_SCHEMA) as QueueName[];
    expect(routed.sort()).toEqual([...ALL_QUEUE_NAMES].sort());
  });
});
