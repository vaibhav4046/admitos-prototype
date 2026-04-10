/** @type {import('next').NextConfig} */

/**
 * Baseline security headers applied to every HTML response. Kept in
 * one place so we can review them when threat model changes.
 *
 *  - X-Frame-Options DENY: never embedded in another site (no clickjacking).
 *  - X-Content-Type-Options nosniff: browsers respect declared MIME types.
 *  - Referrer-Policy strict-origin-when-cross-origin: no leakage of paths
 *    to third parties when a user navigates away.
 *  - Permissions-Policy: explicitly disables sensitive browser APIs we
 *    don't ever use (camera, microphone, geolocation, payment).
 *  - Strict-Transport-Security: 1y, includeSubDomains. Vercel terminates
 *    TLS so we can opt all subdomains in immediately.
 *
 * The full Content-Security-Policy isn't set here yet — it depends on
 * which third-party origins (Sentry, PostHog, Supabase, fonts CDN) we
 * end up loading at runtime, and those land with the OAuth + LangSmith
 * wiring in M1 Week 2. The Vercel-default CSP is good enough for the
 * scaffolding phase.
 */
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Ensure server-only modules never leak into the client bundle.
  // Renamed from `experimental.serverComponentsExternalPackages` in
  // Next 15 — the new key is top-level and no longer experimental.
  serverExternalPackages: ["bullmq", "ioredis", "@sentry/nextjs"],
  // Route-group isolation is enforced at the middleware layer, not via rewrites.
  // See middleware.ts.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/api/wellbeing/:path*",
        headers: [
          { key: "X-Route-Namespace", value: "wellbeing" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/admissions/:path*",
        headers: [
          { key: "X-Route-Namespace", value: "admissions" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
