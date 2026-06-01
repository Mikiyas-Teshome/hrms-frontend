'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { TOTAL_TENANT_ONBOARDING_STEPS } from '@/lib/onboarding/steps';

function PublicHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 flex h-12 w-full items-center justify-between bg-background/80 px-2 py-2 backdrop-blur-md sm:px-4">
      <div className="flex w-1/3 items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="flex w-1/3 items-center justify-end gap-3 sm:gap-6">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </header>
  );
}

function OnboardingHeaderSkeleton() {
  return (
    <div className="flex flex-col items-start gap-2 text-start">
      <Skeleton className="h-7 w-64 max-w-full rounded-lg" />
      <Skeleton className="h-4 w-full max-w-md rounded-lg" />
    </div>
  );
}

function StepIndicatorSkeleton() {
  return (
    <div className="flex flex-col items-start gap-2.5">
      <Skeleton className="h-4 w-28 rounded-md" />
      <div className="flex w-full gap-3">
        {Array.from({ length: TOTAL_TENANT_ONBOARDING_STEPS }).map((_, index) => (
          <Skeleton key={index} className="h-1 flex-1 rounded-full" />
        ))}
      </div>
    </div>
  );
}

function FormSectionSkeleton({ fieldCount }: { fieldCount: number }) {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-border">
      <div className="border-b border-border bg-muted/50 px-6 py-6">
        <Skeleton className="h-4 w-44 rounded-md" />
      </div>
      <div className="space-y-4 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
          {Array.from({ length: fieldCount }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OnboardingFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-12">
      <div className="space-y-2.5">
        <FormSectionSkeleton fieldCount={4} />
        <FormSectionSkeleton fieldCount={2} />
      </div>
      <div className="flex items-center justify-between pt-8">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function OnboardingPageSkeleton() {
  return (
    <div className="min-h-screen">
      <PublicHeaderSkeleton />
      <main className="px-6 py-12 sm:px-10 lg:my-2 lg:py-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-2.5">
          <div className="flex flex-col gap-6 py-4">
            <OnboardingHeaderSkeleton />
            <StepIndicatorSkeleton />
          </div>
          <OnboardingFormSkeleton />
        </div>
      </main>
    </div>
  );
}
