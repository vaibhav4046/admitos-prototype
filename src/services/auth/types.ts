/**
 * Auth types.
 *
 * UniOffer uses Supabase Auth (Google OAuth + email magic link). Roles
 * are stored in `auth.users.app_metadata.role` so they survive a token
 * refresh and don't need a separate DB lookup on every request.
 *
 * The four roles match the AuditEvent UserRole union exactly:
 *
 *   - student     — the kid filling in the CEF, talking to Adie, etc.
 *   - parent      — verified guardian linked to a student
 *   - counsellor  — Andy or another AdropEDU staff member
 *   - admin       — internal UniOffer engineering / ops
 *
 * Role transitions are logged via `AUTH_ROLE_ASSIGNED` AuditEvents.
 * The student → parent linkage is logged via `AUTH_GUARDIAN_VERIFIED`.
 */

export type UserRole = "student" | "parent" | "counsellor" | "admin";

/** Snapshot of the authenticated user, server-side only. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  /** Linked student id, only set when the role is "parent". */
  studentId: string | null;
  /** Whether the email has been verified by Supabase. */
  emailVerified: boolean;
  /** ISO timestamp of last sign-in. */
  lastSignInAt: string | null;
}

/** Roles allowed to enter a given route group. */
export const ROLE_ROUTE_ACL: Record<
  "admissions" | "wellbeing" | "admin",
  readonly UserRole[]
> = {
  admissions: ["student", "parent", "counsellor", "admin"],
  // Wellbeing is student-only by default. Counsellors can read aggregated
  // signals via the admin surface, never the raw chat.
  wellbeing: ["student"],
  admin: ["counsellor", "admin"],
} as const;
