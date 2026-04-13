/**
 * Training record validator.
 *
 * Gap 2 — Zod schema enforcing mandatory application_year and
 * minimum extraction_confidence >= 0.7 before a record enters
 * the training dataset.
 *
 * This is the TypeScript-side complement to the Python Pydantic
 * TrainingProfile validator. It runs in the Node pipeline when
 * processing records that arrive via the API rather than the
 * Python scraping pipeline.
 */

import "server-only";

import { z } from "zod";

export const TrainingRecordSchema = z.object({
  // application_year is mandatory (Gap 2 — migration 15 enforces NOT NULL)
  application_year: z
    .number()
    .int()
    .min(1990)
    .max(2030),

  // extraction_confidence must be >= 0.7 for training-quality data
  extraction_confidence: z
    .number()
    .min(0.7, "extraction_confidence must be >= 0.7 for training data")
    .max(1.0),

  // Source tracking
  source_url: z.string().url(),
  source_type: z.string().min(1),

  // Scores — at least one of sat/act required (validated separately)
  sat_score: z.number().int().min(400).max(1600).nullable(),
  act_score: z.number().int().min(1).max(36).nullable(),

  // GPA
  unweighted_gpa: z.number().min(0).max(4),

  // Academic context
  ap_course_count: z.number().int().min(0).max(20),
  major_category: z.enum([
    "stem",
    "humanities",
    "social_science",
    "arts",
    "business",
    "undecided",
  ]),

  // Extracurriculars
  ec_hours_per_week: z.number().int().min(0).max(60),
  leadership_roles_count: z.number().int().min(0).max(12),
  research_experience: z.boolean(),

  // Nationality
  nationality_region: z.enum([
    "us_domestic",
    "us_international",
    "uk_home",
    "uk_international",
    "asia",
    "middle_east",
    "europe",
    "africa",
    "latam",
    "oceania",
    "other",
  ]),
  nationality_country: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .nullable()
    .optional(),

  // Outcome
  admission_outcome: z.enum(["admitted", "waitlisted", "rejected"]),

  // Recency fields (computed by recency-weight module)
  recency_weight: z.number().min(0).max(1).nullable(),
  credential_type: z.enum(["sat", "act", "both", "test_optional"]).nullable(),
  test_optional_applicant: z.boolean().optional(),
}).refine(
  (data) => data.sat_score !== null || data.act_score !== null,
  { message: "at least one of sat_score or act_score must be provided" },
);

export type TrainingRecord = z.infer<typeof TrainingRecordSchema>;

export interface ValidationResult {
  valid: boolean;
  record?: TrainingRecord;
  errors?: string[];
}

/**
 * Validate a raw training record against the schema.
 * Returns a typed result with either the valid record or error messages.
 */
export function validateTrainingRecord(
  raw: unknown,
): ValidationResult {
  const result = TrainingRecordSchema.safeParse(raw);
  if (result.success) {
    return { valid: true, record: result.data };
  }
  return {
    valid: false,
    errors: result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    ),
  };
}
