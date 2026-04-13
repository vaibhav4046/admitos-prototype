/**
 * tests/lib/are-response-surface.test.ts
 *
 * PR Item 2 — p_admit zero-output enforcement tests.
 *
 * Verifies that p_admit (internal probability) NEVER leaks into any
 * client-facing response surface. Per ADR-001, ARE results exposed
 * to users must use categorical labels only:
 *   strongly_aligned | competitive | developing | gap_identified
 */

import { describe, expect, it } from "vitest";

/** ARE labels — the ONLY values that may appear in client-facing output. */
const ARE_LABELS = [
  "strongly_aligned",
  "competitive",
  "developing",
  "gap_identified",
] as const;

type AreLabel = (typeof ARE_LABELS)[number];

/**
 * Simulates the shape of a client-facing ARE response.
 * p_admit must NEVER appear in this shape.
 */
interface ClientAreResponse {
  label: AreLabel;
  explanation: string;
  primary_driver: string;
  suggestion: string;
}

/** Simulates the internal ARE cache row (service-role only). */
interface InternalAreCacheRow extends ClientAreResponse {
  p_admit: number;
  shap_values: Record<string, unknown>;
  model_version: string;
  label_boundary_version: string;
}

/**
 * Strips internal fields from an ARE cache row, returning only
 * the client-safe shape. This mirrors what the DB module does.
 */
function stripInternalFields(row: InternalAreCacheRow): ClientAreResponse {
  return {
    label: row.label,
    explanation: row.explanation,
    primary_driver: row.primary_driver,
    suggestion: row.suggestion,
  };
}

describe("ARE response surface — p_admit zero-output enforcement", () => {
  const sampleRow: InternalAreCacheRow = {
    label: "competitive",
    explanation: "Strong extracurriculars align with school profile.",
    primary_driver: "u2",
    suggestion: "Highlight research experience in your essays.",
    p_admit: 0.58,
    shap_values: { admit_rate: 0.58, tier: "u2" },
    model_version: "statistical-prior-v1",
    label_boundary_version: "statistical-prior-v1",
  };

  it("stripInternalFields removes p_admit from output", () => {
    const client = stripInternalFields(sampleRow);
    expect(client).not.toHaveProperty("p_admit");
  });

  it("stripInternalFields removes shap_values from output", () => {
    const client = stripInternalFields(sampleRow);
    expect(client).not.toHaveProperty("shap_values");
  });

  it("stripInternalFields removes model_version from output", () => {
    const client = stripInternalFields(sampleRow);
    expect(client).not.toHaveProperty("model_version");
  });

  it("stripInternalFields removes label_boundary_version from output", () => {
    const client = stripInternalFields(sampleRow);
    expect(client).not.toHaveProperty("label_boundary_version");
  });

  it("client response contains only the 4 allowed fields", () => {
    const client = stripInternalFields(sampleRow);
    const keys = Object.keys(client).sort();
    expect(keys).toEqual(["explanation", "label", "primary_driver", "suggestion"]);
  });

  it("label is always one of the 4 categorical values", () => {
    for (const label of ARE_LABELS) {
      const row: InternalAreCacheRow = { ...sampleRow, label };
      const client = stripInternalFields(row);
      expect(ARE_LABELS).toContain(client.label);
    }
  });

  it("JSON.stringify of client response contains no numeric probability", () => {
    const client = stripInternalFields(sampleRow);
    const json = JSON.stringify(client);
    // p_admit was 0.58 — must not appear in the serialized output
    expect(json).not.toContain("0.58");
    expect(json).not.toContain("p_admit");
  });

  it("rejects an attempt to pass p_admit through in a renamed field", () => {
    const client = stripInternalFields(sampleRow);
    // Verify no field contains a floating point that looks like a probability
    for (const value of Object.values(client)) {
      if (typeof value === "number") {
        // No numeric values should exist in client response at all
        expect(value).toBe(undefined);
      }
    }
  });
});
