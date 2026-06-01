'use client';
import React from 'react';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import LeaveRequestsTable from './LeaveRequestsTable';
import { leaveRequestStats } from '@/data/leave-requests';
import { useTranslation } from 'react-i18next';

import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';
import { useLeaveRequestsByCompany } from '@/features/leave-request/hooks/useLeaveRequest';

export const LeaveRequests = () => {
    const { t } = useTranslation('dashboard');
    const { isLoading } = useLeaveRequestsByCompany();

    // Translate the stat titles
    const translatedStats = leaveRequestStats.map((stat) => {
        let translationKey = '';
        if (stat.title === 'Active leave request') translationKey = 'leaveRequests.stats.active';
        else if (stat.title === 'Pending requests') translationKey = 'leaveRequests.stats.pending';
        else if (stat.title === 'Leave requested employees') translationKey = 'leaveRequests.stats.employees';
        else if (stat.title === 'Total requested days') translationKey = 'leaveRequests.stats.totalDays';

        return {
            ...stat,
            title: t(translationKey, stat.title),
        };
    });

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
                <h2 className="text-2xl font-bold text-foreground">
                    {t('leaveRequests.title', 'Leave requests')}
                </h2>
            </div>
            {isLoading ? (
                <SummaryStatListSkeleton count={4} />
            ) : (
                <SummaryStatList stats={translatedStats} />
            )}
            <LeaveRequestsTable />
        </div>
    );
};

export default LeaveRequests;
