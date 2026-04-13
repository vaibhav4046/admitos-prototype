/**
 * tests/lib/raw-snapshot-writer.test.ts
 *
 * Gap 1 — Tests for the Layer 1 JSONL raw snapshot writer.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import {
  writeRawSnapshot,
  readRawSnapshots,
  type RawSnapshotRecord,
} from "@/lib/pipeline/raw-snapshot-writer";

const TEST_DIR = join(tmpdir(), "admitos-snapshot-test-" + Date.now());

const SAMPLE_RECORD: RawSnapshotRecord = {
  source_url: "https://reddit.com/r/ApplyingToCollege/test123",
  source_type: "reddit",
  title: "Chance me for MIT",
  body: "SAT: 1550, GPA: 3.95, 5 APs...",
  author: "test_user",
  created_utc: 1712700000,
  scraped_at: "2026-04-10T00:00:00Z",
};

describe("raw-snapshot-writer", () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it("creates the output directory if it doesn't exist", () => {
    const outFile = writeRawSnapshot(SAMPLE_RECORD, { dataDir: TEST_DIR });
    expect(existsSync(outFile)).toBe(true);
  });

  it("writes a valid JSON line", () => {
    const outFile = writeRawSnapshot(SAMPLE_RECORD, { dataDir: TEST_DIR });
    const content = readFileSync(outFile, "utf-8").trim();
    const parsed = JSON.parse(content);
    expect(parsed.source_url).toBe(SAMPLE_RECORD.source_url);
    expect(parsed.title).toBe(SAMPLE_RECORD.title);
  });

  it("appends multiple records to the same file", () => {
    writeRawSnapshot(SAMPLE_RECORD, { dataDir: TEST_DIR });
    writeRawSnapshot(
      { ...SAMPLE_RECORD, source_url: "https://reddit.com/r/test/456" },
      { dataDir: TEST_DIR },
    );
    const today = new Date().toISOString().slice(0, 10);
    const outFile = join(TEST_DIR, "raw", "reddit", `${today}.jsonl`);
    const lines = readFileSync(outFile, "utf-8").trim().split("\n");
    expect(lines).toHaveLength(2);
  });

  it("uses correct date-partitioned path format", () => {
    const outFile = writeRawSnapshot(SAMPLE_RECORD, { dataDir: TEST_DIR });
    const today = new Date().toISOString().slice(0, 10);
    // Normalize to forward slashes for cross-platform comparison
    const normalized = outFile.replace(/\\/g, "/");
    expect(normalized).toContain(`raw/reddit/${today}.jsonl`);
  });

  it("supports custom source parameter", () => {
    const outFile = writeRawSnapshot(SAMPLE_RECORD, {
      dataDir: TEST_DIR,
      source: "chanceme",
    });
    const normalized = outFile.replace(/\\/g, "/");
    expect(normalized).toContain("raw/chanceme/");
  });

  it("readRawSnapshots round-trips correctly", () => {
    const outFile = writeRawSnapshot(SAMPLE_RECORD, { dataDir: TEST_DIR });
    writeRawSnapshot(
      { ...SAMPLE_RECORD, author: "user2" },
      { dataDir: TEST_DIR },
    );
    const records = readRawSnapshots(outFile);
    expect(records).toHaveLength(2);
    expect(records[0]!.author).toBe("test_user");
    expect(records[1]!.author).toBe("user2");
  });

  it("each line is valid JSON independently", () => {
    writeRawSnapshot(SAMPLE_RECORD, { dataDir: TEST_DIR });
    writeRawSnapshot(
      { ...SAMPLE_RECORD, title: "Second post" },
      { dataDir: TEST_DIR },
    );
    const today = new Date().toISOString().slice(0, 10);
    const outFile = join(TEST_DIR, "raw", "reddit", `${today}.jsonl`);
    const lines = readFileSync(outFile, "utf-8").trim().split("\n");
    for (const line of lines) {
      expect(() => JSON.parse(line)).not.toThrow();
    }
  });
});
