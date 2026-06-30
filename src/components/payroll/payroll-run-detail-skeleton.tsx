import { Skeleton } from '@/components/ui/skeleton';

export function PayrollRunDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-52 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-7 w-24 rounded-[6px]" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-12" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        <div className="space-y-3">
          <div className="flex gap-4 border-b border-border pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12 ms-auto" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-1">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-md ms-auto" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    </div>
  );
}
