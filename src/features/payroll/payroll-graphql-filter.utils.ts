import {
  PayrollRunFilterInput,
  PayrollRunListSortOrder,
  PayrollRunSortBy,
  PayrollRunStatusFilter,
  PayslipFilterInput,
  PayslipListSortOrder,
  PayslipSortBy,
} from './payroll.types';

function enumKeyByValue<T extends Record<string, string>>(
  enumObject: T,
  value: string | undefined,
): keyof T | undefined {
  if (!value) {
    return undefined;
  }

  const entry = Object.entries(enumObject).find(([, enumValue]) => enumValue === value);
  return entry ? (entry[0] as keyof T) : undefined;
}

export function serializePayrollRunFilterForGraphql(
  filter?: PayrollRunFilterInput,
): PayrollRunFilterInput | undefined {
  if (!filter) {
    return undefined;
  }

  const sortBy = enumKeyByValue(PayrollRunSortBy, filter.sortBy);
  const sortOrder = enumKeyByValue(PayrollRunListSortOrder, filter.sortOrder);
  const status = enumKeyByValue(PayrollRunStatusFilter, filter.status);

  return {
    ...(filter.search ? { search: filter.search } : {}),
    ...(filter.year !== undefined ? { year: filter.year } : {}),
    ...(sortBy ? { sortBy: sortBy as PayrollRunSortBy } : {}),
    ...(sortOrder ? { sortOrder: sortOrder as PayrollRunListSortOrder } : {}),
    ...(status ? { status: status as PayrollRunStatusFilter } : {}),
  };
}

export function serializePayslipFilterForGraphql(
  filter?: PayslipFilterInput,
): PayslipFilterInput | undefined {
  if (!filter) {
    return undefined;
  }

  const sortBy = enumKeyByValue(PayslipSortBy, filter.sortBy);
  const sortOrder = enumKeyByValue(PayslipListSortOrder, filter.sortOrder);

  return {
    ...(filter.payrollRunId ? { payrollRunId: filter.payrollRunId } : {}),
    ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
    ...(filter.search ? { search: filter.search } : {}),
    ...(sortBy ? { sortBy: sortBy as PayslipSortBy } : {}),
    ...(sortOrder ? { sortOrder: sortOrder as PayslipListSortOrder } : {}),
  };
}
