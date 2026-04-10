/**
 * Schema namespace type — used by the Supabase client factory and the
 * isolation guard. Treat these strings as the ONLY legal schema names.
 *
 * These mirror Andy Yu's authoritative naming from Thread 4:
 * > admissions / wellbeing / commons_db
 *
 * Any code that tries to use "public", "app", or "internal" is wrong and
 * should be rejected at the middleware layer.
 */
export type SchemaNamespace = "admissions" | "wellbeing" | "commons_db";

export const SCHEMA_NAMESPACES = [
  "admissions",
  "wellbeing",
  "commons_db",
] as const satisfies readonly SchemaNamespace[];

/**
 * Route-group → schema mapping. Used by middleware.ts to verify that an
 * inbound request targets a schema its route group is allowed to touch.
 *
 * Critically: `admissions` route group has NO access to `wellbeing` schema.
 * The reverse is also true.
 */
export const ROUTE_GROUP_ALLOWED_SCHEMAS: Record<
  "admissions" | "wellbeing" | "commons",
  readonly SchemaNamespace[]
> = {
  admissions: ["admissions", "commons_db"],
  wellbeing: ["wellbeing"],
  commons: ["commons_db"],
};
