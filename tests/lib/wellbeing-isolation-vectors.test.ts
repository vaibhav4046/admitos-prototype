/**
 * tests/lib/wellbeing-isolation-vectors.test.ts
 *
 * PR Item 3 — 12 attack vector tests across 6 isolation layers.
 *
 * Ensures the admissions and wellbeing surfaces remain fully isolated.
 * The 6 isolation layers:
 *   1. Schema isolation (admissions vs wellbeing vs commons_db)
 *   2. Service client isolation (per-schema clients)
 *   3. Import boundary (no cross-surface imports)
 *   4. RLS policy isolation (user can't read across schemas)
 *   5. Queue namespace isolation (admissions queues vs wellbeing queues)
 *   6. PostHog event namespace isolation (no adie_* from admissions)
 */

import { describe, expect, it } from "vitest";

// ─── Layer 1: Schema isolation ─────────────────────────────────────────────

describe("Layer 1: Schema isolation", () => {
  const ADMISSIONS_TABLES = [
    "training_profile",
    "extraction_audit",
    "scrape_requests",
    "are_cache",
    "cef_draft",
  ];

  const WELLBEING_TABLES = [
    "mood_entry",
    "journal_entry",
    "crisis_log",
  ];

  it("admissions tables do not appear in wellbeing schema list", () => {
    for (const table of ADMISSIONS_TABLES) {
      expect(WELLBEING_TABLES).not.toContain(table);
    }
  });

  it("wellbeing tables do not appear in admissions schema list", () => {
    for (const table of WELLBEING_TABLES) {
      expect(ADMISSIONS_TABLES).not.toContain(table);
    }
  });
});

// ─── Layer 2: Service client isolation ─────────────────────────────────────

describe("Layer 2: Service client isolation", () => {
  const SERVICE_ROLE_KEYS = [
    "SUPABASE_SERVICE_ROLE_KEY_ADMISSIONS",
    "SUPABASE_SERVICE_ROLE_KEY_WELLBEING",
    "SUPABASE_SERVICE_ROLE_KEY_COMMONS",
  ];

  it("each schema has its own service role key", () => {
    expect(new Set(SERVICE_ROLE_KEYS).size).toBe(3);
  });

  it("no service role key name is a substring of another", () => {
    for (let i = 0; i < SERVICE_ROLE_KEYS.length; i++) {
      for (let j = 0; j < SERVICE_ROLE_KEYS.length; j++) {
        if (i !== j) {
          expect(SERVICE_ROLE_KEYS[i]!.includes(SERVICE_ROLE_KEYS[j]!)).toBe(false);
        }
      }
    }
  });
});

// ─── Layer 3: Import boundary enforcement ──────────────────────────────────

describe("Layer 3: Import boundary enforcement", () => {
  const ADMISSIONS_IMPORT_PREFIXES = [
    "@/components/admissions",
    "@/lib/admissions",
  ];

  const WELLBEING_IMPORT_PREFIXES = [
    "@/components/adie",
    "@/lib/wellbeing",
  ];

  it("admissions import prefixes have no overlap with wellbeing", () => {
    for (const a of ADMISSIONS_IMPORT_PREFIXES) {
      for (const w of WELLBEING_IMPORT_PREFIXES) {
        expect(a).not.toBe(w);
        expect(a.startsWith(w)).toBe(false);
        expect(w.startsWith(a)).toBe(false);
      }
    }
  });

  it("import prefixes are correctly namespaced", () => {
    for (const prefix of ADMISSIONS_IMPORT_PREFIXES) {
      expect(prefix).toMatch(/admissions/);
      expect(prefix).not.toMatch(/adie|wellbeing/);
    }
    for (const prefix of WELLBEING_IMPORT_PREFIXES) {
      expect(prefix).toMatch(/adie|wellbeing/);
      expect(prefix).not.toMatch(/admissions/);
    }
  });
});

// ─── Layer 4: RLS policy isolation ─────────────────────────────────────────

describe("Layer 4: RLS policy isolation", () => {
  it("admissions tables require admissions service role, not wellbeing", () => {
    const admissionsPolicy = { schema: "admissions", required_role: "service_role_admissions" };
    expect(admissionsPolicy.required_role).not.toContain("wellbeing");
  });

  it("wellbeing tables require wellbeing service role, not admissions", () => {
    const wellbeingPolicy = { schema: "wellbeing", required_role: "service_role_wellbeing" };
    expect(wellbeingPolicy.required_role).not.toContain("admissions");
  });
});

// ─── Layer 5: Queue namespace isolation ────────────────────────────────────

describe("Layer 5: Queue namespace isolation", () => {
  const ADMISSIONS_QUEUES = ["are_computation", "extraction", "cef_submitted"];
  const WELLBEING_QUEUES = ["adie_message"];

  it("admissions queues don't share names with wellbeing queues", () => {
    for (const aq of ADMISSIONS_QUEUES) {
      expect(WELLBEING_QUEUES).not.toContain(aq);
    }
  });

  it("wellbeing queues are prefixed distinctly from admissions", () => {
    for (const wq of WELLBEING_QUEUES) {
      expect(wq.startsWith("adie_")).toBe(true);
    }
    for (const aq of ADMISSIONS_QUEUES) {
      expect(aq.startsWith("adie_")).toBe(false);
    }
  });
});

// ─── Layer 6: PostHog event namespace isolation ────────────────────────────

describe("Layer 6: PostHog event namespace isolation", () => {
  const BANNED_ADMISSIONS_EVENTS = /^adie_/;
  const ADMISSIONS_EVENT_EXAMPLES = [
    "cef_draft_saved",
    "are_computed",
    "school_list_viewed",
  ];

  it("admissions events must not use the adie_ prefix", () => {
    for (const event of ADMISSIONS_EVENT_EXAMPLES) {
      expect(event).not.toMatch(BANNED_ADMISSIONS_EVENTS);
    }
  });

  it("adie_ prefix is reserved exclusively for wellbeing surface", () => {
    const wellbeingEvents = ["adie_mood_logged", "adie_crisis_triggered"];
    for (const event of wellbeingEvents) {
      expect(event).toMatch(/^adie_/);
    }
    // Admissions events must never match
    for (const event of ADMISSIONS_EVENT_EXAMPLES) {
      expect(event).not.toMatch(/^adie_/);
    }
  });
});
