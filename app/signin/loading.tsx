/**
 * Loading state for /signin. Kept deliberately minimal — a signed-out
 * card skeleton so the user never sees a blank white flash while the
 * root layout hydrates. No PostHog, no Sentry scope, no nav chrome.
 */

import { Card, CardBody, CardFooter, CardHeader, Skeleton, SkeletonLines } from "@/components/ui";

export default function SignInLoading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardBody>
          <SkeletonLines lines={2} />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardBody>
        <CardFooter>
          <SkeletonLines lines={2} />
        </CardFooter>
      </Card>
    </div>
  );
}
