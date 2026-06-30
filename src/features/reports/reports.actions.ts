'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
    GET_HR_REPORT_QUERY,
    GET_HR_REPORT_FILTER_OPTIONS_QUERY,
    EXPORT_HR_REPORT_MUTATION,
    GET_PAYROLL_REPORT_QUERY,
    GET_PAYROLL_REPORT_FILTER_OPTIONS_QUERY,
    EXPORT_PAYROLL_REPORT_MUTATION,
    GET_CUSTOM_REPORTS_QUERY,
    GET_CUSTOM_REPORT_FILTER_OPTIONS_QUERY,
    RUN_CUSTOM_REPORT_QUERY,
    CREATE_CUSTOM_REPORT_MUTATION,
    DELETE_CUSTOM_REPORT_MUTATION,
    EXPORT_CUSTOM_REPORT_MUTATION,
} from './reports.queries';
import {
    GET_EMPLOYEE_SALARY_HISTORY_QUERY,
    GET_EMPLOYEE_TRANSFER_HISTORY_QUERY,
    SalaryHistoryRecord,
    TransferHistoryRecord,
} from './reports-history.queries';
import {
    ExportHrReportResult,
    ExportPayrollReportResult,
    HrReportFiltersInput,
    HrReportResponse,
    HrReportFilterOptionsResponse,
    PayrollReportFiltersInput,
    PayrollReportResponse,
    PayrollReportFilterOptionsResponse,
    CreateCustomReportInput,
    CustomReportListFiltersInput,
    CustomReportsListResponse,
    CustomReportFilterOptionsResponse,
    CustomReportDefinitionResponse,
    CustomReportRunResult,
    ExportCustomReportResult,
} from './reports.types';
import {
    normalizeChartOptions,
    normalizeCustomReportRunResult,
    toGqlCreateCustomReportInput,
    toGqlExportFormat,
    toGqlHrReportFilters,
    toGqlPayrollReportFilters,
} from './reports.utils';

export const getHrReport = async (filters: HrReportFiltersInput): Promise<HrReportResponse> => {
    const data = await gqlRequest<{ hrReport: HrReportResponse }>(GraphQLService.REPORTING, GET_HR_REPORT_QUERY, {
        filters: toGqlHrReportFilters(filters),
    });
    return data.hrReport;
};

export const getHrReportFilterOptions = async (companyOuId?: string): Promise<HrReportFilterOptionsResponse> => {
    const data = await gqlRequest<{ hrReportFilterOptions: HrReportFilterOptionsResponse }>(
        GraphQLService.REPORTING,
        GET_HR_REPORT_FILTER_OPTIONS_QUERY,
        { companyOuId: companyOuId || null },
    );
    return data.hrReportFilterOptions;
};

export const exportHrReport = async (
    format: 'csv' | 'xlsx' | 'pdf',
    filters: HrReportFiltersInput,
): Promise<ExportHrReportResult> => {
    const data = await gqlRequest<{ exportHrReport: ExportHrReportResult }>(
        GraphQLService.REPORTING,
        EXPORT_HR_REPORT_MUTATION,
        { format: toGqlExportFormat(format), filters: toGqlHrReportFilters(filters) },
    );
    return data.exportHrReport;
};

export const getPayrollReport = async (filters: PayrollReportFiltersInput): Promise<PayrollReportResponse> => {
    const data = await gqlRequest<{ payrollReport: PayrollReportResponse }>(
        GraphQLService.REPORTING,
        GET_PAYROLL_REPORT_QUERY,
        { filters: toGqlPayrollReportFilters(filters) },
    );
    return data.payrollReport;
};

export const getPayrollReportFilterOptions = async (
    companyOuId?: string,
): Promise<PayrollReportFilterOptionsResponse> => {
    const data = await gqlRequest<{ payrollReportFilterOptions: PayrollReportFilterOptionsResponse }>(
        GraphQLService.REPORTING,
        GET_PAYROLL_REPORT_FILTER_OPTIONS_QUERY,
        { companyOuId: companyOuId || null },
    );
    return data.payrollReportFilterOptions;
};

export const exportPayrollReport = async (
    format: 'csv' | 'xlsx' | 'pdf',
    filters: PayrollReportFiltersInput,
): Promise<ExportPayrollReportResult> => {
    const data = await gqlRequest<{ exportPayrollReport: ExportPayrollReportResult }>(
        GraphQLService.REPORTING,
        EXPORT_PAYROLL_REPORT_MUTATION,
        { format: toGqlExportFormat(format), filters: toGqlPayrollReportFilters(filters) },
    );
    return data.exportPayrollReport;
};

export const getCustomReports = async (
    filters: CustomReportListFiltersInput,
): Promise<CustomReportsListResponse> => {
    const data = await gqlRequest<{ customReports: CustomReportsListResponse }>(
        GraphQLService.REPORTING,
        GET_CUSTOM_REPORTS_QUERY,
        { filters },
    );
    return data.customReports;
};

export const getCustomReportFilterOptions = async (
    companyOuId?: string,
): Promise<CustomReportFilterOptionsResponse> => {
    const data = await gqlRequest<{ customReportFilterOptions: CustomReportFilterOptionsResponse }>(
        GraphQLService.REPORTING,
        GET_CUSTOM_REPORT_FILTER_OPTIONS_QUERY,
        { companyOuId: companyOuId || null },
    );
    return {
        ...data.customReportFilterOptions,
        dataSources: data.customReportFilterOptions.dataSources.map((source) => ({
            ...source,
            chartOptions: normalizeChartOptions(source.chartOptions),
        })),
    };
};

export const runCustomReport = async (id: string): Promise<CustomReportRunResult> => {
    const data = await gqlRequest<{ runCustomReport: CustomReportRunResult }>(
        GraphQLService.REPORTING,
        RUN_CUSTOM_REPORT_QUERY,
        { id },
    );
    return normalizeCustomReportRunResult(data.runCustomReport);
};

export const createCustomReport = async (
    input: CreateCustomReportInput,
): Promise<CustomReportDefinitionResponse> => {
    const data = await gqlRequest<{ createCustomReport: CustomReportDefinitionResponse }>(
        GraphQLService.REPORTING,
        CREATE_CUSTOM_REPORT_MUTATION,
        { input: toGqlCreateCustomReportInput(input) },
    );
    return data.createCustomReport;
};

export const deleteCustomReport = async (id: string): Promise<boolean> => {
    const data = await gqlRequest<{ deleteCustomReport: boolean }>(
        GraphQLService.REPORTING,
        DELETE_CUSTOM_REPORT_MUTATION,
        { id },
    );
    return data.deleteCustomReport;
};

export const exportCustomReport = async (
    id: string,
    format: 'csv' | 'xlsx' | 'pdf',
): Promise<ExportCustomReportResult> => {
    const data = await gqlRequest<{ exportCustomReport: ExportCustomReportResult }>(
        GraphQLService.REPORTING,
        EXPORT_CUSTOM_REPORT_MUTATION,
        { id, format: toGqlExportFormat(format) },
    );
    return data.exportCustomReport;
};

export const getEmployeeSalaryHistory = async (employeeId: string): Promise<SalaryHistoryRecord[]> => {
    try {
        const data = await gqlRequest<{ employeeSalaryHistory: SalaryHistoryRecord[] }>(
            GraphQLService.AUDIT_LOG,
            GET_EMPLOYEE_SALARY_HISTORY_QUERY,
            { employeeId },
        );
        return data.employeeSalaryHistory;
    } catch {
        return [];
    }
};

export const getEmployeeTransferHistory = async (employeeId: string): Promise<TransferHistoryRecord[]> => {
    try {
        const data = await gqlRequest<{ employeeTransferHistory: TransferHistoryRecord[] }>(
            GraphQLService.AUDIT_LOG,
            GET_EMPLOYEE_TRANSFER_HISTORY_QUERY,
            { employeeId },
        );
        return data.employeeTransferHistory;
    } catch {
        return [];
    }
};
