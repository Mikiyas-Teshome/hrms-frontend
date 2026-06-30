import { useMutation, useQuery } from '@tanstack/react-query';
import {
    exportHrReport,
    exportPayrollReport,
    getEmployeeSalaryHistory,
    getEmployeeTransferHistory,
    getHrReport,
    getHrReportFilterOptions,
    getPayrollReport,
    getPayrollReportFilterOptions,
    getCustomReports,
    getCustomReportFilterOptions,
    runCustomReport,
    createCustomReport,
    deleteCustomReport,
    exportCustomReport,
} from './reports.actions';
import {
    CreateCustomReportInput,
    CustomReportListFiltersInput,
    HrReportFiltersInput,
    PayrollReportFiltersInput,
} from './reports.types';

export const useHrReport = (filters: HrReportFiltersInput, enabled = true) => {
    return useQuery({
        queryKey: ['hr-report', filters],
        queryFn: () => getHrReport(filters),
        enabled: enabled && !!filters.dateFrom && !!filters.dateTo,
    });
};

export const useHrReportFilterOptions = (companyOuId?: string) => {
    return useQuery({
        queryKey: ['hr-report-filter-options', companyOuId],
        queryFn: () => getHrReportFilterOptions(companyOuId),
    });
};

export const useHrReportSalaryHistory = (employeeId: string) => {
    return useQuery({
        queryKey: ['hr-report-salary-history', employeeId],
        queryFn: () => getEmployeeSalaryHistory(employeeId),
        enabled: !!employeeId,
    });
};

export const useHrReportTransferHistory = (employeeId: string) => {
    return useQuery({
        queryKey: ['hr-report-transfer-history', employeeId],
        queryFn: () => getEmployeeTransferHistory(employeeId),
        enabled: !!employeeId,
    });
};

export const useExportHrReport = () => {
    return useMutation({
        mutationFn: ({ format, filters }: { format: 'csv' | 'xlsx' | 'pdf'; filters: HrReportFiltersInput }) =>
            exportHrReport(format, filters),
    });
};

export const usePayrollReport = (filters: PayrollReportFiltersInput, enabled = true) => {
    return useQuery({
        queryKey: ['payroll-report', filters],
        queryFn: () => getPayrollReport(filters),
        enabled: enabled && !!filters.payrollRunId,
    });
};

export const usePayrollReportFilterOptions = (companyOuId?: string) => {
    return useQuery({
        queryKey: ['payroll-report-filter-options', companyOuId],
        queryFn: () => getPayrollReportFilterOptions(companyOuId),
    });
};

export const useExportPayrollReport = () => {
    return useMutation({
        mutationFn: ({
            format,
            filters,
        }: {
            format: 'csv' | 'xlsx' | 'pdf';
            filters: PayrollReportFiltersInput;
        }) => exportPayrollReport(format, filters),
    });
};

export const useCustomReports = (filters: CustomReportListFiltersInput, enabled = true) => {
    return useQuery({
        queryKey: ['custom-reports', filters],
        queryFn: () => getCustomReports(filters),
        enabled,
    });
};

export const useCustomReportFilterOptions = (companyOuId?: string) => {
    return useQuery({
        queryKey: ['custom-report-filter-options', companyOuId],
        queryFn: () => getCustomReportFilterOptions(companyOuId),
    });
};

export const useRunCustomReport = (id: string, enabled = false) => {
    return useQuery({
        queryKey: ['run-custom-report', id],
        queryFn: () => runCustomReport(id),
        enabled: enabled && !!id,
    });
};

export const useCreateCustomReport = () => {
    return useMutation({
        mutationFn: (input: CreateCustomReportInput) => createCustomReport(input),
    });
};

export const useDeleteCustomReport = () => {
    return useMutation({
        mutationFn: (id: string) => deleteCustomReport(id),
    });
};

export const useExportCustomReport = () => {
    return useMutation({
        mutationFn: ({ id, format }: { id: string; format: 'csv' | 'xlsx' | 'pdf' }) =>
            exportCustomReport(id, format),
    });
};
