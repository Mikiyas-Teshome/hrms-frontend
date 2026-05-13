'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { overtimeStats } from '@/data/attendance';
import StatCardsList from '@/components/dashboard/attendance/StatCardsList';
import OvertimeTable from '@/components/dashboard/attendance/OvertimeTable';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RequestOvertimeSheet } from '@/components/dashboard/attendance/RequestOvertimeSheet';

export default function OvertimePage() {
    const { t } = useTranslation('dashboard');
    const { hasPermission } = usePermissions();
    const canCreateOvertime = hasPermission('overtime:create');
    const [dateRange, setDateRange] = useState({
        from: new Date(2026, 2, 20),
        to: new Date(2026, 2, 21),
    });
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <ProtectedRoute module="overtime">
            <div className="flex flex-col gap-8 w-full">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl text-foreground font-bold leading-8">
                        {t('attendance.overtimeTitle')}
                    </h2>
                    <div className="flex items-center gap-4">
                        {!canCreateOvertime && (
                            <DateRangePicker
                                value={dateRange}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(r: any) => setDateRange(r)}
                                className="flex sm:justify-end justify-start"
                            />
                        )}
                        {canCreateOvertime && (
                            <Button 
                                onClick={() => setIsSheetOpen(true)}
                                className="bg-[#2865E3] hover:bg-[#2865E3]/90 text-[#FAFAFA] rounded-lg h-9 w-[166px] min-w-[100px] px-3 py-2 gap-2 font-['Albert_Sans'] font-medium text-sm leading-5"
                            >
                                <Plus className="w-4 h-4" />
                                Request Overtime
                            </Button>
                        )}
                    </div>
                </div>

                <StatCardsList stats={overtimeStats} />

                <OvertimeTable />
            </div>
            <RequestOvertimeSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
        </ProtectedRoute>
    );
}
