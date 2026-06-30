import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PayrollOfficerViewSkeleton() {
    return (
        <div className="flex min-h-screen flex-col gap-8 rounded-tl-[32px] bg-background p-[24px_24px_12px] font-sans text-foreground">
            <div className="flex flex-col gap-6">
                <div className="flex min-h-14 items-center justify-between gap-3">
                    <div className="flex-1 space-y-2 text-left rtl:text-right">
                        <Skeleton className="h-8 w-64 rounded-md" />
                        <Skeleton className="h-4 w-48 rounded-md" />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 w-full sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <Card
                        key={idx}
                        className="rounded-[16px] border border-border bg-card shadow-sm"
                    >
                        <CardContent className="flex flex-col gap-5 p-6">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-12 w-12 rounded-[12px]" />
                            </div>
                            <div className="text-left rtl:text-right space-y-2">
                                <Skeleton className="h-4 w-32 rounded-md" />
                                <Skeleton className="h-8 w-20 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex min-h-115 flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/30">
                <div className="flex max-w-120 flex-col items-center justify-center p-8 text-center gap-4">
                    <Skeleton className="h-8 w-64 rounded-md" />
                    <Skeleton className="h-12 w-96 rounded-md" />
                    <Skeleton className="h-11 w-40 rounded-[8px] mt-4" />
                </div>
            </div>
        </div>
    );
}
