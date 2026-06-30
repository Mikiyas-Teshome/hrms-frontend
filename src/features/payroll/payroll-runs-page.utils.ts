import {
    PayrollRunFilterInput,
    PayrollRunListSortOrder,
    PayrollRunSortBy,
    PayrollRunStatusFilter,
    PayslipSortBy,
} from './payroll.types';

export const PAYROLL_RUN_ALL_FILTER_VALUE = 'all';

export type PayrollRunFilterDraft = {
    status: string;
    year: string;
};

export const defaultPayrollRunFilterDraft: PayrollRunFilterDraft = {
    status: PAYROLL_RUN_ALL_FILTER_VALUE,
    year: PAYROLL_RUN_ALL_FILTER_VALUE,
};

export function countActivePayrollRunFilters(filter: PayrollRunFilterInput): number {
    let count = 0;
    if (filter.status) count += 1;
    if (filter.year) count += 1;
    return count;
}

export function mapPayrollRunDraftToFilter(
    draft: PayrollRunFilterDraft,
    search?: string,
    sortBy?: PayrollRunSortBy,
    sortOrder?: PayrollRunListSortOrder,
): PayrollRunFilterInput {
    return {
        ...(search ? { search } : {}),
        ...(draft.status !== PAYROLL_RUN_ALL_FILTER_VALUE
            ? { status: draft.status as PayrollRunStatusFilter }
            : {}),
        ...(draft.year !== PAYROLL_RUN_ALL_FILTER_VALUE
            ? { year: Number.parseInt(draft.year, 10) }
            : {}),
        ...(sortBy ? { sortBy } : {}),
        ...(sortOrder ? { sortOrder } : {}),
    };
}

export function mapPayrollRunFilterToDraft(filter: PayrollRunFilterInput): PayrollRunFilterDraft {
    return {
        status: filter.status ?? PAYROLL_RUN_ALL_FILTER_VALUE,
        year: filter.year ? String(filter.year) : PAYROLL_RUN_ALL_FILTER_VALUE,
    };
}

export function mapPayrollRunSortColumn(columnKey: string): PayrollRunSortBy {
    switch (columnKey) {
        case 'status':
            return PayrollRunSortBy.STATUS;
        case 'employees':
            return PayrollRunSortBy.EMPLOYEE_COUNT;
        case 'createdAt':
            return PayrollRunSortBy.CREATED_AT;
        case 'endDate':
            return PayrollRunSortBy.END_DATE;
        default:
            return PayrollRunSortBy.START_DATE;
    }
}

export function mapPayslipSortColumn(columnKey: string): PayslipSortBy {
    switch (columnKey) {
        case 'employeeName':
            return PayslipSortBy.EMPLOYEE_NAME;
        case 'grossPay':
            return PayslipSortBy.GROSS_PAY;
        case 'netPay':
            return PayslipSortBy.NET_PAY;
        default:
            return PayslipSortBy.CREATED_AT;
    }
}
