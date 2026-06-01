import { useCallback, useMemo } from 'react';
import { useOrganizationHierarchy, useSelectedCompany } from '@/features/organization/hooks/useOrganization';
import { findCompanyForUnit } from '@/features/organization/organization.utils';
import type { OrganizationUnitType } from '@/features/organization/organization.types';
import { formatCurrency, formatIntlCurrency, getCurrencySymbol } from '@/lib/currency';
import { useSettingsCompany } from './useSettingsCompany';

const DEFAULT_CURRENCY = 'USD';

export function useDisplayCurrency(companyOuId?: string) {
    const { company, currencyFallback, isLoading: settingsLoading } = useSettingsCompany();
    const { company: selectedOu, isLoading: ouLoading } = useSelectedCompany(companyOuId);
    const { data: hierarchy = [], isLoading: hierarchyLoading } = useOrganizationHierarchy();

    const currencyCode = useMemo(() => {
        let ouCurrency: string | null | undefined;

        if (companyOuId) {
            if (selectedOu?.type === 'COMPANY') {
                ouCurrency = selectedOu.companyProfile?.currency;
            } else if (hierarchy.length > 0) {
                const companyUnit = findCompanyForUnit(
                    companyOuId,
                    hierarchy as OrganizationUnitType[],
                );
                ouCurrency = companyUnit?.companyProfile?.currency;
            }
        }

        return ouCurrency || company?.currency || currencyFallback || DEFAULT_CURRENCY;
    }, [companyOuId, selectedOu, hierarchy, company?.currency, currencyFallback]);

    const currencySymbol = useMemo(() => getCurrencySymbol(currencyCode), [currencyCode]);

    const formatAmount = useCallback(
        (value: number, options?: Intl.NumberFormatOptions) =>
            formatIntlCurrency(value, currencyCode, options),
        [currencyCode],
    );

    return {
        currencyCode,
        currencySymbol,
        formatAmount,
        formatDisplayCurrency: (value: number) => formatCurrency(value, currencyCode),
        isLoading: settingsLoading || (!!companyOuId && (ouLoading || hierarchyLoading)),
    };
}
