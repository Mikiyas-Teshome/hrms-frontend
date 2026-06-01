import { AllowanceResponse } from '../allowance/allowance.types';
import { DeductionResponse } from '../deduction/deduction.types';
import { OvertimePolicyResponse } from '../overtime-policy/overtime-policy.types';

export enum PayrollCycle {
    MONTHLY = 'MONTHLY',
    WEEKLY = 'WEEKLY',
    BI_WEEKLY = 'BI_WEEKLY'
}

export enum PayrollComponentType {
    ALLOWANCE = 'ALLOWANCE',
    DEDUCTION = 'DEDUCTION'
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
    createdAt: string;
    updatedAt: string;
}

export interface PayslipResponse {
    id: string;
    companyId: string;
    employeeId: string;
    payrollRunId: string;
    basicSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    grossPay: number;
    netPay: number;
    createdAt: string;
}

export interface SalaryStructureResponse {
    id: string;
    companyId: string;
    employeeId: string;
    basicSalary: number;
    currency: string;
    allowances: AllowanceResponse[];
    deductions: DeductionResponse[];
    normalOvertimePolicy?: OvertimePolicyResponse;
    weekendOvertimePolicy?: OvertimePolicyResponse;
    holidayOvertimePolicy?: OvertimePolicyResponse;
    dutyOvertimePolicy?: OvertimePolicyResponse;
    createdAt: string;
    updatedAt: string;
}

export interface WpsFileResult {
    filename: string;
    content: string;
    format: string;
    generatedAt: string;
}

export type PayrollComponent = AllowanceResponse | DeductionResponse;

export interface CreatePayrollRunInput {
    companyId: string;
    startDate: string;
    endDate: string;
}

export interface GeneratePayslipInput {
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

export interface CreateSalaryStructureInput {
    employeeId: string;
    basicSalary: number;
    currency: string;
}

export interface CreatePayrollComponentInput {
    companyId?: string;
    componentType: PayrollComponentType;
    name: string;
    description?: string;
    type: string;
    value: number;
    taxable?: boolean;
    recurring?: boolean;
}
export interface UpdatePayrollComponentInput {
    componentType: PayrollComponentType;
    id: string;
    companyId?: string;
    name?: string;
    description?: string;
    recurring?: boolean;
    taxable?: boolean;
    type?: string;
    value?: number;
}

export interface UpsertPayrollComponentInput {
    id?: string;
    companyId?: string;
    componentType: PayrollComponentType;
    name?: string;
    type?: string;
    value?: number;
    taxable?: boolean;
    recurring?: boolean;
    isActive?: boolean;
}

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
