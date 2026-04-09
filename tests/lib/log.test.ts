/**
 * tests/lib/log.test.ts
 *
 * The interesting properties of the logger are:
 *
 *  1. it scrubs fields whose key looks like wellbeing content
 *  2. it respects the level threshold
 *  3. it emits valid JSON lines
 *
 * We mock the Sentry breadcrumb sink to keep the test self-contained.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const breadcrumbs: Array<{ event: string; fields: Record<string, unknown> }> = [];

vi.mock("@/lib/observability", () => ({
  addBreadcrumb: (event: string, fields: Record<string, unknown>) => {
    breadcrumbs.push({ event, fields });
  },
}));

import { log } from "@/lib/log";

describe("log", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    breadcrumbs.length = 0;
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("emits valid JSON with the expected fields", () => {
    log.warn("test.event", { foo: 1, bar: "baz" });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(warnSpy.mock.calls[0][0] as string);
    expect(payload).toMatchObject({
      level: "warn",
      event: "test.event",
      foo: 1,
      bar: "baz",
    });
    expect(typeof payload.ts).toBe("string");
  });

  it("suppresses debug+info in test env (only warn+error get through)", () => {
    log.debug("dbg", { x: 1 });
    log.info("nfo", { x: 1 });
    expect(logSpy).not.toHaveBeenCalled();

    log.warn("wrn", { x: 1 });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("scrubs banned wellbeing field keys", () => {
    log.error("adie.something", {
      "wellbeing.content": "secret thoughts",
      "adie.message.body": "more secret stuff",
      "message.body": "yep",
      "transcript.raw": "audio bytes",
      "ok.field": "fine",
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(payload["wellbeing.content"]).toBe("[REDACTED]");
    expect(payload["adie.message.body"]).toBe("[REDACTED]");
    expect(payload["message.body"]).toBe("[REDACTED]");
    expect(payload["transcript.raw"]).toBe("[REDACTED]");
    expect(payload["ok.field"]).toBe("fine");
  });

  it("does NOT mirror error into breadcrumb (errors go through captureError)", () => {
    log.error("kaboom");
    expect(breadcrumbs).toHaveLength(0);
  });
});
