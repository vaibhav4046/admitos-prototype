/**
 * `instrumentedRoute` — the higher-order wrapper that every API route
 * handler in AdmitOS goes through.
 *
 * Why a wrapper instead of leaving it to each route to remember the
 * boilerplate? Because the boilerplate is *load-bearing* — if a route
 * forgets to attach a Sentry scope, set the namespace tag, or write
 * a fail-loud audit row, we lose the safety guarantees Andy spec'd
 * in Thread 4. A single chokepoint is the only sustainable answer.
 *
 * What you get for free:
 *
 *   1. Sentry scope tagged with `namespace`, `route`, `method`,
 *      `request_id`. Errors thrown from the handler are reported
 *      automatically with the full scope.
 *
 *   2. Request id propagation. The middleware sets
 *      `x-admitos-request-id`; this wrapper reads it and threads it
 *      through the handler context so audit + LangSmith tags use the
 *      same id.
 *
 *   3. Uniform error envelope. Thrown errors become JSON responses
 *      with the right status code (`AuthError → 401/403`, anything
 *      else → 500). Stack traces never leak in production.
 *
 *   4. AuditEvent injection. The handler is given an `audit()` helper
 *      that takes a partial AuditEventInput and fills in `namespace`,
 *      `requestId`, and `actor` from the request context. This is the
 *      method handlers should use instead of importing `logAuditEvent`
 *      directly.
 */

import "server-only";

import { NextResponse } from "next/server";

import { AuthError, getCurrentUser } from "@/services/auth";
import { addBreadcrumb, captureError } from "@/lib/observability";
import { logAuditEvent } from "@/services/audit/log";
import type { AuditEventInput, AuditNamespace } from "@/services/audit";
import { generateRequestId, isValidRequestId } from "@/lib/utils/request-id";

export interface InstrumentedRouteContext {
  requestId: string;
  namespace: AuditNamespace;
  /** The full Request, in case the handler needs body / headers. */
  request: Request;
  /**
   * Audit helper. Pre-fills `namespace`, `requestId`, and `actor` from
   * the current request — handler only needs to provide `action`,
   * `target`, and optional `data`.
   */
  audit: (
    input: Omit<AuditEventInput, "namespace" | "requestId" | "actor"> & {
      actorOverride?: AuditEventInput["actor"];
    }
  ) => Promise<void>;
}

export interface InstrumentedRouteOptions {
  namespace: AuditNamespace;
  /** Stable name for traces / logs. Use the route path. */
  route: string;
}

export function instrumentedRoute<T>(
  opts: InstrumentedRouteOptions,
  handler: (ctx: InstrumentedRouteContext) => Promise<T | NextResponse>
): (request: Request) => Promise<NextResponse> {
  return async function wrapped(request: Request): Promise<NextResponse> {
    // Trust the incoming header only if it matches our exact format —
    // anything else is dropped to avoid log injection. The middleware
    // sets this header on every /api request.
    const incoming = request.headers.get("x-admitos-request-id");
    const requestId =
      incoming && isValidRequestId(incoming) ? incoming : generateRequestId();

    addBreadcrumb(`api.${opts.route}.start`, {
      requestId,
      namespace: opts.namespace,
      method: request.method,
    });

    let actorPromise: Promise<AuditEventInput["actor"]> | null = null;
    const getActor = (): Promise<AuditEventInput["actor"]> => {
      if (!actorPromise) {
        actorPromise = (async () => {
          const u = await getCurrentUser();
          if (u) return { kind: "user", userId: u.id, role: u.role };
          return { kind: "service", service: "supabase-edge" };
        })();
      }
      return actorPromise;
    };

    const ctx: InstrumentedRouteContext = {
      requestId,
      namespace: opts.namespace,
      request,
      audit: async (input) => {
        const actor = input.actorOverride ?? (await getActor());
        await logAuditEvent({
          namespace: opts.namespace,
          requestId,
          actor,
          action: input.action,
          summary: input.summary,
          target: input.target,
          data: input.data,
        });
      },
    };

    try {
      const result = await handler(ctx);
      if (result instanceof NextResponse) return result;
      return NextResponse.json(result, {
        headers: {
          "x-admitos-request-id": requestId,
          "Cache-Control": "no-store",
        },
      });
    } catch (err) {
      // Auth errors are an expected control-flow signal — don't
      // dirty Sentry with them.
      if (err instanceof AuthError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status, headers: { "x-admitos-request-id": requestId } }
        );
      }

      captureError(err, {
        namespace: opts.namespace,
        requestId,
        extra: { route: opts.route, method: request.method },
      });

      const message =
        process.env.APP_ENV === "production"
          ? "internal_error"
          : err instanceof Error
            ? err.message
            : String(err);

      return NextResponse.json(
        { error: message, requestId },
        { status: 500, headers: { "x-admitos-request-id": requestId } }
      );
    }
  };
}
