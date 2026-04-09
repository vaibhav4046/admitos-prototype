/**
 * Suspense fallback for the admissions dashboard.
 *
 * Mirrors the real layout (PageHeader + 3 tile cards) using the
 * Skeleton primitive so the page doesn't visually jump when the
 * data resolves.
 */

import { Card, CardBody, CardHeader, Skeleton, SkeletonLines } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-2/3" />
            </CardHeader>
            <CardBody>
              <SkeletonLines count={3} />
            </CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
}
