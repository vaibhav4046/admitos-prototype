/**
 * GET /api/admissions/schools — handler.
 *
 * Lists schools from commons_db.school with optional filters:
 *   ?tier=us_top50     — filter by tier
 *   ?country=us        — filter by country
 *   ?q=harvard         — search by display_name
 *   ?limit=20          — max results (default 20, max 100)
 *
 * This is public reference data — no auth required (RLS allows
 * public read on commons_db.school). We still wrap in
 * instrumentedRoute for Sentry + request id propagation.
 */

import { instrumentedRoute, jsonSuccess } from "@/api/_core";
import {
  listSchoolsByTier,
  listSchoolsByCountry,
  searchSchools,
  type SchoolTier,
  type SchoolCountry,
} from "@/db/school";

const VALID_TIERS = new Set<string>([
  "us_top50", "uk_oxbridge", "uk_top10", "us_top100", "uk_general", "other",
]);
const VALID_COUNTRIES = new Set<string>(["us", "uk"]);

export const GET = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/schools" },
  async (ctx) => {
    const url = new URL(ctx.request.url);
    const tier = url.searchParams.get("tier");
    const country = url.searchParams.get("country");
    const q = url.searchParams.get("q");
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam ?? "20", 10) || 20, 1), 100);

    let schools;

    if (tier && VALID_TIERS.has(tier)) {
      schools = await listSchoolsByTier(tier as SchoolTier);
    } else if (country && VALID_COUNTRIES.has(country)) {
      schools = await listSchoolsByCountry(country as SchoolCountry);
    } else if (q && q.length >= 2) {
      schools = await searchSchools(q, limit);
    } else {
      // Default: return US top 50
      schools = await listSchoolsByTier("us_top50");
    }

    return jsonSuccess(
      {
        count: schools.length,
        schools: schools.slice(0, limit).map((s) => ({
          id: s.id,
          slug: s.slug,
          displayName: s.display_name,
          country: s.country,
          tier: s.tier,
          admitRate: s.admit_rate,
          medianSat25th: s.median_sat_25th,
          medianSat75th: s.median_sat_75th,
        })),
      },
      { requestId: ctx.requestId }
    );
  }
);
