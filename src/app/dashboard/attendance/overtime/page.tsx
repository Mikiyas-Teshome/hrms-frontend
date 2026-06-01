'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { overtimeStats } from '@/data/attendance';
import StatCardsList from '@/components/dashboard/attendance/StatCardsList';
import OvertimeTable from '@/components/dashboard/attendance/OvertimeTable';
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { RequestOvertimeSheet } from '@/components/dashboard/attendance/RequestOvertimeSheet';
import { useAttendanceOverviewStats } from '@/features/attendance/hooks/useAttendance';

export default function OvertimePage() {
    const { t } = useTranslation('dashboard');

    // Default to the start of current month through today
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

    const realStats = overtimeStats.map((stat) => {
        if (statsLoading) {
            return { ...stat, value: '...' };
        }
        if (stat.id === 'employees') return { ...stat, value: statsData?.overtimeEmployees?.toString() ?? '0' };
        if (stat.id === 'approved') return { ...stat, value: statsData?.approvedOvertime?.toString() ?? '0' };
        if (stat.id === 'pending') return { ...stat, value: statsData?.pendingOvertime?.toString() ?? '0' };
        if (stat.id === 'total') return { ...stat, value: `${statsData?.totalOvertimeHours ?? 0}hrs` };
        return { ...stat, value: '0' };
    });

    // Only pass defined dates down to child
    const resolvedDateRange = {
        from: dateRange?.from ?? startOfMonth,
        to: dateRange?.to ?? today,
    };

    return (
        <ProtectedRoute module="overtime">
            <div className="flex flex-col gap-8 w-full">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl text-foreground font-bold leading-8">
                        {t('attendance.overtimeTitle')}
                    </h2>
                    <div className="flex items-center gap-4">
                        <DateRangePicker
                            value={dateRange}
                            onChange={(r: DateRange) => { if (r?.from && r?.to) setDateRange({ from: r.from, to: r.to }); }}
                            className="flex sm:justify-end justify-start"
                        />
                        {/* {canCreateOvertime && (
                            <Button 
                                onClick={() => setIsSheetOpen(true)}
                                className="bg-[#2865E3] hover:bg-[#2865E3]/90 text-[#FAFAFA] rounded-lg h-9 w-[166px] min-w-[100px] px-3 py-2 gap-2 font-['Albert_Sans'] font-medium text-sm leading-5"
                            >
                                <Plus className="w-4 h-4" />
                                Request Overtime
                            </Button>
                        )} */}
                    </div>
                </div>

                <StatCardsList stats={realStats} isLoading={statsLoading} />

                <OvertimeTable dateRange={resolvedDateRange} />
            </div>
            <RequestOvertimeSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
        </ProtectedRoute>
    );
}
