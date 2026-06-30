'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';
import { FormSelect } from '@/components/ui/FormSelect';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useLeavePolicyStats } from '@/features/leave-policy/hooks/useLeavePolicy';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import type { LeavePolicyDetail } from '@/features/leave-policy/leave-policy.types';
import LeavePoliciesTable from './LeavePoliciesTable';
import AddLeavePolicySheet from './AddLeavePolicySheet';
import { ViewLeavePolicySheet } from './ViewLeavePolicySheet';

const LeavePolicies = () => {
  const { t } = useTranslation('dashboard');
  const { hasPermission } = usePermissions();
  const {
    canSelectCompany,
    companyOuId,
    companyForm,
    companiesData,
    isLoadingCompanies,
  } = useLeaveCompanyOuId();

  const { data: stats, isLoading: isStatsLoading } = useLeavePolicyStats(companyOuId);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<LeavePolicyDetail | null>(null);
  const [viewPolicyId, setViewPolicyId] = useState<string | null>(null);

  const isLoading = !companyOuId || isStatsLoading;

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: t('leavePolicies.stats.total'),
        value: stats.total,
        icon: FileText,
        borderColor: 'rgba(40, 101, 227, 0.5)',
        iconColor: '#2865E3',
        iconBgColor: 'rgba(40, 101, 227, 0.05)',
      },
      {
        title: t('leavePolicies.stats.active'),
        value: stats.active,
        icon: CircleCheck,
        borderColor: 'rgba(34, 197, 94, 0.5)',
        iconColor: '#22C55E',
        iconBgColor: 'rgba(34, 197, 94, 0.05)',
      },
    ];
  }, [stats, t]);

  const handleAdd = () => {
    setPolicyToEdit(null);
    setIsAddSheetOpen(true);
  };

  const handleEdit = (policy: LeavePolicyDetail) => {
    setPolicyToEdit(policy);
    setIsAddSheetOpen(true);
  };

  const handleView = (policyId: string) => {
    setViewPolicyId(policyId);
    setIsViewSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('leavePolicies.title')}</h1>
        <div className="flex items-center gap-4">
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
          {hasPermission('leave_policies:create') && (
            <Button
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 h-10 gap-2 w-fit"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium text-sm">{t('leavePolicies.addPolicy')}</span>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <SummaryStatListSkeleton count={2} />
      ) : (
        <SummaryStatList stats={statCards} />
      )}

      <LeavePoliciesTable
        companyOuId={companyOuId}
        onEdit={handleEdit}
        onView={handleView}
      />

      <AddLeavePolicySheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        companyOuId={companyOuId}
        policy={policyToEdit}
      />

      <ViewLeavePolicySheet
        open={isViewSheetOpen}
        onOpenChange={setIsViewSheetOpen}
        policyId={viewPolicyId}
        companyOuId={companyOuId}
      />
    </div>
  );
};

export default LeavePolicies;
