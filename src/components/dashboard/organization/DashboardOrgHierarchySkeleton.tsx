import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardOrgHierarchySkeleton() {
    return (
        <div className="space-y-6">
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

            {/* Tabs Skeleton */}
            <div className="flex">
                <Skeleton className="h-9 w-full max-w-[400px] rounded-[10px]" />
            </div>

            {/* Hierarchy Content Skeleton */}
            <Card className="rounded-[12px] border border-border/80 bg-card shadow-none overflow-hidden">
                <CardHeader className="bg-muted/40 px-6 py-4 border-b border-border/40">
                    <Skeleton className="h-4 w-32 rounded-md" />
                </CardHeader>
                <CardContent className="px-6 sm:px-10 pb-4 space-y-6">
                    <div className="space-y-4 pt-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2" style={{ paddingLeft: `${i * 24}px` }}>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-full max-w-[400px] rounded-lg" />
                                    <Skeleton className="h-6 w-12 rounded-full" />
                                </div>
                                {i < 3 && <Skeleton className="h-8 w-[2px] ml-5 bg-muted" />}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Skeleton className="h-9 w-32 rounded-[8px]" />
                    </div>

                    <div className="flex items-center gap-3 rounded-[12px] bg-muted/30 border border-border/40 py-3 px-4">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-full rounded-md" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
