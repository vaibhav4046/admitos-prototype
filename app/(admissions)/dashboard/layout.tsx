/**
 * Dashboard layout — mounts the Manus-style shell over the admissions
 * chrome.
 *
 * The admissions layout mounts an `<AdmissionsHeader>` plus a
 * max-w-6xl main wrapper. The dashboard shell breaks out of both by
 * using `position: fixed` (see `.uo-dash-shell` in dashboard.css), so
 * all we do here is import the stylesheet and render children. The
 * actual chrome is composed inside each page via `<DashboardShell>`.
 */

import type { ReactNode } from "react";

import "./_components/dashboard.css";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
