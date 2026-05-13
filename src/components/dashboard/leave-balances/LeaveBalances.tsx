'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import LeaveBalancesTable from './LeaveBalancesTable';
import { leaveBalanceStats } from '@/data/leave-balances';

const LeaveBalances = () => {
    const { t } = useTranslation('dashboard');

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl text-foreground font-bold leading-8">
                    {t('leaveBalances.title', 'Leave balances')}
                </h2>
            </div>

            <SummaryStatList
                stats={leaveBalanceStats.map((stat) => ({
                    title: t(`leaveBalances.stats.${stat.title === 'Number of employees' ? 'employees' : stat.title === 'Total allocated days' ? 'allocated' : stat.title === 'Total remaining days' ? 'remaining' : 'carriedForward'}`, stat.title),
                    value: typeof stat.value === 'string' && stat.value.includes('days') 
                        ? `${stat.value.split(' ')[0]} ${t('common.table.days', 'days')}`
                        : stat.value,
                    icon: stat.icon,
                    iconColor: stat.iconColor,
                    iconBgColor: stat.iconBgColor,
                    borderColor: stat.borderColor
                }))}
            />

            <LeaveBalancesTable />
        </div>
    );
};

export default LeaveBalances;
