/**
 * `<NamespaceBadge />` — a small visible cue showing which surface
 * the current page belongs to.
 *
 * Why this exists: in a screenshot bug report it's often unclear
 * whether a user was on the admissions surface or the wellbeing
 * surface. The badge makes it obvious. It's deliberately tiny,
 * top-right, and unobtrusive — never marketing, just orientation.
 *
 * In production we hide the badge under a feature flag — it's only
 * useful in dev, staging, and during the early release phase. Once
 * the surfaces are visually distinct enough on their own (M2 design
 * pass), we'll drop the dev-only badge entirely.
 */

import type { CSSProperties } from "react";

interface NamespaceBadgeProps {
  namespace: "admissions" | "wellbeing" | "admin";
}

const STYLES: Record<NamespaceBadgeProps["namespace"], CSSProperties> = {
  admissions: {
    background: "#eef2ff",
    color: "#4338ca",
    border: "1px solid #c7d2fe",
  },
  wellbeing: {
    background: "#f0fdfa",
    color: "#0f766e",
    border: "1px solid #99f6e4",
  },
  admin: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fde68a",
  },
};

export function NamespaceBadge({ namespace }: NamespaceBadgeProps) {
  const style: CSSProperties = {
    position: "fixed",
    top: "0.75rem",
    right: "0.75rem",
    padding: "0.125rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.7rem",
    fontWeight: 600,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    pointerEvents: "none",
    zIndex: 50,
    ...STYLES[namespace],
  };

  return (
    <div aria-hidden="true" style={style}>
      {namespace}
    </div>
  );
}
