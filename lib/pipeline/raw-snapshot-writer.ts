/**
 * Layer 1 JSONL raw snapshot writer per ADR-002.
 *
 * Every scraped post is written as a single JSON line to a
 * date-partitioned file BEFORE extraction. This preserves the raw
 * data for re-extraction with improved prompts.
 *
 * Output: data/raw/{source}/{YYYY-MM-DD}.jsonl
 *
 * Files are append-only and immutable once written. The `data/`
 * directory is gitignored (ADR-002).
 */

import "server-only";

import { readFileSync, mkdirSync, appendFileSync, existsSync } from "fs";
import { join } from "path";

export interface RawSnapshotRecord {
  source_url: string;
  source_type: string;
  title: string;
  body: string;
  author: string;
  created_utc: number;
  scraped_at: string;
}

/** Default data directory relative to project root. */
const DEFAULT_DATA_DIR = join(process.cwd(), "data");

/**
 * Append a single record as a JSON line to the daily snapshot file.
 *
 * @returns The absolute path of the JSONL file written to.
 */
export function writeRawSnapshot(
  record: RawSnapshotRecord,
  opts?: { dataDir?: string; source?: string },
): string {
  const dataDir = opts?.dataDir ?? DEFAULT_DATA_DIR;
  const source = opts?.source ?? "reddit";
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const outDir = join(dataDir, "raw", source);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const outFile = join(outDir, `${today}.jsonl`);
  const line = JSON.stringify(record) + "\n";

  appendFileSync(outFile, line, "utf-8");
  return outFile;
}

/**
 * Read all records from a JSONL snapshot file.
 * Useful for re-extraction and auditing.
 */
export function readRawSnapshots(filePath: string): RawSnapshotRecord[] {
  const content = readFileSync(filePath, "utf-8");
  return content
    .trim()
    .split("\n")
    .filter((line: string) => line.length > 0)
    .map((line: string) => JSON.parse(line) as RawSnapshotRecord);
}
