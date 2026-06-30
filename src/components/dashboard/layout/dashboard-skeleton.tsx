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

export function DashboardChartSkeleton({ className }: { className?: string }) {
    return (
        <div className={`flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 ${className ?? ''}`}>
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    );
}

export function DashboardTableCardSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
            <div className="flex flex-col gap-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 flex-1 rounded-md" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardSideCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 h-full">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-24 rounded-md" />
                        <Skeleton className="h-7 w-16 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardCommsCardSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <Skeleton className="h-5 w-32 rounded-md" />
            <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-3 w-2/3 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardOperationalCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-8 w-12 rounded-md" />
                </div>
            ))}
        </div>
    );
}

export function AdminHomeDashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8 px-2 bg-background min-h-full">
            <DashboardWelcomeSkeleton />
            <DashboardStatsSkeleton />
            <DashboardMainContentSkeleton />
            <DashboardMetricsSkeleton />
        </div>
    );
}

export function TenantSuperAdminHomeSkeleton() {
    return (
        <div className="flex flex-col gap-6 bg-background min-h-full">
            <DashboardWelcomeSkeleton />
            <DashboardStatsSkeleton />
            <div className="grid gap-6 md:grid-cols-2 w-full">
                <DashboardChartSkeleton />
                <DashboardChartSkeleton />
            </div>
        </div>
    );
}

export function PersonalHomeDashboardSkeleton({
    showOperationalCards = false,
    showPersonalStats = true,
    showLeaveAndOvertimeRow = true,
    showCommsRow = true,
}: {
    showOperationalCards?: boolean;
    showPersonalStats?: boolean;
    showLeaveAndOvertimeRow?: boolean;
    showCommsRow?: boolean;
}) {
    return (
        <div className="flex flex-col w-full gap-6 lg:gap-10 pb-8">
            <div className="flex flex-col gap-6 w-full">
                <DashboardWelcomeSkeleton />
                {showOperationalCards && <DashboardOperationalCardsSkeleton />}
                {showPersonalStats && <DashboardStatsSkeleton />}
            </div>
            {showLeaveAndOvertimeRow && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
                    <div className="lg:col-span-3">
                        <DashboardTableCardSkeleton />
                    </div>
                    <div className="lg:col-span-1">
                        <DashboardSideCardSkeleton />
                    </div>
                </div>
            )}
            {showCommsRow && (
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <DashboardCommsCardSkeleton />
                    <DashboardCommsCardSkeleton />
                </div>
            )}
        </div>
    );
}

export const DashboardSkeleton = AdminHomeDashboardSkeleton;
