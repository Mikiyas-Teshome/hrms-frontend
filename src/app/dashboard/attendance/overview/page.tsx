'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAttendanceOverviewStats } from '@/features/attendance/hooks/useAttendance';
import { attendanceOverviewStats } from '@/data/attendance';
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

    const stats = attendanceOverviewStats.map((stat) => {
        if (!statsData) {
            return { ...stat, value: stat.id === 'overtime' ? '0hrs' : '0' };
        }

        let value = '0';
        switch (stat.id) {
            case 'employees':
                value = statsData.totalEmployees.toString();
                break;
            case 'active':
                value = statsData.activeEmployees.toString();
                break;
            case 'leave':
                value = statsData.onLeave.toString();
                break;
            case 'overtime':
                value = `${statsData.totalOvertimeHours}hrs`;
                break;
        }
        return { ...stat, value };
    });

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
                            onChange={(r: any) => setDateRange(r)}
                            className="flex sm:justify-end justify-start"
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
