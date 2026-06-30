'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, CalendarDays } from 'lucide-react';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import LeaveBalancesTable from './LeaveBalancesTable';
import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';
import { FormSelect } from '@/components/ui/FormSelect';
import { useLeaveBalanceStats } from '@/features/leave-balance/hooks/useLeaveBalance';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';

const statConfig = [
  {
    key: 'employees' as const,
    icon: Users,
    iconColor: '#2865E3',
    iconBgColor: 'rgba(40, 101, 227, 0.1)',
    borderColor: 'rgba(40, 101, 227, 0.5)',
  },
  {
    key: 'allocated' as const,
    icon: CalendarDays,
    iconColor: '#A855F7',
    iconBgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  {
    key: 'remaining' as const,
    icon: CalendarDays,
    iconColor: '#A855F7',
    iconBgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  {
    key: 'carriedForward' as const,
    icon: Users,
    iconColor: '#2865E3',
    iconBgColor: 'rgba(40, 101, 227, 0.1)',
    borderColor: 'rgba(40, 101, 227, 0.5)',
  },
];

const LeaveBalances = () => {
  const { t } = useTranslation('dashboard');
  const {
    canSelectCompany,
    companyOuId,
    companyForm,
    companiesData,
    isLoadingCompanies,
  } = useLeaveCompanyOuId();

  const { data: statsData, isLoading: isLoadingStats } = useLeaveBalanceStats(companyOuId);

  const isLoading = !companyOuId || isLoadingStats;
  const daysLabel = t('common.table.days', 'days');

  const dynamicStats = useMemo(() => {
    return statConfig.map((stat) => {
      let value = '0';
      if (statsData) {
        switch (stat.key) {
          case 'employees':
            value = statsData.employeeCount.toString();
            break;
          case 'allocated':
            value = `${statsData.totalAllocatedDays} ${daysLabel}`;
            break;
          case 'remaining':
            value = `${statsData.totalRemainingDays} ${daysLabel}`;
            break;
          case 'carriedForward':
            value = `${statsData.totalCarriedForwardDays} ${daysLabel}`;
            break;
        }
      }
      return {
        title: t(`leaveBalances.stats.${stat.key}`, stat.key),
        value,
        icon: stat.icon,
        iconColor: stat.iconColor,
        iconBgColor: stat.iconBgColor,
        borderColor: stat.borderColor,
      };
    });
  }, [statsData, daysLabel, t]);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl text-foreground font-bold leading-8">
          {t('leaveBalances.title', 'Leave balances')}
        </h2>
        {canSelectCompany && (
          <FormSelect<{ companyId: string }>
            id="company-selector"
            placeholder={
              isLoadingCompanies ? t('setup.loadingCompanies') : t('setup.selectCompanyPlaceholder')
            }
            control={companyForm.control}
            name="companyId"
            t={t}
            options={
              companiesData?.map((c) => ({
                label: c.name,
                value: c.id,
              })) ?? []
            }
            containerClassName="w-full sm:w-64"
          />
        )}
      </div>

      {isLoading ? (
        <SummaryStatListSkeleton count={4} />
      ) : (
        <SummaryStatList stats={dynamicStats} />
      )}

      <LeaveBalancesTable companyOuId={companyOuId} />
    </div>
  );
};

export default LeaveBalances;
