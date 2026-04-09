/**
 * Server-only auth helpers.
 *
 * `getCurrentUser()` reads the Supabase session from the request cookies
 * (via `serverClient`) and projects it onto our `AuthUser` shape. It is
 * the one and only doorway between Supabase Auth and the rest of the
 * server-side codebase — never call `auth.getUser()` directly outside
 * of this file.
 *
 * `requireRole(role | role[])` is a guard for server components and
 * route handlers. Throws an `AuthError` if the user doesn't satisfy
 * the requirement; the route handler should catch it and return 401/403.
 *
 * `requireRouteAccess(group)` checks the route group ACL defined in
 * `lib/auth/types.ts`. Pair it with the middleware: middleware enforces
 * physical isolation at the namespace boundary, this enforces role
 * authorization inside the route group itself.
 *
 * Audit consequence: any time a user transitions roles or links to a
 * guardian, write an AUTH_ROLE_ASSIGNED / AUTH_GUARDIAN_VERIFIED row.
 * That belongs in the action that performs the transition, not in the
 * read path here.
 */

import "server-only";

import { serverClient } from "@/lib/supabase/server-client";

import type { AuthUser, UserRole } from "./types";
import { ROLE_ROUTE_ACL } from "./types";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function projectRole(raw: unknown): UserRole {
  if (raw === "student" || raw === "parent" || raw === "counsellor" || raw === "admin") {
    return raw;
  }
  // Default for newly-signed-up users — they enter as students. The
  // role is reassigned by an admin/counsellor via the AUTH_ROLE_ASSIGNED
  // action when their relationship is established.
  return "student";
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const sb = serverClient();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;

  const u = data.user;
  const meta = (u.app_metadata ?? {}) as Record<string, unknown>;
  return {
    id: u.id,
    email: u.email ?? "",
    role: projectRole(meta.role),
    studentId:
      typeof meta.student_id === "string" ? meta.student_id : null,
    emailVerified: Boolean(u.email_confirmed_at),
    lastSignInAt: u.last_sign_in_at ?? null,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError("not_authenticated", 401);
  return u;
}

export async function requireRole(
  role: UserRole | readonly UserRole[]
): Promise<AuthUser> {
  const u = await requireUser();
  const ok = Array.isArray(role)
    ? (role as readonly UserRole[]).includes(u.role)
    : u.role === role;
  if (!ok) throw new AuthError(`role_required: ${String(role)}`, 403);
  return u;
}

export async function requireRouteAccess(
  group: keyof typeof ROLE_ROUTE_ACL
): Promise<AuthUser> {
  const u = await requireUser();
  const allowed = ROLE_ROUTE_ACL[group];
  if (!allowed.includes(u.role)) {
    throw new AuthError(`route_group_denied: ${group}`, 403);
  }
  return u;
}
