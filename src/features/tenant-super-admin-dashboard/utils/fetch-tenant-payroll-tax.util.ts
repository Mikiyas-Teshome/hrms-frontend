import { fetchPayslipsPaginated } from '@/features/payroll/payroll.actions';
import type { PayrollRunResponse } from '@/features/payroll/payroll.types';

export async function sumTaxForRuns(
  payrollCompanyId: string,
  runs: PayrollRunResponse[],
  displayCurrency?: string,
): Promise<number> {
  if (!runs.length) {
    return 0;
  }

  const payslipPages = await Promise.all(
    runs.map((run) =>
      fetchPayslipsPaginated(
        payrollCompanyId,
        { payrollRunId: run.id },
        { page: 1, size: 0 },
        displayCurrency,
      ),
    ),
  );

  return payslipPages.reduce(
    (total, page) =>
      total +
      page.data.reduce((runSum, slip) => runSum + Number(slip.incomeTaxAmount ?? 0), 0),
    0,
  );
}
