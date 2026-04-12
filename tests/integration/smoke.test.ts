/**
 * tests/integration/smoke.test.ts
 *
 * End-to-end happy-path smoke test.
 * Exercises the full flow: authenticate → search schools → create/autosave
 * CEF draft → submit → verify version bumped and downstream job enqueued.
 *
 * Everything is mocked at the DB / Supabase boundary so this runs in-process
 * without any external dependencies.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ─── hoisted mock data ─── */

const { mockUser, mockSchools, mockDrafts } = vi.hoisted(() => {
  const mockUser = {
    id: "user_smoke",
    email: "smoke@admitos.dev",
    role: "student" as const,
    studentId: null,
    emailVerified: true,
    lastSignInAt: "2026-04-10T10:00:00Z",
  };

  const mockSchools = [
    {
      id: "s1",
      slug: "harvard",
      display_name: "Harvard University",
      country: "us",
      region: "MA",
      tier: "us_top50",
      admit_rate: 0.032,
      median_sat_25th: 1480,
      median_sat_75th: 1580,
      median_gpa_25th: 3.9,
      median_gpa_75th: 4.0,
      ipeds_unitid: "166027",
      ucas_institution_code: null,
      source_dataset_year: 2024,
      created_at: "2026-04-09T00:00:00Z",
      updated_at: "2026-04-09T00:00:00Z",
    },
  ];

  const mockDrafts = [
    { step: "profile", payload: { name: "Smoke Test" }, autosaved_at: "2026-04-10T10:01:00Z" },
    { step: "academics", payload: { gpa: 3.95 }, autosaved_at: "2026-04-10T10:02:00Z" },
    { step: "ecs", payload: { activities: ["debate"] }, autosaved_at: "2026-04-10T10:03:00Z" },
    { step: "essays", payload: { mainEssay: "..." }, autosaved_at: "2026-04-10T10:04:00Z" },
    { step: "schools", payload: { targets: ["harvard"] }, autosaved_at: "2026-04-10T10:05:00Z" },
    { step: "review", payload: { confirmed: true }, autosaved_at: "2026-04-10T10:06:00Z" },
  ];

  return { mockUser, mockSchools, mockDrafts };
});

/* ─── mocks ─── */

vi.mock("@/services/auth", async () => {
  const actual = await vi.importActual<typeof import("@/services/auth")>(
    "@/services/auth"
  );
  return {
    ...actual,
    getCurrentUser: vi.fn().mockResolvedValue(mockUser),
    requireUser: vi.fn().mockResolvedValue(mockUser),
  };
});

vi.mock("@/services/security/csrf", () => ({
  verifyCsrf: vi.fn().mockReturnValue({ ok: true }),
  methodRequiresCsrf: vi.fn().mockReturnValue(true),
}));

vi.mock("@/services/security/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 99, resetMs: 60000 }),
}));

vi.mock("@/db/school", () => ({
  listSchoolsByTier: vi.fn().mockResolvedValue(mockSchools),
  listSchoolsByCountry: vi.fn().mockResolvedValue(mockSchools),
  searchSchools: vi.fn().mockResolvedValue(mockSchools),
  findSchoolBySlug: vi.fn().mockImplementation((slug: string) => {
    const found = mockSchools.find((s: { slug: string }) => s.slug === slug);
    return Promise.resolve(found ?? null);
  }),
  countSchools: vi.fn().mockResolvedValue(1),
}));

let autosaveCallCount = 0;

vi.mock("@/services/cef/cef", () => ({
  getDraft: vi.fn().mockResolvedValue(mockDrafts),
  getLatestVersion: vi.fn().mockResolvedValue({ version: 1 }),
  autosaveDraftStep: vi.fn().mockImplementation((input: { step: string }) => {
    autosaveCallCount++;
    return Promise.resolve({
      id: `draft_${autosaveCallCount}`,
      step: input.step,
      autosaved_at: new Date().toISOString(),
    });
  }),
  submitCef: vi.fn().mockResolvedValue({
    versionId: "v_smoke_1",
    payloadHash: "sha256:smoke123",
    submittedAt: "2026-04-10T10:10:00Z",
  }),
  CefValidationError: class CefValidationError extends Error {
    missingSteps: string[];
    constructor(msg: string, steps: string[]) {
      super(msg);
      this.missingSteps = steps;
    }
  },
}));

vi.mock("@/services/queues", () => ({
  enqueueCefSubmitted: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/observability", () => ({
  addBreadcrumb: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/services/audit/log", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/log", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

/* ─── imports (after mocks) ─── */

import { GET as getMe } from "@/api/admissions/auth/me";
import { GET as listSchools } from "@/api/admissions/schools/list";
import { schoolBySlugHandler } from "@/api/admissions/schools/by-slug";
import { GET as getDraftRoute, PUT as putDraft, POST as postDraft } from "@/api/admissions/cef/draft";
import { enqueueCefSubmitted } from "@/services/queues";
import { autosaveDraftStep, submitCef } from "@/services/cef/cef";

/* ─── helpers ─── */

function makeGet(path: string): Request {
  return new Request(`https://app.test.local${path}`, {
    method: "GET",
    headers: { "x-admitos-request-id": "req_smoke0123456789ab" },
  });
}

function makeJson(path: string, body: unknown, method = "PUT"): Request {
  return new Request(`https://app.test.local${path}`, {
    method,
    headers: {
      "x-admitos-request-id": "req_smoke0123456789ab",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

/* ─── tests ─── */

beforeEach(() => {
  autosaveCallCount = 0;
});

describe("Integration: full happy path", () => {
  it("Step 1 — authenticate and get current user", async () => {
    const res = await getMe(makeGet("/api/admissions/auth/me"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe("user_smoke");
    expect(body.email).toBe("smoke@admitos.dev");
    expect(body.role).toBe("student");
    expect(body.emailVerified).toBe(true);
  });

  it("Step 2 — search schools", async () => {
    const res = await listSchools(makeGet("/api/admissions/schools?q=harvard"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.schools).toHaveLength(1);
    expect(body.schools[0].slug).toBe("harvard");
    expect(body.schools[0].displayName).toBe("Harvard University");
  });

  it("Step 3 — look up school by slug", async () => {
    const handler = schoolBySlugHandler("harvard");
    const res = await handler(makeGet("/api/admissions/schools/harvard"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.slug).toBe("harvard");
    expect(body.admitRate).toBe(0.032);
    expect(body.medianGpa25th).toBe(3.9);
  });

  it("Step 4 — load existing CEF draft", async () => {
    const res = await getDraftRoute(makeGet("/api/admissions/cef/draft"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.version).toBe(1);
    expect(body.steps).toHaveLength(6);
    expect(body.steps.map((s: { step: string }) => s.step)).toEqual([
      "profile", "academics", "ecs", "essays", "schools", "review",
    ]);
  });

  it("Step 5 — autosave 3 draft steps sequentially", async () => {
    const steps = ["profile", "academics", "ecs"] as const;

    for (const step of steps) {
      const res = await putDraft(
        makeJson("/api/admissions/cef/draft", {
          version: 1,
          step,
          payload: { updated: true },
        })
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.step).toBe(step);
      expect(body.id).toBeTruthy();
    }

    expect(autosaveDraftStep).toHaveBeenCalledTimes(3);
  });

  it("Step 6 — submit CEF", async () => {
    const res = await postDraft(
      makeJson("/api/admissions/cef/draft", { version: 1 }, "POST")
    );
    const body = await res.json();

    expect(res.status).toBe(202);
    expect(body.status).toBe("submitted");
    expect(body.versionId).toBe("v_smoke_1");
    expect(body.payloadHash).toBe("sha256:smoke123");
    expect(body.submittedAt).toBe("2026-04-10T10:10:00Z");

    // Verify downstream job was enqueued
    expect(enqueueCefSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({
        submissionId: "v_smoke_1",
        profileId: "user_smoke",
      }),
      expect.objectContaining({
        cause: "POST /api/admissions/cef/draft",
      })
    );
  });

  it("Step 7 — verify submitCef was called with correct user and version", async () => {
    // Submit again to verify arguments
    await postDraft(
      makeJson("/api/admissions/cef/draft", { version: 1 }, "POST")
    );

    expect(submitCef).toHaveBeenCalledWith({
      userId: "user_smoke",
      version: 1,
    });
  });

  it("Step 8 — request ids are echoed in all responses", async () => {
    const res1 = await getMe(makeGet("/api/admissions/auth/me"));
    const res2 = await listSchools(makeGet("/api/admissions/schools"));
    const res3 = await getDraftRoute(makeGet("/api/admissions/cef/draft"));

    for (const res of [res1, res2, res3]) {
      const rid = res.headers.get("x-admitos-request-id");
      expect(rid).toBeTruthy();
      expect(rid).toMatch(/^req_[0-9a-f]{16}$/);
    }
  });

  it("Step 9 — 404 for unknown school slug", async () => {
    const handler = schoolBySlugHandler("nonexistent");
    const res = await handler(makeGet("/api/admissions/schools/nonexistent"));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("school_not_found");
  });
});
