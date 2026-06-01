import { useMemo } from 'react';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompany } from '@/features/company/hooks/useCompany';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';

export function useSettingsCompany() {
    const { data: profile, isLoading: isProfileLoading } = useProfile();
    const companyId = profile?.companyId ?? '';
    const { data: company, isLoading: isCompanyLoading } = useCompany(companyId);
    const { companies, isLoading: isOuLoading } = useCompanyOptions();

    const ouFallback = companies[0];

    const timezoneFallback = useMemo(
        () => ouFallback?.companyProfile?.timezone ?? '',
        [ouFallback],
    );

    const themeColorFallback = useMemo(
        () => ouFallback?.companyProfile?.themeColor ?? null,
        [ouFallback],
    );

    const currencyFallback = useMemo(
        () => ouFallback?.companyProfile?.currency ?? '',
        [ouFallback],
    );

    const isLoading = isProfileLoading || isOuLoading || (!!companyId && isCompanyLoading);
    const isReady = !isLoading;

    return {
        companyId,
        company,
        isLoading,
        isReady,
        timezoneFallback,
        themeColorFallback,
        currencyFallback,
    };
}
