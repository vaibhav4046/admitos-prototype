/**
 * App Router shim for GET /api/admissions/schools/[slug].
 *
 * Next.js dynamic route segments pass params as the second argument
 * to the handler. We extract the slug and delegate to the handler
 * factory in src/api/admissions/schools/by-slug.ts.
 */

import { schoolBySlugHandler } from "@/api/admissions/schools/by-slug";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const handler = schoolBySlugHandler(slug);
  return handler(request);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
