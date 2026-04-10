/**
 * GET /api/admissions/schools/[slug] — handler.
 *
 * Returns a single school by its slug. 404 if not found.
 * Public reference data — no auth required.
 */

import { instrumentedRoute, jsonSuccess, jsonError } from "@/api/_core";
import { findSchoolBySlug } from "@/db/school";

export function schoolBySlugHandler(slug: string) {
  return instrumentedRoute(
    { namespace: "admissions", route: `/api/admissions/schools/${slug}` },
    async (ctx) => {
      const school = await findSchoolBySlug(slug);
      if (!school) {
        return jsonError({
          requestId: ctx.requestId,
          status: 404,
          code: "school_not_found",
          detail: { slug },
        });
      }

      return jsonSuccess(
        {
          id: school.id,
          slug: school.slug,
          displayName: school.display_name,
          country: school.country,
          region: school.region,
          tier: school.tier,
          admitRate: school.admit_rate,
          medianSat25th: school.median_sat_25th,
          medianSat75th: school.median_sat_75th,
          medianGpa25th: school.median_gpa_25th,
          medianGpa75th: school.median_gpa_75th,
          ipedsUnitid: school.ipeds_unitid,
          ucasInstitutionCode: school.ucas_institution_code,
          sourceDatasetYear: school.source_dataset_year,
        },
        { requestId: ctx.requestId }
      );
    }
  );
}
