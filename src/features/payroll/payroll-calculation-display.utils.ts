import { PayrollComponentValueType } from './payroll.types';

export function formatPayrollComponentLabel(
  name: string,
  type: string,
  rawValue: number,
  taxable?: boolean,
): string {
  const base =
    type === PayrollComponentValueType.PERCENTAGE || type === 'PERCENTAGE'
      ? `${name} (${rawValue}%)`
      : name;
  if (taxable === false) {
    return `${base} (non-taxable)`;
  }
  if (taxable === true) {
    return `${base} (taxable)`;
  }
  return base;
}

type PayrollEarningsInput = {
  basicSalary: number;
  allowances: Array<{
    id: string;
    name: string;
    type: string;
    rawValue: number;
    amount: number;
    taxable?: boolean;
  }>;
  lines?: Array<{ code: string; label: string; category: string; amount: number }>;
  totalOvertime?: number;
  totalDutyOvertime?: number;
};

function resolveOvertimeEarningLines(
  detail: PayrollEarningsInput,
): Array<{ id: string; name: string; type: string; rawValue: number; amount: number }> {
  if (detail.lines?.length) {
    return detail.lines
      .filter((line) => line.category === 'ALLOWANCE' && line.code.startsWith('OVERTIME'))
      .map((line) => ({
        id: line.code,
        name: line.label,
        type: 'FIXED',
        rawValue: 0,
        amount: line.amount,
      }));
  }

  const fallbackLines: Array<{ id: string; name: string; type: string; rawValue: number; amount: number }> =
    [];

  if ((detail.totalOvertime ?? 0) > 0) {
    fallbackLines.push({
      id: 'OVERTIME',
      name: 'Overtime',
      type: 'FIXED',
      rawValue: 0,
      amount: detail.totalOvertime ?? 0,
    });
  }

  if ((detail.totalDutyOvertime ?? 0) > 0) {
    fallbackLines.push({
      id: 'OVERTIME_DUTY',
      name: 'Duty overtime',
      type: 'FIXED',
      rawValue: 0,
      amount: detail.totalDutyOvertime ?? 0,
    });
  }

  return fallbackLines;
}

export function buildEarningLines(
  detail: PayrollEarningsInput,
): Array<{ id: string; name: string; type: string; rawValue: number; amount: number }> {
  const structureAllowances = detail.allowances;
  const overtimeLines = resolveOvertimeEarningLines(detail);

  return [
    {
      id: 'basic-salary',
      name: 'Basic salary (this period)',
      type: 'FIXED',
      rawValue: 0,
      amount: detail.basicSalary,
    },
    ...structureAllowances,
    ...overtimeLines,
  ].filter((line) => line.amount > 0 || line.id === 'basic-salary');
}
