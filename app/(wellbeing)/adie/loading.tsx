/**
 * Suspense fallback for Adie.
 *
 * Deliberately calm — no spinners, no animated dots, just a few quiet
 * placeholder bars that mirror the real layout. The wellbeing surface
 * has stricter visual rules than admissions; we don't want loading
 * states that feel urgent.
 */

import { Skeleton, SkeletonLines } from "@/components/ui";

export default function AdieLoading() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Skeleton className="h-9 w-32" />
      <SkeletonLines count={2} className="mt-4" />

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </main>
  );
}
