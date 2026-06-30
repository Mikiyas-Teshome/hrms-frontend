import { format } from 'date-fns';
import { PayrollCycle, PayrollConfigResponse, PayrollRunResponse } from './payroll.types';

export function isSamePayrollPeriod(
  runStartDate: string,
  runEndDate: string,
  startDate: Date,
  endDate: Date,
): boolean {
  return (
    new Date(runStartDate).toISOString() === startDate.toISOString() &&
    new Date(runEndDate).toISOString() === endDate.toISOString()
  );
}

export function findPayrollRunForPeriod(
  runs: PayrollRunResponse[],
  startDate: Date,
  endDate: Date,
): PayrollRunResponse | undefined {
  return runs.find((run) => isSamePayrollPeriod(run.startDate, run.endDate, startDate, endDate));
}

export type PayrollRunDisplayStatus = 'draft' | 'finalized' | 'paid';

export function normalizePayrollRunStatus(status: string): PayrollRunDisplayStatus {
  const normalized = status.toLowerCase();
  if (normalized === 'paid') {
    return 'paid';
  }
  if (normalized === 'finalized') {
    return 'finalized';
  }
  return 'draft';
}

export function isPayrollRunCompleted(status: string): boolean {
  return normalizePayrollRunStatus(status) === 'paid';
}

export function isPayrollRunPending(status: string): boolean {
  const normalized = normalizePayrollRunStatus(status);
  return normalized === 'draft' || normalized === 'finalized';
}

export function getPayrollRunStatusTranslationKey(status: string): string {
  return `payrollData.status.${normalizePayrollRunStatus(status)}`;
}

export function formatPayrollRunStatusLabel(status: string): string {
  switch (normalizePayrollRunStatus(status)) {
    case 'paid':
      return 'Paid';
    case 'finalized':
      return 'Finalized';
    default:
      return 'Draft';
  }
}

export function getPayrollRunStatusBadgeClass(status: string): string {
  switch (normalizePayrollRunStatus(status)) {
    case 'paid':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300';
    case 'finalized':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300';
    default:
      return 'bg-muted/60 text-foreground border-border';
  }
}

export function formatPayrollRunTitle(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM yyyy')} payroll`;
    }
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')} payroll`;
  } catch {
    return 'Payroll run';
  }
}

export function formatPayPeriodRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  } catch {
    return '—';
  }
}

export function formatPayrollCycleLabel(
  cycleType?: PayrollCycle | PayrollConfigResponse['cycleType'],
): string {
  switch (cycleType) {
    case PayrollCycle.WEEKLY:
      return 'Weekly';
    case PayrollCycle.BI_WEEKLY:
      return 'Bi-weekly';
    case PayrollCycle.MONTHLY:
    default:
      return 'Monthly';
  }
}

export function resolvePayrollPayDate(endDate: string, payDay: number): Date {
  const periodEnd = new Date(endDate);
  const payDate = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 1);
  const lastDayOfMonth = new Date(payDate.getFullYear(), payDate.getMonth() + 1, 0).getDate();
  const requestedDay = Math.max(payDay, 1);
  payDate.setDate(Math.min(requestedDay, lastDayOfMonth));
  return payDate;
}

export function isRunInYear(run: { startDate: string }, year: number): boolean {
  return new Date(run.startDate).getFullYear() === year;
}
