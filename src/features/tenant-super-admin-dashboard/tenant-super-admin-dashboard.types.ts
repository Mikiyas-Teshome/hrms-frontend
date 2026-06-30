import type { PayrollRunResponse } from '@/features/payroll/payroll.types';

export type TenantSuperAdminKpiSlug =
  | 'total_employees'
  | 'total_payout'
  | 'tax_liability';

export type TenantPayrollTrendRange = '6m' | '12m' | '18m';

export type CompanyPayrollStatus = 'paid' | 'pending' | 'canceled';

export type CompanyMatrixFilter = 'all' | CompanyPayrollStatus;

export type TenantDisplayCurrency = 'USD' | 'EUR' | 'GBP' | 'AED';

export interface TenantPayrollTrendPoint {
  label: string;
  amount: number;
}

export interface CompanyPerformanceRow {
  id: string;
  companyUnit: string;
  region: string;
  payrollStatus: CompanyPayrollStatus;
  headcount: number;
  netSpend: string;
}

export interface TenantKpiDisplay {
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading: boolean;
}

export type TenantKpiMap = Record<TenantSuperAdminKpiSlug, TenantKpiDisplay>;

export interface TenantPayrollMonthMetrics {
  grossPay: number;
  netPay: number;
  taxAmount: number;
  monthRuns: PayrollRunResponse[];
}
export interface TenantPayrollSnapshot {
  payrollStatus: CompanyPayrollStatus;
  netSpendFormatted: string;
  monthNetPay: number;
}
