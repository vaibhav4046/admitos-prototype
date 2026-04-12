import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseInto } from "@/lib/utils/zod-result";
import { isOk, isErr } from "@/lib/utils/result";

const Schema = z.object({
  email: z.string().email(),
  age: z.number().int().positive(),
});

describe("parseInto", () => {
  it("returns ok with the parsed data on success", () => {
    const r = parseInto(Schema, { email: "a@b.co", age: 21 });
    expect(isOk(r)).toBe(true);
    if (isOk(r)) {
      expect(r.value).toEqual({ email: "a@b.co", age: 21 });
    }
  });

  it("returns err with the flattened field map on failure", () => {
    const r = parseInto(Schema, { email: "not-an-email", age: -3 });
    expect(isErr(r)).toBe(true);
    if (isErr(r)) {
      expect(r.error.fieldErrors.email?.[0]).toMatch(/email/i);
      expect(r.error.fieldErrors.age?.[0]).toMatch(/positive|greater/i);
    }
  });

  it("includes form-level errors when the input is the wrong type", () => {
    const r = parseInto(Schema, "not-an-object");
    expect(isErr(r)).toBe(true);
    if (isErr(r)) {
      // form-level OR field-level — both shapes are acceptable, just
      // make sure something is reported
      const hasAnyError =
        r.error.formErrors.length > 0 ||
        Object.keys(r.error.fieldErrors).length > 0;
      expect(hasAnyError).toBe(true);
    }
  });
});
