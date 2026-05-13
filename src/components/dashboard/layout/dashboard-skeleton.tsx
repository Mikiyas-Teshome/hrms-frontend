'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardWelcomeSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between h-14 gap-3">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-1/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                </div>
                <Skeleton className="h-9 w-25 rounded-lg" />
            </div>
        </div>
    );
}

export function DashboardStatsSkeleton() {
    return (
        <div className="grid gap-4 w-full sm:grid-cols-2 lg:grid-cols-4 h-35">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-full w-full rounded-[12px]" />
            ))}
        </div>
    );
}

export function DashboardMainContentSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
            <Skeleton className="flex-1 h-104.25 rounded-2xl" />
            <Skeleton className="w-full lg:w-67.5 h-104.25 rounded-2xl" />
        </div>
    );
}

export function DashboardMetricsSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 w-full">
            <Skeleton className="h-87.5 rounded-2xl" />
            <Skeleton className="h-87.5 rounded-2xl" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8 px-2 bg-background min-h-full">
            <DashboardWelcomeSkeleton />
            <DashboardStatsSkeleton />
            <DashboardMainContentSkeleton />
            <DashboardMetricsSkeleton />
        </div>
    );
}
