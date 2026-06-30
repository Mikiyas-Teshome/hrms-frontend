import { Skeleton } from '@/components/ui/skeleton';

export function EmployeeLifecycleSkeleton() {
    return (
        <div className="flex flex-row items-start gap-6 w-full overflow-x-auto pb-4 min-h-[500px]">
            {Array.from({ length: 4 }).map((_, idx) => (
                <div 
                    key={idx} 
                    className="flex flex-col flex-1 min-w-[240px] max-w-[300px] bg-card border border-border/80 shadow-sm rounded-xl overflow-hidden h-fit"
                >
                    <div className="flex flex-row items-center px-6 h-[50px] bg-muted/50 shrink-0 border-t-4 border-muted">
                        <Skeleton className="h-4 w-24 rounded-md" />
                        <div className="flex-1" />
                        <Skeleton className="h-5 w-8 rounded-full" />
                    </div>

                    <div className="flex flex-col w-full max-h-[600px] overflow-y-auto no-scrollbar">
                        {Array.from({ length: 5 }).map((_, itemIdx) => (
                            <div 
                                key={itemIdx} 
                                className="flex flex-row items-center pl-3 pr-2 py-2 gap-2 h-[66px] border-b border-border/50 last:border-0 w-full"
                            >
                                <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                                
                                <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
                                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                                    <div className="flex flex-col flex-1 min-w-0 gap-2">
                                        <Skeleton className="h-4 w-24 rounded-md" />
                                        <Skeleton className="h-3 w-16 rounded-md" />
                                    </div>
                                </div>
                                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
