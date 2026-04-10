/**
 * Auth barrel — server-only entry. The browser side reads `auth.user`
 * straight off the Supabase browser client and does not need this file.
 */

export {
  getCurrentUser,
  requireUser,
  requireRole,
  requireRouteAccess,
  AuthError,
} from "./server";

export {
  ROLE_ROUTE_ACL,
  type AuthUser,
  type UserRole,
} from "./types";

export {
  decodeJwtPayload,
  extractBearerToken,
  extractRole,
  isExpired,
  type JwtPayload,
} from "./jwt";
