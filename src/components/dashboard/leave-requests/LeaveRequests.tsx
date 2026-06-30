'use client';

import React, { useMemo } from 'react';
import { CircleCheck, Loader, CircleX, FileStack } from 'lucide-react';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import LeaveRequestsTable from './LeaveRequestsTable';
import { useTranslation } from 'react-i18next';
import { FormSelect } from '@/components/ui/FormSelect';
import { useLeaveRequestStats } from '@/features/leave-request/hooks/useLeaveRequest';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';

export const LeaveRequests = () => {
  const { t } = useTranslation('dashboard');
  const {
    canSelectCompany,
    companyOuId,
    companyForm,
    companiesData,
    isLoadingCompanies,
  } = useLeaveCompanyOuId();
  const { data: stats, isLoading: isStatsLoading } = useLeaveRequestStats(
    canSelectCompany ? companyOuId : undefined,
  );

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: t('leaveRequests.stats.total', 'Total leave requests'),
        value: stats.total,
        icon: FileStack,
        borderColor: 'rgba(40, 101, 227, 0.5)',
      },
      {
        title: t('leaveRequests.stats.pending', 'Pending requests'),
        value: stats.pending,
        icon: Loader,
        borderColor: 'rgba(40, 101, 227, 0.5)',
      },
      {
        title: t('leaveRequests.stats.approved', 'Approved requests'),
        value: stats.approved,
        icon: CircleCheck,
        borderColor: 'rgba(34, 197, 94, 0.5)',
      },
      {
        title: t('leaveRequests.stats.rejected', 'Rejected requests'),
        value: stats.rejected,
        icon: CircleX,
        borderColor: 'rgba(239, 68, 68, 0.5)',
      },
    ];
  }, [stats, t]);

  const isLoading = !companyOuId || isStatsLoading;

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          {t('leaveRequests.title', 'Leave requests')}
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
            containerClassName="w-full md:w-64"
          />
        )}
      </div>
      {canSelectCompany &&
        (isLoading ? (
          <SummaryStatListSkeleton count={4} />
        ) : (
          <SummaryStatList stats={statCards} />
        ))}
      <LeaveRequestsTable companyOuId={companyOuId} />
    </div>
  );
};

export default LeaveRequests;
