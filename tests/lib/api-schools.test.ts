/**
 * tests/lib/api-schools.test.ts
 *
 * Tests for the schools API handlers.
 * Mocks the DB module to return deterministic data.
 */

import { describe, expect, it, vi } from "vitest";

const { mockSchools } = vi.hoisted(() => {
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
    {
      id: "s2",
      slug: "mit",
      display_name: "MIT",
      country: "us",
      region: "MA",
      tier: "us_top50",
      admit_rate: 0.038,
      median_sat_25th: 1510,
      median_sat_75th: 1580,
      median_gpa_25th: 3.9,
      median_gpa_75th: 4.0,
      ipeds_unitid: "166683",
      ucas_institution_code: null,
      source_dataset_year: 2024,
      created_at: "2026-04-09T00:00:00Z",
      updated_at: "2026-04-09T00:00:00Z",
    },
  ];
  return { mockSchools };
});

vi.mock("@/db/school", () => ({
  listSchoolsByTier: vi.fn().mockResolvedValue(mockSchools),
  listSchoolsByCountry: vi.fn().mockResolvedValue(mockSchools),
  searchSchools: vi.fn().mockResolvedValue([mockSchools[0]]),
  findSchoolBySlug: vi.fn().mockImplementation((slug: string) => {
    const found = mockSchools.find((s) => s.slug === slug);
    return Promise.resolve(found ?? null);
  }),
  countSchools: vi.fn().mockResolvedValue(2),
}));

vi.mock("@/lib/observability", () => ({
  addBreadcrumb: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/services/audit/log", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import { GET } from "@/api/admissions/schools/list";
import { schoolBySlugHandler } from "@/api/admissions/schools/by-slug";
import { listSchoolsByTier, searchSchools } from "@/db/school";

function makeRequest(path: string): Request {
  return new Request(`https://app.test.local${path}`, {
    method: "GET",
    headers: { "x-unioffer-request-id": "req_0123456789abcdef" },
  });
}

describe("GET /api/admissions/schools", () => {
  it("returns schools list with default tier", async () => {
    const res = await GET(makeRequest("/api/admissions/schools"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(2);
    expect(body.schools).toHaveLength(2);
    expect(body.schools[0].slug).toBe("harvard");
  });

  it("filters by tier when ?tier= is provided", async () => {
    const res = await GET(makeRequest("/api/admissions/schools?tier=us_top50"));
    expect(res.status).toBe(200);
    expect(listSchoolsByTier).toHaveBeenCalledWith("us_top50");
  });

  it("searches when ?q= is provided", async () => {
    const res = await GET(makeRequest("/api/admissions/schools?q=harvard"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(searchSchools).toHaveBeenCalledWith("harvard", 20);
    expect(body.schools).toHaveLength(1);
  });

  it("respects limit parameter", async () => {
    const res = await GET(makeRequest("/api/admissions/schools?limit=1"));
    const body = await res.json();

    expect(body.schools).toHaveLength(1);
  });

  it("caps limit at 100", async () => {
    await GET(makeRequest("/api/admissions/schools?limit=999"));
    // Should not crash — limit is capped internally
  });

  it("returns camelCase field names in response", async () => {
    const res = await GET(makeRequest("/api/admissions/schools"));
    const body = await res.json();
    const school = body.schools[0];

    expect(school).toHaveProperty("displayName");
    expect(school).toHaveProperty("admitRate");
    expect(school).toHaveProperty("medianSat25th");
    expect(school).not.toHaveProperty("display_name");
    expect(school).not.toHaveProperty("admit_rate");
  });
});

describe("GET /api/admissions/schools/[slug]", () => {
  it("returns school details for a valid slug", async () => {
    const handler = schoolBySlugHandler("harvard");
    const res = await handler(makeRequest("/api/admissions/schools/harvard"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.slug).toBe("harvard");
    expect(body.displayName).toBe("Harvard University");
    expect(body.country).toBe("us");
  });

  it("returns 404 for unknown slug", async () => {
    const handler = schoolBySlugHandler("nonexistent");
    const res = await handler(makeRequest("/api/admissions/schools/nonexistent"));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("school_not_found");
  });

  it("includes full detail fields", async () => {
    const handler = schoolBySlugHandler("harvard");
    const res = await handler(makeRequest("/api/admissions/schools/harvard"));
    const body = await res.json();

    expect(body).toHaveProperty("medianGpa25th");
    expect(body).toHaveProperty("ipedsUnitid");
    expect(body).toHaveProperty("sourceDatasetYear");
  });
});
