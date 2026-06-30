import { Users, Wallet, Receipt } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TenantSuperAdminKpiSlug } from './tenant-super-admin-dashboard.types';

export const ALL_COMPANIES_VALUE = 'all';

export interface TenantKpiConfig {
  slug: TenantSuperAdminKpiSlug;
  icon: LucideIcon;
  containerClass: string;
  iconClass: string;
}

export const TENANT_KPI_CONFIGS: TenantKpiConfig[] = [
  {
    slug: 'total_employees',
    icon: Users,
    containerClass:
      'bg-purple-500/5 dark:bg-purple-500/10 border-purple-200/50 dark:border-purple-500/25',
    iconClass: 'text-[#8A38F5] dark:text-purple-400',
  },
  {
    slug: 'total_payout',
    icon: Wallet,
    containerClass:
      'bg-red-500/5 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/25',
    iconClass: 'text-[#EF4444] dark:text-red-400',
  },
  {
    slug: 'tax_liability',
    icon: Receipt,
    containerClass:
      'bg-blue-500/5 dark:bg-blue-500/10 border-blue-200/50 dark:border-blue-500/25',
    iconClass: 'text-[#2A48E0] dark:text-blue-400',
  },
];
