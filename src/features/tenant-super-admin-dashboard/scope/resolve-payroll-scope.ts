export const PAYROLL_SCOPE_TENANT = 'tenant' as const;

export interface TenantPayrollScope {
  mode: typeof PAYROLL_SCOPE_TENANT;
  payrollCompanyId: string;
}

export function resolvePayrollScope(tenantCompanyId: string | undefined): TenantPayrollScope | null {
  if (!tenantCompanyId) {
    return null;
  }
  return {
    mode: PAYROLL_SCOPE_TENANT,
    payrollCompanyId: tenantCompanyId,
  };
}
