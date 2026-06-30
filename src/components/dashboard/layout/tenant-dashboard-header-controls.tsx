'use client';

import { useMemo } from 'react';
import { useClientHydrated } from '@/hooks/use-client-hydrated';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { ALL_COMPANIES_VALUE } from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.constants';
import { useTenantSuperAdminDashboardFilters } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import type { TenantDisplayCurrency } from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.types';

const CURRENCIES: TenantDisplayCurrency[] = ['USD', 'EUR', 'GBP', 'AED'];

type TenantDashboardHeaderControlsProps = {
  className?: string;
};

export function TenantDashboardHeaderControls({ className }: TenantDashboardHeaderControlsProps) {
  const { t } = useTranslation('dashboard');
  const hydrated = useClientHydrated();
  const { companies, isLoading } = useCompanyOptions();
  const { selectedCompanyId, setSelectedCompanyId, currency, setCurrency } =
    useTenantSuperAdminDashboardFilters();

  const companyOptions = useMemo(() => {
    const items = companies.map((c) => ({
      value: c.id,
      label: c.name,
    }));
    return [{ value: ALL_COMPANIES_VALUE, label: t('tenantSuperAdmin.allCompanies', 'All companies') }, ...items];
  }, [companies, t]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 min-w-0 shrink-0 overflow-x-auto scrollbar-none',
        className,
      )}
    >
      <Select
        value={selectedCompanyId}
        onValueChange={setSelectedCompanyId}
        disabled={hydrated && isLoading}
      >
        <SelectTrigger className="h-9 w-[min(140px,32vw)] sm:w-[min(180px,40vw)] rounded-lg border border-input bg-background text-sm shrink-0">
          <SelectValue placeholder={t('tenantSuperAdmin.allCompanies', 'All companies')} />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {companyOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ToggleGroup
        type="single"
        value={currency}
        onValueChange={(value) => {
          if (value) {
            setCurrency(value as TenantDisplayCurrency);
          }
        }}
        className="bg-secondary p-1 rounded-lg hidden sm:flex shrink-0"
      >
        {CURRENCIES.map((code) => (
          <ToggleGroupItem
            key={code}
            value={code}
            className="text-[10px] h-7 px-2.5 data-[state=on]:bg-background data-[state=on]:shadow-sm font-medium"
          >
            {code}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
