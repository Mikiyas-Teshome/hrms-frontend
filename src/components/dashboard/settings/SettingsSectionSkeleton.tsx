import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function SettingsFieldSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-9 w-full rounded-[8px]" />
        </div>
    );
}

function SettingsSubheadingSkeleton() {
    return <Skeleton className="h-4 w-32 rounded-md" />;
}

function SettingsSaveButtonSkeleton() {
    return (
        <div className="pt-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
    );
}

export function GeneralSectionSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
                <SettingsSubheadingSkeleton />
                <SettingsFieldSkeleton className="max-w-xl" />
                <div className="flex max-w-xl flex-col gap-2">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="min-h-20 w-full rounded-[8px]" />
                </div>
                <div className="flex max-w-xl flex-col gap-3">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-32 shrink-0 rounded-[8px]" />
                        <Skeleton className="h-9 flex-1 rounded-[8px]" />
                    </div>
                </div>
                <SettingsFieldSkeleton className="max-w-xl" />
                <SettingsFieldSkeleton className="max-w-xl" />
                <SettingsFieldSkeleton className="max-w-xl" />
                <div className="grid max-w-xl grid-cols-1 gap-5 sm:grid-cols-2">
                    <SettingsFieldSkeleton />
                    <SettingsFieldSkeleton />
                </div>
                <SettingsFieldSkeleton className="max-w-xl sm:max-w-[calc(50%-0.625rem)]" />
            </div>

            <div className="border-t border-border" />

            <div className="flex flex-col gap-5">
                <SettingsSubheadingSkeleton />
                <SettingsFieldSkeleton className="max-w-xl" />
                <SettingsFieldSkeleton className="max-w-xl" />
                <div className="flex max-w-xl flex-col gap-2">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-9 w-full rounded-[8px]" />
                    <Skeleton className="h-3 w-48 rounded-md" />
                </div>
            </div>

            <SettingsSaveButtonSkeleton />
        </div>
    );
}

export function OrgPreferencesSectionSkeleton() {
    return (
        <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start justify-between gap-8">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-56 rounded-md" />
                        <Skeleton className="h-3 w-72 rounded-md" />
                    </div>
                    <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
                </div>
            ))}
            <SettingsSaveButtonSkeleton />
        </div>
    );
}

export function AttendanceSectionSkeleton({ showCompanyField = true }: { showCompanyField?: boolean }) {
    return (
        <div className="flex flex-col gap-6">
            {showCompanyField && <SettingsFieldSkeleton className="max-w-sm gap-1.5" />}
            <div className="border-t border-border" />
            <SettingsSubheadingSkeleton />
            <div className="flex gap-3 flex-wrap">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-44 rounded-xl" />
                ))}
            </div>
            <div className="border-t border-border" />
            <SettingsSubheadingSkeleton />
            <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-11 w-full rounded-lg" />
                ))}
            </div>
            <SettingsSaveButtonSkeleton />
        </div>
    );
}

export function SessionsListSkeleton() {
    return (
        <div className="flex flex-col gap-0">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-4 border-b border-border py-2.5 last:border-0"
                >
                    <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
                    <Skeleton className="h-4 flex-1 rounded-md" />
                    <Skeleton className="h-4 w-24 shrink-0 rounded-md" />
                    <Skeleton className="h-4 w-20 shrink-0 rounded-md" />
                    <Skeleton className="h-8 w-16 shrink-0 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function AppearanceSectionSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
                <SettingsSubheadingSkeleton />

                <div className="flex max-w-xs flex-col gap-2">
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="min-h-29.5 w-full rounded-xl" />
                </div>

                <SettingsFieldSkeleton className="max-w-xl" />

                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-56 rounded-md" />
                    <div className="flex flex-wrap gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="flex flex-col items-center gap-1.5">
                                <Skeleton className="h-10.75 w-[111.67px] rounded-[9px]" />
                                <Skeleton className="h-5 w-14 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-border" />

            <div className="flex flex-col gap-2">
                <SettingsSubheadingSkeleton />
                <Skeleton className="h-4 w-24 rounded-md" />
                <div className="flex flex-wrap gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex flex-col items-center gap-2">
                            <Skeleton className="h-16 w-24 rounded-xl" />
                            <Skeleton className="h-3 w-12 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            <SettingsSaveButtonSkeleton />
        </div>
    );
}
