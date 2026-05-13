'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DashboardHeaderSkeleton() {
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
            {/* Left Block */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-md lg:hidden" /> {/* Sidebar Trigger */}
                <div className="hidden lg:flex items-center gap-4">
                    <Skeleton className="h-9 w-87.5 rounded-lg" /> {/* Search Input */}
                    <Skeleton className="h-8 w-8 rounded-full" /> {/* Language Switcher */}
                    <Skeleton className="h-8 w-8 rounded-full" /> {/* Theme Toggle */}
                </div>
            </div>

            <div className="flex-1" />

            {/* Right Block */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3">
                    <Skeleton className="h-9 w-36 rounded-lg" /> {/* Calendar */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" /> {/* Bell */}
                        <Skeleton className="h-9 w-9 rounded-full" /> {/* MessageSquare */}
                    </div>
                    <div className="mx-2 h-8 w-px bg-border hidden md:block" />
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end gap-1">
                            <Skeleton className="h-3 w-24" /> {/* Name */}
                            <Skeleton className="h-2 w-16" /> {/* Role */}
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
                    </div>
                </div>
            </div>
        </header>
    );
}
