'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SummaryStatCardSkeletonProps {
    className?: string;
}

export const SummaryStatCardSkeleton: React.FC<SummaryStatCardSkeletonProps> = ({ className }) => {
    return (
        <div 
            className={cn(
                "flex-1 min-w-[240px] bg-card border border-border rounded-[14px] px-3 py-4 sm:p-5 flex items-center gap-4 transition-all",
                "shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]",
                className
            )}
        >
            <Skeleton className="size-12 rounded-full shrink-0" />
            <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-8 w-16" />
            </div>
        </div>
    );
};

interface SummaryStatListSkeletonProps {
    count?: number;
    className?: string;
}

export const SummaryStatListSkeleton: React.FC<SummaryStatListSkeletonProps> = ({ 
    count = 4, 
    className 
}) => {
    return (
        <div className="flex gap-4.5 items-center flex-wrap w-full">
            {Array.from({ length: count }).map((_, i) => (
                <SummaryStatCardSkeleton key={i} className={className} />
            ))}
        </div>
    );
};
