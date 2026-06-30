export enum PayrollCycle {
    MONTHLY = 'MONTHLY',
    WEEKLY = 'WEEKLY',
    BI_WEEKLY = 'BI_WEEKLY',
}

export enum PayrollComponentType {
    ALLOWANCE = 'ALLOWANCE',
    DEDUCTION = 'DEDUCTION',
}

export enum PayrollComponentValueType {
    FIXED = 'FIXED',
    PERCENTAGE = 'PERCENTAGE',
}

export enum PayrollComponentSortBy {
    CREATED_AT = 'createdAt',
    NAME = 'name',
    CATEGORY = 'category',
    TYPE = 'type',
    VALUE = 'value',
    IS_ACTIVE = 'isActive',
}

export enum PayrollComponentSortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export interface PayrollConfigResponse {
    id: string;
    companyId: string;
    cycleType: PayrollCycle;
    payDay: number;
    autoFinalize: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpcomingPayrollResponse {
    date: string;
    periodStart: string;
    periodEnd: string;
    daysRemaining: number;
}

export interface PayrollRunResponse {
    id: string;
    companyId: string;
    startDate: string;
    endDate: string;
    status: string;
    employeeCount: number;
    grossPay: number;
    netPay: number;
    createdAt: string;
    updatedAt: string;
}

export enum PayrollRunSortBy {
    START_DATE = 'startDate',
    END_DATE = 'endDate',
    STATUS = 'status',
    CREATED_AT = 'createdAt',
    EMPLOYEE_COUNT = 'employeeCount',
}

export enum PayrollRunListSortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum PayrollRunStatusFilter {
    DRAFT = 'draft',
    FINALIZED = 'finalized',
    PAID = 'paid',
}

export enum PayslipSortBy {
    CREATED_AT = 'createdAt',
    GROSS_PAY = 'grossPay',
    NET_PAY = 'netPay',
    EMPLOYEE_NAME = 'employeeName',
}

export enum PayslipListSortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export interface PayrollRunListSummary {
    totalRuns: number;
    completedRuns: number;
    pendingRuns: number;
    totalGrossPay: number;
}

export interface PaginatedPayrollRunResponse {
    data: PayrollRunResponse[];
    metaData: PaginatedMetaData;
    summary: PayrollRunListSummary;
}

export interface PayslipListSummary {
    totalGrossPay: number;
    totalNetPay: number;
    currency?: string;
}

export interface PaginatedPayslipResponse {
    data: PayslipResponse[];
    metaData: PaginatedMetaData;
    summary: PayslipListSummary;
}

export interface PayrollRunFilterInput {
    search?: string;
    status?: PayrollRunStatusFilter;
    year?: number;
    sortBy?: PayrollRunSortBy;
    sortOrder?: PayrollRunListSortOrder;
}

export interface PayrollRunPaginationInput {
    page?: number;
    size?: number;
}

export interface PayslipFilterInput {
    payrollRunId?: string;
    employeeId?: string;
    search?: string;
    sortBy?: PayslipSortBy;
    sortOrder?: PayslipListSortOrder;
}

export interface PayslipPaginationInput {
    page?: number;
    size?: number;
}

export const PAYROLL_RUNS_ALL_PAGE_SIZE = 0;

export interface PayslipResponse {
    id: string;
    companyId: string;
    employeeId: string;
    payrollRunId: string;
    currency: string;
    basicSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    totalOvertime: number;
    totalDutyOvertime: number;
    unpaidLeaveDeduction: number;
    loanDeduction: number;
    incomeTaxAmount: number;
    taxRuleId?: string;
    taxRuleName?: string;
    grossPay: number;
    netPay: number;
    createdAt: string;
}

export interface PayslipRatesResponse {
    hourlyRate: number;
    dailyRate: number;
    scalingFactor: number;
    daysInPeriod: number;
    eligibleCalendarDays: number;
}

export interface PayslipCalculationLineResponse {
    code: string;
    label: string;
    category: string;
    amount: number;
    componentType?: string | null;
    rawValue?: number | null;
}

export interface PayslipTaxBracketSnapshotResponse {
    minAmount: number;
    maxAmount?: number | null;
    rate: number;
    taxAmount: number;
}

export interface PayslipTaxSnapshotResponse {
    taxRuleId: string;
    taxRuleName: string;
    taxableIncome: number;
    taxAmount: number;
    brackets: PayslipTaxBracketSnapshotResponse[];
}

export interface PayslipDetailResponse extends PayslipResponse {
    periodStart: string;
    periodEnd: string;
    payrollEligible: boolean;
    ineligibilityReason?: PayrollIneligibilityReason | null;
    monthlyBasicSalary: number;
    allowances: PayrollComponentLineResponse[];
    deductions: PayrollComponentLineResponse[];
    lines: PayslipCalculationLineResponse[];
    attendance: PayrollAttendanceSummaryResponse;
    rates: PayslipRatesResponse;
    tax?: PayslipTaxSnapshotResponse | null;
}

export interface GeneratePayrollRunPayslipsInput {
    companyId: string;
    payrollRunId: string;
}

export interface GeneratePayrollRunPayslipsResponse {
    generatedCount: number;
    skippedCount: number;
    payslips: PayslipResponse[];
}

export interface PayrollComponentLineResponse {
    id: string;
    name: string;
    type: string;
    rawValue: number;
    amount: number;
    taxable?: boolean;
}

export interface PayrollAttendanceSummaryResponse {
    workingDays: number;
    presentDays: number;
    halfDays: number;
    absentDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    overtimeHours: number;
    attendanceRate: number;
}

export enum PayrollIneligibilityReason {
    NO_ACTIVE_CONTRACT = 'NO_ACTIVE_CONTRACT',
    CONTRACT_EFFECTIVE_DATE_MISSING = 'CONTRACT_EFFECTIVE_DATE_MISSING',
    CONTRACT_NOT_EFFECTIVE_IN_PERIOD = 'CONTRACT_NOT_EFFECTIVE_IN_PERIOD',
}

export interface EmployeePayrollPreviewResponse {
    currency: string;
    periodStart: string;
    periodEnd: string;
    payrollEligible: boolean;
    ineligibilityReason?: PayrollIneligibilityReason | null;
    monthlyBasicSalary: number;
    basicSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    totalOvertime: number;
    totalDutyOvertime: number;
    unpaidLeaveDeduction: number;
    loanDeduction: number;
    incomeTaxAmount: number;
    grossPay: number;
    netPay: number;
    allowances: PayrollComponentLineResponse[];
    deductions: PayrollComponentLineResponse[];
    attendance: PayrollAttendanceSummaryResponse;
    tax?: PayslipTaxSnapshotResponse | null;
}

export interface PreviewEmployeePayrollInput {
    companyId: string;
    employeeId: string;
    startDate?: string;
    endDate?: string;
}

export type {
    SalaryStructureResponse,
    CreateSalaryStructureInput,
    AssignEmployeeSalaryInput,
} from './salary-structure/salary-structure.types';

export interface WpsFileResult {
    filename: string;
    content: string;
    format: string;
    generatedAt: string;
}

export interface PayrollComponentResponse {
    id: string;
    ouId: string;
    name: string;
    description?: string;
    category: PayrollComponentType;
    type: PayrollComponentValueType;
    value: number;
    taxable?: boolean;
    recurring?: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type PayrollComponent = PayrollComponentResponse;

export interface PaginatedMetaData {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    timestamp?: string;
}

export interface PayrollComponentSummary {
    activeCount: number;
    fixedCount: number;
    totalFixedValue: number;
}

export interface PaginatedPayrollComponentResponse {
    data: PayrollComponentResponse[];
    metaData: PaginatedMetaData;
    summary: PayrollComponentSummary;
}

export interface PayrollComponentFilterInput {
    search?: string;
    category?: PayrollComponentType;
    isActive?: boolean;
    type?: PayrollComponentValueType;
    sortBy?: PayrollComponentSortBy;
    sortOrder?: PayrollComponentSortOrder;
}

export interface PayrollComponentPaginationInput {
    page?: number;
    size?: number;
}

export const PAYROLL_COMPONENTS_ALL_PAGE_SIZE = 0;

export interface CreatePayrollRunInput {
    companyId: string;
    startDate: string;
    endDate: string;
    replaceExisting?: boolean;
}

export interface GeneratePayslipInput {
    companyId: string;
    employeeId: string;
    payrollRunId: string;
}

export interface GenerateWpsInput {
    payrollRunId: string;
    format: string;
}

export interface UpdatePayrollConfigInput {
    companyId: string;
    cycleType?: PayrollCycle;
    payDay?: number;
    autoFinalize?: boolean;
}

export interface PayrollComponentInput {
    id?: string;
    ouId?: string;
    category: PayrollComponentType;
    name: string;
    description?: string;
    type: PayrollComponentValueType | string;
    value: number;
    taxable?: boolean;
    recurring?: boolean;
    isActive?: boolean;
}

export type CreatePayrollComponentInput = PayrollComponentInput;

export interface UpdatePayrollComponentInput {
    id: string;
    ouId?: string;
    category: PayrollComponentType;
    name?: string;
    description?: string;
    type: PayrollComponentValueType | string;
    value?: number;
    taxable?: boolean;
    recurring?: boolean;
    isActive?: boolean;
}

export type UpsertPayrollComponentInput = PayrollComponentInput;

export interface SalaryHistory {
    id: string;
    employeeId: string;
    companyId: string;
    oldBasicSalary: number;
    newBasicSalary: number;
    effectiveDate: string;
    changeReason?: string;
    processedBy: string;
    createdAt: string;
}

export function toPayrollValueType(type: string): PayrollComponentValueType {
    const normalized = type.trim().toUpperCase().replace(/-/g, '_');
    return normalized === PayrollComponentValueType.PERCENTAGE
        ? PayrollComponentValueType.PERCENTAGE
        : PayrollComponentValueType.FIXED;
}

export function isPercentageType(type: string): boolean {
    return toPayrollValueType(type) === PayrollComponentValueType.PERCENTAGE;
}
