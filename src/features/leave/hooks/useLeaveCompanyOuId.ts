'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';

export function useLeaveCompanyOuId() {
  const { data: profile } = useProfile();
  const { canSelectTenantCompany: canSelectCompany } = usePermissions();

  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

  const form = useForm<{ companyId: string }>({
    defaultValues: {
      companyId: '',
    },
  });

  const selectedCompanyId = useWatch({
    control: form.control,
    name: 'companyId',
  });

  const derivedCompanyOuId = (() => {
    if (!companiesData?.length || !profile?.companyId) return '';
    const matched = companiesData.find((company) => company.companyId === profile.companyId);
    return matched?.id ?? '';
  })();

  useEffect(() => {
    if (!canSelectCompany) return;
    if (companiesData?.length && !selectedCompanyId) {
      form.setValue('companyId', derivedCompanyOuId || companiesData[0].id);
    }
  }, [canSelectCompany, companiesData, derivedCompanyOuId, selectedCompanyId, form]);

  const companyOuId = canSelectCompany ? selectedCompanyId : derivedCompanyOuId || '';

  return {
    canSelectCompany,
    companyOuId,
    derivedCompanyOuId,
    companyForm: form,
    companiesData,
    isLoadingCompanies,
  };
}
