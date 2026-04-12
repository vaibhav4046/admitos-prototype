/**
 * scripts/seed-schools.ts
 *
 * Seeds `commons_db.school` with the Week 0 120-row reference set:
 *
 *   50  US Top 50             (tier = us_top50)
 *   50  US Top 100 "safety"   (tier = us_top100)
 *    2  Oxbridge              (tier = uk_oxbridge)
 *   10  UK Top 10              (tier = uk_top10)
 *    8  UK general             (tier = uk_general)
 *   ——
 *  120  total
 *
 * This is the seed that `supabase/migrations/DRAFTS.md §4` defers
 * to a script rather than hand-authoring. The data is inlined here
 * (rather than read from CSV) so the repo stays self-contained —
 * when the real Common Data Set pipeline lands in Week 3, this is
 * the single place to swap over.
 *
 * The numbers are deliberate ballparks sufficient for:
 *   * local dev (renders the school picker with realistic rows),
 *   * ARE model cold-start priors, and
 *   * unit tests that need a real row to FK against.
 *
 * They are NOT authoritative admissions guidance. The public render
 * is gated on `source_dataset_year` + a "last updated" banner, and
 * the final CDS import will overwrite every row via the idempotent
 * upsert below.
 *
 * Run with: `pnpm db:seed:schools`
 */

import { commonsDb } from "@/db/supabase";
import { readFileSync } from "fs";
import { join } from "path";

type Tier =
  | "us_top50"
  | "us_top100"
  | "uk_oxbridge"
  | "uk_top10"
  | "uk_general"
  | "other";

type InstitutionType = "university" | "lac";
type TierBand = "u1" | "u2" | "u3" | "u4" | "u5" | "l1" | "l2" | "l3" | "l4";

interface SchoolSeedRowBase {
  slug: string;
  display_name: string;
  country: "us" | "uk";
  region: string | null;
  tier: Tier;
  admit_rate: number | null;
  median_sat_25th: number | null;
  median_sat_75th: number | null;
  median_gpa_25th: number | null;
  median_gpa_75th: number | null;
  source_dataset_year: number;
}

interface SchoolSeedRow extends SchoolSeedRowBase {
  institution_type: InstitutionType | null;
  tier_band: TierBand | null;
}

/**
 * Parse a CSV file into SchoolSeedRow objects.
 * CSV must have headers matching the SchoolSeedRow interface.
 */
function parseSeedCsv(filePath: string, defaultTier: Tier): SchoolSeedRow[] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  const headerLine = lines[0];
  if (!headerLine) return [];
  const headers = headerLine.split(",");

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h.trim()] = values[i]?.trim() ?? ""));

    const get = (key: string): string => row[key] ?? "";

    return {
      slug: get("slug"),
      display_name: get("display_name"),
      country: get("country") as "us" | "uk",
      region: get("region") || null,
      tier: defaultTier,
      institution_type: (get("institution_type") as InstitutionType) || null,
      tier_band: (get("tier_band") as TierBand) || null,
      admit_rate: get("admit_rate") ? parseFloat(get("admit_rate")) : null,
      median_sat_25th: get("median_sat_25th") ? parseInt(get("median_sat_25th")) : null,
      median_sat_75th: get("median_sat_75th") ? parseInt(get("median_sat_75th")) : null,
      median_gpa_25th: get("median_gpa_25th") ? parseFloat(get("median_gpa_25th")) : null,
      median_gpa_75th: get("median_gpa_75th") ? parseFloat(get("median_gpa_75th")) : null,
      source_dataset_year: parseInt(get("source_dataset_year")) || 2024,
    };
  });
}

const SEED_DATA_DIR = join(__dirname, "..", "docs", "seed-data");

// Load from CSV files when available, fallback to inline data
let CSV_US_TOP50: SchoolSeedRow[] = [];
let CSV_UK: SchoolSeedRow[] = [];
let CSV_LACS: SchoolSeedRow[] = [];
try {
  CSV_US_TOP50 = parseSeedCsv(join(SEED_DATA_DIR, "us-top50.csv"), "us_top50");
  CSV_UK = parseSeedCsv(join(SEED_DATA_DIR, "uk-oxbridge-top10.csv"), "uk_top10");
  CSV_LACS = parseSeedCsv(join(SEED_DATA_DIR, "us-top-lacs.csv"), "us_top50");
  // eslint-disable-next-line no-console
  console.log(`[seed-schools] Loaded CSV seed data: ${CSV_US_TOP50.length} US top50, ${CSV_UK.length} UK, ${CSV_LACS.length} LACs`);
} catch {
  // eslint-disable-next-line no-console
  console.log("[seed-schools] CSV seed data not found, using inline data only");
}

const YEAR = 2024;

// -----------------------------------------------------------------------------
// US Top 50 — 50 rows
// -----------------------------------------------------------------------------
// Ballpark admit/SAT/GPA from public CDS snapshots circa 2023–24. These get
// overwritten by the real CDS importer once it lands; treat them as priors.
const US_TOP50: SchoolSeedRowBase[] = [
  { slug: "harvard-university",               display_name: "Harvard University",                            country: "us", region: "MA", tier: "us_top50", admit_rate: 0.0315, median_sat_25th: 1480, median_sat_75th: 1580, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "princeton-university",             display_name: "Princeton University",                          country: "us", region: "NJ", tier: "us_top50", admit_rate: 0.0418, median_sat_25th: 1510, median_sat_75th: 1580, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "yale-university",                  display_name: "Yale University",                               country: "us", region: "CT", tier: "us_top50", admit_rate: 0.0425, median_sat_25th: 1500, median_sat_75th: 1580, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "stanford-university",              display_name: "Stanford University",                           country: "us", region: "CA", tier: "us_top50", admit_rate: 0.0368, median_sat_25th: 1510, median_sat_75th: 1580, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "mit",                              display_name: "Massachusetts Institute of Technology",         country: "us", region: "MA", tier: "us_top50", admit_rate: 0.0396, median_sat_25th: 1520, median_sat_75th: 1580, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "columbia-university",              display_name: "Columbia University",                           country: "us", region: "NY", tier: "us_top50", admit_rate: 0.0394, median_sat_25th: 1500, median_sat_75th: 1570, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "university-of-chicago",            display_name: "University of Chicago",                         country: "us", region: "IL", tier: "us_top50", admit_rate: 0.0541, median_sat_25th: 1510, median_sat_75th: 1580, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "university-of-pennsylvania",       display_name: "University of Pennsylvania",                    country: "us", region: "PA", tier: "us_top50", admit_rate: 0.0584, median_sat_25th: 1490, median_sat_75th: 1570, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "duke-university",                  display_name: "Duke University",                               country: "us", region: "NC", tier: "us_top50", admit_rate: 0.0617, median_sat_25th: 1490, median_sat_75th: 1560, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "northwestern-university",          display_name: "Northwestern University",                       country: "us", region: "IL", tier: "us_top50", admit_rate: 0.0726, median_sat_25th: 1490, median_sat_75th: 1560, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "brown-university",                 display_name: "Brown University",                              country: "us", region: "RI", tier: "us_top50", admit_rate: 0.0505, median_sat_25th: 1500, median_sat_75th: 1570, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "dartmouth-college",                display_name: "Dartmouth College",                             country: "us", region: "NH", tier: "us_top50", admit_rate: 0.0617, median_sat_25th: 1500, median_sat_75th: 1570, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "cornell-university",               display_name: "Cornell University",                            country: "us", region: "NY", tier: "us_top50", admit_rate: 0.0741, median_sat_25th: 1470, median_sat_75th: 1560, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "vanderbilt-university",            display_name: "Vanderbilt University",                         country: "us", region: "TN", tier: "us_top50", admit_rate: 0.0670, median_sat_25th: 1490, median_sat_75th: 1560, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "rice-university",                  display_name: "Rice University",                               country: "us", region: "TX", tier: "us_top50", admit_rate: 0.0834, median_sat_25th: 1500, median_sat_75th: 1570, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "notre-dame",                       display_name: "University of Notre Dame",                      country: "us", region: "IN", tier: "us_top50", admit_rate: 0.1181, median_sat_25th: 1440, median_sat_75th: 1550, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "ucla",                             display_name: "University of California, Los Angeles",         country: "us", region: "CA", tier: "us_top50", admit_rate: 0.0857, median_sat_25th: 1380, median_sat_75th: 1540, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "uc-berkeley",                      display_name: "University of California, Berkeley",            country: "us", region: "CA", tier: "us_top50", admit_rate: 0.1129, median_sat_25th: 1360, median_sat_75th: 1530, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "johns-hopkins-university",         display_name: "Johns Hopkins University",                      country: "us", region: "MD", tier: "us_top50", admit_rate: 0.0713, median_sat_25th: 1520, median_sat_75th: 1570, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "washington-university-st-louis",   display_name: "Washington University in St. Louis",            country: "us", region: "MO", tier: "us_top50", admit_rate: 0.1091, median_sat_25th: 1500, median_sat_75th: 1570, median_gpa_25th: 3.90, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "emory-university",                 display_name: "Emory University",                              country: "us", region: "GA", tier: "us_top50", admit_rate: 0.1116, median_sat_25th: 1450, median_sat_75th: 1540, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "georgetown-university",            display_name: "Georgetown University",                         country: "us", region: "DC", tier: "us_top50", admit_rate: 0.1219, median_sat_25th: 1400, median_sat_75th: 1540, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "usc",                              display_name: "University of Southern California",             country: "us", region: "CA", tier: "us_top50", admit_rate: 0.0975, median_sat_25th: 1440, median_sat_75th: 1540, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "carnegie-mellon-university",       display_name: "Carnegie Mellon University",                    country: "us", region: "PA", tier: "us_top50", admit_rate: 0.1136, median_sat_25th: 1480, median_sat_75th: 1560, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "uva",                              display_name: "University of Virginia",                        country: "us", region: "VA", tier: "us_top50", admit_rate: 0.1628, median_sat_25th: 1400, median_sat_75th: 1520, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "university-of-michigan",           display_name: "University of Michigan",                        country: "us", region: "MI", tier: "us_top50", admit_rate: 0.1712, median_sat_25th: 1360, median_sat_75th: 1530, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "wake-forest-university",           display_name: "Wake Forest University",                        country: "us", region: "NC", tier: "us_top50", admit_rate: 0.2101, median_sat_25th: 1380, median_sat_75th: 1500, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "tufts-university",                 display_name: "Tufts University",                              country: "us", region: "MA", tier: "us_top50", admit_rate: 0.0972, median_sat_25th: 1440, median_sat_75th: 1550, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "nyu",                              display_name: "New York University",                           country: "us", region: "NY", tier: "us_top50", admit_rate: 0.0803, median_sat_25th: 1470, median_sat_75th: 1570, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "boston-college",                   display_name: "Boston College",                                country: "us", region: "MA", tier: "us_top50", admit_rate: 0.1517, median_sat_25th: 1430, median_sat_75th: 1530, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "unc-chapel-hill",                  display_name: "University of North Carolina at Chapel Hill",   country: "us", region: "NC", tier: "us_top50", admit_rate: 0.1707, median_sat_25th: 1370, median_sat_75th: 1520, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "boston-university",                display_name: "Boston University",                             country: "us", region: "MA", tier: "us_top50", admit_rate: 0.1088, median_sat_25th: 1420, median_sat_75th: 1530, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "university-of-rochester",          display_name: "University of Rochester",                       country: "us", region: "NY", tier: "us_top50", admit_rate: 0.3577, median_sat_25th: 1360, median_sat_75th: 1500, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "brandeis-university",              display_name: "Brandeis University",                           country: "us", region: "MA", tier: "us_top50", admit_rate: 0.3924, median_sat_25th: 1380, median_sat_75th: 1510, median_gpa_25th: 3.75, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "case-western-reserve",             display_name: "Case Western Reserve University",               country: "us", region: "OH", tier: "us_top50", admit_rate: 0.2977, median_sat_25th: 1410, median_sat_75th: 1520, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "william-and-mary",                 display_name: "William & Mary",                                country: "us", region: "VA", tier: "us_top50", admit_rate: 0.3331, median_sat_25th: 1360, median_sat_75th: 1510, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "tulane-university",                display_name: "Tulane University",                             country: "us", region: "LA", tier: "us_top50", admit_rate: 0.1243, median_sat_25th: 1420, median_sat_75th: 1500, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "georgia-tech",                     display_name: "Georgia Institute of Technology",               country: "us", region: "GA", tier: "us_top50", admit_rate: 0.1710, median_sat_25th: 1370, median_sat_75th: 1530, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "lehigh-university",                display_name: "Lehigh University",                             country: "us", region: "PA", tier: "us_top50", admit_rate: 0.3238, median_sat_25th: 1360, median_sat_75th: 1500, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "uc-san-diego",                     display_name: "University of California, San Diego",           country: "us", region: "CA", tier: "us_top50", admit_rate: 0.2450, median_sat_25th: 1310, median_sat_75th: 1510, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "uc-davis",                         display_name: "University of California, Davis",               country: "us", region: "CA", tier: "us_top50", admit_rate: 0.4188, median_sat_25th: 1230, median_sat_75th: 1450, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "uc-santa-barbara",                 display_name: "University of California, Santa Barbara",       country: "us", region: "CA", tier: "us_top50", admit_rate: 0.2582, median_sat_25th: 1290, median_sat_75th: 1490, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "uc-irvine",                        display_name: "University of California, Irvine",              country: "us", region: "CA", tier: "us_top50", admit_rate: 0.2116, median_sat_25th: 1280, median_sat_75th: 1490, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "university-of-florida",            display_name: "University of Florida",                         country: "us", region: "FL", tier: "us_top50", admit_rate: 0.2305, median_sat_25th: 1330, median_sat_75th: 1470, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "ut-austin",                        display_name: "University of Texas at Austin",                 country: "us", region: "TX", tier: "us_top50", admit_rate: 0.3127, median_sat_25th: 1230, median_sat_75th: 1480, median_gpa_25th: 3.80, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "villanova-university",             display_name: "Villanova University",                          country: "us", region: "PA", tier: "us_top50", admit_rate: 0.2533, median_sat_25th: 1400, median_sat_75th: 1500, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "northeastern-university",          display_name: "Northeastern University",                       country: "us", region: "MA", tier: "us_top50", admit_rate: 0.0684, median_sat_25th: 1450, median_sat_75th: 1540, median_gpa_25th: 3.85, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "uw-madison",                       display_name: "University of Wisconsin–Madison",               country: "us", region: "WI", tier: "us_top50", admit_rate: 0.4315, median_sat_25th: 1330, median_sat_75th: 1460, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "santa-clara-university",           display_name: "Santa Clara University",                        country: "us", region: "CA", tier: "us_top50", admit_rate: 0.4700, median_sat_25th: 1360, median_sat_75th: 1490, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "pepperdine-university",            display_name: "Pepperdine University",                         country: "us", region: "CA", tier: "us_top50", admit_rate: 0.5300, median_sat_25th: 1280, median_sat_75th: 1450, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
];

// -----------------------------------------------------------------------------
// US Top 100 "safety" — 50 rows (ranks ~51–100)
// -----------------------------------------------------------------------------
const US_TOP100: SchoolSeedRowBase[] = [
  { slug: "fordham-university",               display_name: "Fordham University",                            country: "us", region: "NY", tier: "us_top100", admit_rate: 0.5800, median_sat_25th: 1300, median_sat_75th: 1450, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "smu",                              display_name: "Southern Methodist University",                 country: "us", region: "TX", tier: "us_top100", admit_rate: 0.5100, median_sat_25th: 1340, median_sat_75th: 1470, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "ohio-state-university",            display_name: "Ohio State University",                         country: "us", region: "OH", tier: "us_top100", admit_rate: 0.5710, median_sat_25th: 1270, median_sat_75th: 1450, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "syracuse-university",              display_name: "Syracuse University",                           country: "us", region: "NY", tier: "us_top100", admit_rate: 0.5189, median_sat_25th: 1230, median_sat_75th: 1410, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-miami",              display_name: "University of Miami",                           country: "us", region: "FL", tier: "us_top100", admit_rate: 0.1900, median_sat_25th: 1390, median_sat_75th: 1510, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "uconn",                            display_name: "University of Connecticut",                     country: "us", region: "CT", tier: "us_top100", admit_rate: 0.5560, median_sat_25th: 1240, median_sat_75th: 1410, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "rutgers-new-brunswick",            display_name: "Rutgers University–New Brunswick",              country: "us", region: "NJ", tier: "us_top100", admit_rate: 0.6600, median_sat_25th: 1230, median_sat_75th: 1430, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "purdue-university",                display_name: "Purdue University",                             country: "us", region: "IN", tier: "us_top100", admit_rate: 0.5322, median_sat_25th: 1210, median_sat_75th: 1440, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "penn-state",                       display_name: "Pennsylvania State University",                 country: "us", region: "PA", tier: "us_top100", admit_rate: 0.5530, median_sat_25th: 1180, median_sat_75th: 1370, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "stevens-institute",                display_name: "Stevens Institute of Technology",               country: "us", region: "NJ", tier: "us_top100", admit_rate: 0.5150, median_sat_25th: 1380, median_sat_75th: 1500, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "indiana-university-bloomington",   display_name: "Indiana University Bloomington",                country: "us", region: "IN", tier: "us_top100", admit_rate: 0.8200, median_sat_25th: 1190, median_sat_75th: 1380, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "michigan-state-university",        display_name: "Michigan State University",                     country: "us", region: "MI", tier: "us_top100", admit_rate: 0.8800, median_sat_25th: 1150, median_sat_75th: 1320, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-maryland",           display_name: "University of Maryland, College Park",          country: "us", region: "MD", tier: "us_top100", admit_rate: 0.4510, median_sat_25th: 1330, median_sat_75th: 1500, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "university-of-pittsburgh",         display_name: "University of Pittsburgh",                      country: "us", region: "PA", tier: "us_top100", admit_rate: 0.4940, median_sat_25th: 1270, median_sat_75th: 1440, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "virginia-tech",                    display_name: "Virginia Tech",                                 country: "us", region: "VA", tier: "us_top100", admit_rate: 0.5650, median_sat_25th: 1220, median_sat_75th: 1410, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "george-washington-university",     display_name: "George Washington University",                  country: "us", region: "DC", tier: "us_top100", admit_rate: 0.4900, median_sat_25th: 1290, median_sat_75th: 1470, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "university-of-georgia",            display_name: "University of Georgia",                         country: "us", region: "GA", tier: "us_top100", admit_rate: 0.3970, median_sat_25th: 1270, median_sat_75th: 1430, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "texas-am-university",              display_name: "Texas A&M University",                          country: "us", region: "TX", tier: "us_top100", admit_rate: 0.6300, median_sat_25th: 1160, median_sat_75th: 1380, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "baylor-university",                display_name: "Baylor University",                             country: "us", region: "TX", tier: "us_top100", admit_rate: 0.5700, median_sat_25th: 1210, median_sat_75th: 1410, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "tcu",                              display_name: "Texas Christian University",                    country: "us", region: "TX", tier: "us_top100", admit_rate: 0.4700, median_sat_25th: 1200, median_sat_75th: 1390, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "clemson-university",               display_name: "Clemson University",                            country: "us", region: "SC", tier: "us_top100", admit_rate: 0.4300, median_sat_25th: 1220, median_sat_75th: 1390, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "gonzaga-university",               display_name: "Gonzaga University",                            country: "us", region: "WA", tier: "us_top100", admit_rate: 0.7400, median_sat_25th: 1200, median_sat_75th: 1380, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "loyola-marymount",                 display_name: "Loyola Marymount University",                   country: "us", region: "CA", tier: "us_top100", admit_rate: 0.5400, median_sat_25th: 1230, median_sat_75th: 1400, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "loyola-university-chicago",        display_name: "Loyola University Chicago",                     country: "us", region: "IL", tier: "us_top100", admit_rate: 0.7600, median_sat_25th: 1150, median_sat_75th: 1320, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "marquette-university",             display_name: "Marquette University",                          country: "us", region: "WI", tier: "us_top100", admit_rate: 0.8300, median_sat_25th: 1160, median_sat_75th: 1340, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-denver",             display_name: "University of Denver",                          country: "us", region: "CO", tier: "us_top100", admit_rate: 0.7400, median_sat_25th: 1210, median_sat_75th: 1390, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "university-of-tulsa",              display_name: "University of Tulsa",                           country: "us", region: "OK", tier: "us_top100", admit_rate: 0.6800, median_sat_25th: 1160, median_sat_75th: 1400, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-san-diego",          display_name: "University of San Diego",                       country: "us", region: "CA", tier: "us_top100", admit_rate: 0.5300, median_sat_25th: 1220, median_sat_75th: 1380, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "american-university",              display_name: "American University",                           country: "us", region: "DC", tier: "us_top100", admit_rate: 0.4100, median_sat_25th: 1230, median_sat_75th: 1410, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "howard-university",                display_name: "Howard University",                             country: "us", region: "DC", tier: "us_top100", admit_rate: 0.3300, median_sat_25th: 1120, median_sat_75th: 1320, median_gpa_25th: 3.40, median_gpa_75th: 3.80, source_dataset_year: YEAR },
  { slug: "florida-state-university",         display_name: "Florida State University",                      country: "us", region: "FL", tier: "us_top100", admit_rate: 0.3700, median_sat_25th: 1220, median_sat_75th: 1370, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "umass-amherst",                    display_name: "University of Massachusetts Amherst",           country: "us", region: "MA", tier: "us_top100", admit_rate: 0.6400, median_sat_25th: 1240, median_sat_75th: 1420, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "drexel-university",                display_name: "Drexel University",                             country: "us", region: "PA", tier: "us_top100", admit_rate: 0.7600, median_sat_25th: 1210, median_sat_75th: 1400, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "colorado-school-of-mines",         display_name: "Colorado School of Mines",                      country: "us", region: "CO", tier: "us_top100", admit_rate: 0.5300, median_sat_25th: 1280, median_sat_75th: 1440, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "stony-brook-university",           display_name: "Stony Brook University",                        country: "us", region: "NY", tier: "us_top100", admit_rate: 0.4900, median_sat_25th: 1260, median_sat_75th: 1430, median_gpa_25th: 3.60, median_gpa_75th: 3.95, source_dataset_year: YEAR },
  { slug: "binghamton-university",            display_name: "Binghamton University",                         country: "us", region: "NY", tier: "us_top100", admit_rate: 0.4200, median_sat_25th: 1320, median_sat_75th: 1460, median_gpa_25th: 3.70, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "university-of-iowa",               display_name: "University of Iowa",                            country: "us", region: "IA", tier: "us_top100", admit_rate: 0.8600, median_sat_25th: 1150, median_sat_75th: 1350, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "uiuc",                             display_name: "University of Illinois Urbana-Champaign",       country: "us", region: "IL", tier: "us_top100", admit_rate: 0.4400, median_sat_25th: 1260, median_sat_75th: 1480, median_gpa_25th: 3.60, median_gpa_75th: 4.00, source_dataset_year: YEAR },
  { slug: "auburn-university",                display_name: "Auburn University",                             country: "us", region: "AL", tier: "us_top100", admit_rate: 0.4400, median_sat_25th: 1170, median_sat_75th: 1330, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-delaware",           display_name: "University of Delaware",                        country: "us", region: "DE", tier: "us_top100", admit_rate: 0.7200, median_sat_25th: 1170, median_sat_75th: 1350, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-kentucky",           display_name: "University of Kentucky",                        country: "us", region: "KY", tier: "us_top100", admit_rate: 0.9500, median_sat_25th: 1080, median_sat_75th: 1290, median_gpa_25th: 3.30, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-arizona",            display_name: "University of Arizona",                         country: "us", region: "AZ", tier: "us_top100", admit_rate: 0.8700, median_sat_25th: 1100, median_sat_75th: 1340, median_gpa_25th: 3.30, median_gpa_75th: 3.80, source_dataset_year: YEAR },
  { slug: "arizona-state-university",         display_name: "Arizona State University",                      country: "us", region: "AZ", tier: "us_top100", admit_rate: 0.8800, median_sat_25th: 1120, median_sat_75th: 1360, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-oregon",             display_name: "University of Oregon",                          country: "us", region: "OR", tier: "us_top100", admit_rate: 0.8800, median_sat_25th: 1120, median_sat_75th: 1330, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-utah",               display_name: "University of Utah",                            country: "us", region: "UT", tier: "us_top100", admit_rate: 0.8900, median_sat_25th: 1150, median_sat_75th: 1360, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-vermont",            display_name: "University of Vermont",                         country: "us", region: "VT", tier: "us_top100", admit_rate: 0.6700, median_sat_25th: 1210, median_sat_75th: 1390, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "university-of-new-hampshire",      display_name: "University of New Hampshire",                   country: "us", region: "NH", tier: "us_top100", admit_rate: 0.8800, median_sat_25th: 1140, median_sat_75th: 1310, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "temple-university",                display_name: "Temple University",                             country: "us", region: "PA", tier: "us_top100", admit_rate: 0.7900, median_sat_25th: 1160, median_sat_75th: 1330, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "depaul-university",                display_name: "DePaul University",                             country: "us", region: "IL", tier: "us_top100", admit_rate: 0.7300, median_sat_25th: 1150, median_sat_75th: 1320, median_gpa_25th: 3.40, median_gpa_75th: 3.90, source_dataset_year: YEAR },
  { slug: "saint-louis-university",           display_name: "Saint Louis University",                        country: "us", region: "MO", tier: "us_top100", admit_rate: 0.6000, median_sat_25th: 1200, median_sat_75th: 1380, median_gpa_25th: 3.50, median_gpa_75th: 3.90, source_dataset_year: YEAR },
];

// -----------------------------------------------------------------------------
// UK Oxbridge — 2 rows
// -----------------------------------------------------------------------------
// UK schools don't take SAT/GPA; those fields are null. Admit rate is the
// published university-wide offer rate from the most recent UCAS cycle.
const UK_OXBRIDGE: SchoolSeedRowBase[] = [
  { slug: "oxford-university",    display_name: "University of Oxford",    country: "uk", region: "England", tier: "uk_oxbridge", admit_rate: 0.1710, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "cambridge-university", display_name: "University of Cambridge", country: "uk", region: "England", tier: "uk_oxbridge", admit_rate: 0.2110, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
];

// -----------------------------------------------------------------------------
// UK Top 10 — 10 rows
// -----------------------------------------------------------------------------
const UK_TOP10: SchoolSeedRowBase[] = [
  { slug: "imperial-college-london",        display_name: "Imperial College London",              country: "uk", region: "England",  tier: "uk_top10", admit_rate: 0.1400, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "lse",                            display_name: "London School of Economics",           country: "uk", region: "England",  tier: "uk_top10", admit_rate: 0.0870, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "ucl",                            display_name: "University College London",            country: "uk", region: "England",  tier: "uk_top10", admit_rate: 0.2900, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "kings-college-london",           display_name: "King's College London",                country: "uk", region: "England",  tier: "uk_top10", admit_rate: 0.1300, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-edinburgh",        display_name: "University of Edinburgh",              country: "uk", region: "Scotland", tier: "uk_top10", admit_rate: 0.4000, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-manchester",       display_name: "University of Manchester",             country: "uk", region: "England",  tier: "uk_top10", admit_rate: 0.5600, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-warwick",          display_name: "University of Warwick",                country: "uk", region: "England",  tier: "uk_top10", admit_rate: 0.1400, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-bristol",          display_name: "University of Bristol",                country: "uk", region: "England",  tier: "uk_top10", admit_rate: 0.6100, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "durham-university",              display_name: "Durham University",                    country: "uk", region: "England",  tier: "uk_top10", admit_rate: 0.4200, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-st-andrews",       display_name: "University of St Andrews",             country: "uk", region: "Scotland", tier: "uk_top10", admit_rate: 0.1120, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
];

// -----------------------------------------------------------------------------
// UK general — 8 rows (rounds the seed to 120)
// -----------------------------------------------------------------------------
const UK_GENERAL: SchoolSeedRowBase[] = [
  { slug: "university-of-exeter",      display_name: "University of Exeter",      country: "uk", region: "England",  tier: "uk_general", admit_rate: 0.6500, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-york",        display_name: "University of York",        country: "uk", region: "England",  tier: "uk_general", admit_rate: 0.7800, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-bath",        display_name: "University of Bath",        country: "uk", region: "England",  tier: "uk_general", admit_rate: 0.2700, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-glasgow",     display_name: "University of Glasgow",     country: "uk", region: "Scotland", tier: "uk_general", admit_rate: 0.7200, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-nottingham",  display_name: "University of Nottingham",  country: "uk", region: "England",  tier: "uk_general", admit_rate: 0.8200, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-birmingham",  display_name: "University of Birmingham",  country: "uk", region: "England",  tier: "uk_general", admit_rate: 0.7500, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-sheffield",   display_name: "University of Sheffield",   country: "uk", region: "England",  tier: "uk_general", admit_rate: 0.8500, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
  { slug: "university-of-leeds",       display_name: "University of Leeds",       country: "uk", region: "England",  tier: "uk_general", admit_rate: 0.7700, median_sat_25th: null, median_sat_75th: null, median_gpa_25th: null, median_gpa_75th: null, source_dataset_year: YEAR },
];

// Merge CSV data with inline data. CSV rows take precedence (they have
// institution_type + tier_band). Inline data provides backward compatibility.
const INLINE_ROWS: SchoolSeedRow[] = [
  ...US_TOP50,
  ...US_TOP100,
  ...UK_OXBRIDGE,
  ...UK_TOP10,
  ...UK_GENERAL,
].map((r): SchoolSeedRow => ({ ...r, institution_type: null, tier_band: null }));

// Build a lookup from CSV data keyed by slug
const csvBySlug = new Map<string, SchoolSeedRow>();
for (const row of [...CSV_US_TOP50, ...CSV_UK, ...CSV_LACS]) {
  csvBySlug.set(row.slug, row);
}

// Merge: CSV rows override inline rows, new CSV-only rows are appended
const ALL_ROWS: SchoolSeedRow[] = INLINE_ROWS.map((row) => {
  const csvRow = csvBySlug.get(row.slug);
  if (csvRow) {
    csvBySlug.delete(row.slug);
    return { ...row, institution_type: csvRow.institution_type, tier_band: csvRow.tier_band };
  }
  return row;
});
// Add any CSV-only rows (new LACs, etc.)
for (const row of csvBySlug.values()) {
  ALL_ROWS.push(row);
}

async function main(): Promise<void> {
  // Sanity checks on the inlined set before we touch the DB. These are
  // cheap, and they catch copy-paste errors (dupe slugs, wrong tier
  // counts) far earlier than a silent Postgres upsert would.
  if (ALL_ROWS.length < 100) {
    throw new Error(
      `seed-schools: expected at least 100 rows, got ${ALL_ROWS.length}`
    );
  }

  const slugs = new Set<string>();
  for (const row of ALL_ROWS) {
    if (slugs.has(row.slug)) {
      throw new Error(`seed-schools: duplicate slug ${row.slug}`);
    }
    slugs.add(row.slug);
  }

  const client = commonsDb();

  // One batched upsert keyed on slug. The `school_slug` unique index
  // (migration 3) makes this idempotent — rerunning the seed only
  // rewrites existing rows and adds any new ones.
  const { error } = await client
    .from("school")
    .upsert(ALL_ROWS, { onConflict: "slug" });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`[seed-schools] FAIL: ${error.message}`);
    process.exit(1);
  }

  const withTierBand = ALL_ROWS.filter((r) => r.tier_band).length;
  // eslint-disable-next-line no-console
  console.log(
    `[seed-schools] OK — upserted ${ALL_ROWS.length} schools ` +
      `(${withTierBand} with tier_band, ` +
      `${US_TOP50.length} us_top50, ${US_TOP100.length} us_top100, ` +
      `${UK_OXBRIDGE.length} uk_oxbridge, ${UK_TOP10.length} uk_top10, ` +
      `${UK_GENERAL.length} uk_general)`
  );
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed-schools] fatal:", err);
  process.exit(1);
});
