'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildOvertimeStatCards } from '@/features/attendance/attendance-stat-cards.util';
import StatCardsList from '@/components/dashboard/attendance/StatCardsList';
import OvertimeTable from '@/components/dashboard/attendance/OvertimeTable';
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { RequestOvertimeSheet } from '@/components/dashboard/attendance/RequestOvertimeSheet';
import { useAttendanceOverviewStats } from '@/features/attendance/hooks/useAttendance';

export default function OvertimePage() {
    const { t } = useTranslation('dashboard');

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [dateRange, setDateRange] = useState<DateRange>({
        from: startOfMonth,
        to: today,
    });
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const { data: statsData, isLoading: statsLoading } = useAttendanceOverviewStats(
        dateRange?.from?.toISOString() || startOfMonth.toISOString(),
        dateRange?.to?.toISOString() || today.toISOString(),
        true,
    );

    const stats = useMemo(
        () => buildOvertimeStatCards(statsData, t),
        [statsData, t],
    );

    const resolvedDateRange = {
        from: dateRange?.from ?? startOfMonth,
        to: dateRange?.to ?? today,
    };

    return (
        <ProtectedRoute module="overtime">
            <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-wrap justify-between items-center gap-4 min-w-0">
                    <h2 className="text-2xl text-foreground font-bold leading-8">
                        {t('attendance.overtimeTitle')}
                    </h2>
                    <div className="flex items-center gap-4 shrink-0">
                        <DateRangePicker
                            value={dateRange}
                            onChange={(range: DateRange) => {
                                if (range?.from && range?.to) {
                                    setDateRange({ from: range.from, to: range.to });
                                }
                            }}
                        />
                    </div>
                </div>

                <StatCardsList stats={stats} isLoading={statsLoading} />

                <OvertimeTable dateRange={resolvedDateRange} />
            </div>
            <RequestOvertimeSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
        </ProtectedRoute>
    );
}
