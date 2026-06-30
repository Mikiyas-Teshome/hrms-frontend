import { SummaryStatCardSkeleton } from '@/components/common/SummaryStatSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function PayslipDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-48 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatCardSkeleton />
        <SummaryStatCardSkeleton />
        <SummaryStatCardSkeleton />
        <SummaryStatCardSkeleton />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-40" />
        </div>

        <Skeleton className="h-11 w-full rounded-lg" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[100px] rounded-[12px]" />
          ))}
        </div>

        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
