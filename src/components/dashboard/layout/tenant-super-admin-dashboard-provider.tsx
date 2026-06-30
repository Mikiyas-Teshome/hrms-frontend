'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ALL_COMPANIES_VALUE } from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.constants';
import type { TenantDisplayCurrency } from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.types';

interface TenantSuperAdminDashboardContextValue {
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  currency: TenantDisplayCurrency;
  setCurrency: (currency: TenantDisplayCurrency) => void;
}

const TenantSuperAdminDashboardContext = createContext<TenantSuperAdminDashboardContextValue | null>(
  null,
);

export function TenantSuperAdminDashboardProvider({ children }: { children: ReactNode }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(ALL_COMPANIES_VALUE);
  const [currency, setCurrency] = useState<TenantDisplayCurrency>('USD');

  const value = useMemo(
    () => ({
      selectedCompanyId,
      setSelectedCompanyId,
      currency,
      setCurrency,
    }),
    [selectedCompanyId, currency],
  );

  return (
    <TenantSuperAdminDashboardContext.Provider value={value}>
      {children}
    </TenantSuperAdminDashboardContext.Provider>
  );
}

export function useTenantSuperAdminDashboardFilters() {
  const ctx = useContext(TenantSuperAdminDashboardContext);
  if (!ctx) {
    throw new Error('useTenantSuperAdminDashboardFilters requires TenantSuperAdminDashboardProvider');
  }
  return ctx;
}

export function useTenantSuperAdminDashboardFiltersOptional() {
  return useContext(TenantSuperAdminDashboardContext);
}
