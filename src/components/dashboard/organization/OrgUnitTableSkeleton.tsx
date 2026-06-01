import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function OrgUnitTableSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Skeleton className="h-8 w-48 rounded-md" />
                <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-10 w-44 rounded-md" />
                    <Skeleton className="h-10 w-44 rounded-md" />
                    <Skeleton className="h-10 w-44 rounded-md" />
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border border-border bg-card shadow-sm">
                        <CardContent className="p-6 flex flex-col gap-2">
                            <Skeleton className="h-4 w-24 rounded-md" />
                            <Skeleton className="h-8 w-16 rounded-md" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <Skeleton className="h-9 w-64 rounded-md" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24 rounded-md" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                </div>
                <div className="p-0">
                    <div className="space-y-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border-b border-border/50 last:border-0">
                                <Skeleton className="h-4 w-4 rounded-sm" />
                                <div className="flex-1 grid grid-cols-4 gap-4">
                                    <Skeleton className="h-4 w-full rounded-md" />
                                    <Skeleton className="h-4 w-full rounded-md" />
                                    <Skeleton className="h-4 w-full rounded-md" />
                                    <Skeleton className="h-4 w-24 rounded-full" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
