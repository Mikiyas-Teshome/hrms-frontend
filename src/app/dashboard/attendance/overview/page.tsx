'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAttendanceOverviewStats } from '@/features/attendance/hooks/useAttendance';
import { buildAttendanceOverviewStatCards } from '@/features/attendance/attendance-stat-cards.util';
import StatCardsList from '@/components/dashboard/attendance/StatCardsList';
import AttendanceOverviewTable from '@/components/dashboard/attendance/AttendanceOverviewTable';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AttendanceOverviewPage() {
    const { t } = useTranslation('dashboard');
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [dateRange, setDateRange] = useState({
        from: firstDay,
        to: lastDay,
    });

    const { data: statsData, isLoading } = useAttendanceOverviewStats(
        dateRange.from.toISOString(),
        dateRange.to.toISOString()
    );

    const stats = useMemo(
        () => buildAttendanceOverviewStatCards(statsData, t),
        [statsData, t],
    );

    return (
        <ProtectedRoute module="attendance">
            <div className="flex flex-col gap-8 w-full">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl text-foreground font-bold leading-8">
                        {t('attendance.overviewTitle')}
                    </h2>
                    <div>
                        <DateRangePicker
                            value={dateRange}
                            onChange={(range) => {
                                if (range?.from && range?.to) {
                                    setDateRange({ from: range.from, to: range.to });
                                }
                            }}
                        />
                    </div>
                </div>

                <StatCardsList stats={stats} isLoading={isLoading} />

                <AttendanceOverviewTable
                    startDate={dateRange.from?.toISOString()}
                    endDate={dateRange.to?.toISOString()}
                />
            </div>
        </ProtectedRoute>
    );
}
