/**
 * Suspense fallback for the CEF wizard step body.
 *
 * The wizard chrome (header + back/next bar + autosave footer) is
 * client-rendered and won't actually unmount during a step transition,
 * but Next 14 still triggers `loading.tsx` on a hard reload of
 * `/cef/<step>`. This file makes that visually quiet by rendering the
 * skeleton of a typical form (a few labelled input shapes).
 */

import { Skeleton, SkeletonLines } from "@/components/ui";

export default function CefStepLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="h-7 w-1/2" />
      <SkeletonLines count={2} className="mt-4" />

      <div className="mt-10 flex flex-col gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
