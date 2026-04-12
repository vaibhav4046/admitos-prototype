/**
 * tests/lib/result.test.ts
 *
 * Result envelope is small but it's used by enough callers that a
 * regression here would be a quiet bug. Keep tests boring and
 * exhaustive.
 */

import { describe, expect, it } from "vitest";

import {
  ok,
  err,
  isOk,
  isErr,
  mapOk,
  unwrap,
  unwrapOr,
  tryCatch,
  tryCatchAsync,
} from "@/lib/utils/result";

describe("Result envelope", () => {
  it("ok() / err() build the right shape", () => {
    expect(ok(7)).toEqual({ ok: true, value: 7 });
    expect(err("nope")).toEqual({ ok: false, error: "nope" });
  });

  it("isOk / isErr narrow correctly", () => {
    const o = ok(1);
    const e = err("bad");
    expect(isOk(o)).toBe(true);
    expect(isErr(o)).toBe(false);
    expect(isOk(e)).toBe(false);
    expect(isErr(e)).toBe(true);
  });

  it("mapOk transforms success and passes through errors", () => {
    expect(mapOk(ok(2), (x) => x * 3)).toEqual(ok(6));
    expect(mapOk(err("e"), (x: number) => x * 3)).toEqual(err("e"));
  });

  it("unwrap returns value on ok and throws on err", () => {
    expect(unwrap(ok("hi"))).toBe("hi");
    expect(() => unwrap(err("boom"))).toThrow(/boom/);
    expect(() => unwrap(err("boom"), "wrap")).toThrow(/wrap/);
  });

  it("unwrap stringifies non-string errors", () => {
    expect(() => unwrap(err({ code: 42 }))).toThrow(/42/);
  });

  it("unwrapOr returns the fallback on err", () => {
    expect(unwrapOr(ok(5), 0)).toBe(5);
    expect(unwrapOr(err("nope"), 99)).toBe(99);
  });

  it("tryCatch captures sync exceptions", () => {
    const good = tryCatch(() => 42);
    const bad = tryCatch(() => {
      throw new Error("kaboom");
    });
    expect(good).toEqual(ok(42));
    expect(isErr(bad)).toBe(true);
    if (isErr(bad)) expect(bad.error).toBe("kaboom");
  });

  it("tryCatchAsync captures async exceptions", async () => {
    const good = await tryCatchAsync(async () => "yes");
    const bad = await tryCatchAsync(async () => {
      throw new Error("async-boom");
    });
    expect(good).toEqual(ok("yes"));
    expect(isErr(bad)).toBe(true);
    if (isErr(bad)) expect(bad.error).toBe("async-boom");
  });
});
