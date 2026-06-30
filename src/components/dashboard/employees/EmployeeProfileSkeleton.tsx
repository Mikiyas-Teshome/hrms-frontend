'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeeProfileSkeleton() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex items-center gap-2 h-9">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-8 w-56 mt-1" />
            </div>

            <div className="flex flex-row items-end gap-6 w-full">
                <div className="shrink-0 flex flex-col w-60.5 h-58 bg-card border border-border shadow-sm rounded-xl">
                    <div className="flex justify-center items-center w-full pt-2 px-2 h-30">
                        <Skeleton className="w-22.5 h-22.5 rounded-xl" />
                    </div>
                    <div className="flex flex-col justify-center items-center gap-2 w-full pt-2 pb-4">
                        <div className="flex flex-col items-center gap-1 px-2 text-center">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3.5 w-24 mt-1" />
                            <Skeleton className="h-3.5 w-28 mt-1" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-lg mt-1" />
                    </div>
                </div>

                <div className="flex flex-col justify-end flex-1 min-w-0 gap-6 h-57.5">
                    <div className="flex flex-row justify-between items-center w-full">
                        <Skeleton className="h-9 w-24 rounded-lg" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>

                    <div className="flex flex-col justify-center items-start gap-2 w-full h-42.5 bg-card border border-border shadow-sm rounded-xl px-6 py-4">
                        <Skeleton className="h-5 w-36 mb-2" />
                        <div
                            className="w-full px-8 pt-4"
                            style={{ display: 'grid', gridTemplateColumns: `repeat(5, 1fr)`, rowGap: 8 }}
                        >
                            {Array.from({ length: 5 }).map((_, i) => {
                                const isLast = i === 4;
                                return (
                                    <div key={`dot-${i}`} className="flex items-center">
                                        <Skeleton className="shrink-0 w-4 h-4 rounded-full" />
                                        {!isLast && (
                                            <Skeleton className="flex-1 h-0.5" />
                                        )}
                                    </div>
                                );
                            })}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={`label-${i}`}>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-row items-start gap-6 w-full">
                <div className="flex flex-col items-start gap-4 flex-1 min-w-0">
                    <div className="flex flex-row items-center w-full h-9 p-0.75 bg-secondary rounded-[10px] gap-1">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="flex-1 h-7 rounded-lg" />
                        ))}
                    </div>

                    <div className="flex flex-col w-full p-6 gap-4 bg-card border border-border shadow-sm rounded-[10px] min-h-88">
                        <div className="flex flex-row items-center w-full gap-1.5 h-9">
                            <Skeleton className="h-6 w-32" />
                            <div className="flex-1" />
                            <Skeleton className="h-9 w-16 rounded-lg" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-start px-3 py-4 gap-3 h-19 border border-border/60 rounded-lg box-border bg-background">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex flex-col w-67.5 h-70 bg-card border border-border shadow-sm rounded-[10px] overflow-hidden">
                    <div className="flex items-center w-full h-15 px-6 bg-muted/40 shrink-0">
                        <Skeleton className="h-5 w-40" />
                    </div>
                    <div className="flex flex-col justify-center items-center flex-1 p-6 gap-10">
                        <div className="flex flex-row items-start w-full gap-3">
                            <Skeleton className="shrink-0 w-10 h-10 rounded-lg" />
                            <div className="flex flex-col items-start gap-2 flex-1">
                                <Skeleton className="h-3 w-28" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <div className="flex flex-row items-start w-full gap-3">
                            <Skeleton className="shrink-0 w-10 h-10 rounded-lg" />
                            <div className="flex flex-col items-start gap-2 flex-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
