/**
 * GET /api/admissions/auth/me — handler.
 *
 * Returns the currently authenticated user's profile from the JWT.
 * No DB hit — reads from the Supabase session cached in cookies.
 *
 * Returns 401 if not authenticated.
 */

import { instrumentedRoute, jsonSuccess } from "@/api/_core";
import { getCurrentUser } from "@/services/auth";
import { AuthError } from "@/services/auth/server";

export const GET = instrumentedRoute(
  { namespace: "admissions", route: "/api/admissions/auth/me" },
  async (ctx) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new AuthError("not_authenticated", 401);
    }

    return jsonSuccess(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        lastSignInAt: user.lastSignInAt,
      },
      { requestId: ctx.requestId }
    );
  }
);
