'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardHeaderSkeleton() {
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-md lg:hidden" />
                <div className="hidden lg:flex items-center gap-4">
                    <Skeleton className="h-9 w-87.5 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3">
                    <Skeleton className="h-9 w-36 rounded-lg" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                    <div className="mx-2 h-8 w-px bg-border hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </div>
        </header>
    );
}
