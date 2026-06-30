import { OvertimePolicyResponse } from '../overtime-policy/overtime-policy.types';
import { PayrollComponentResponse } from '../payroll.types';

export interface SalaryStructureResponse {
  id: string;
  companyId: string;
  name: string;
  code?: string;
  description?: string;
  ouId?: string;
  isActive: boolean;
  allowances: PayrollComponentResponse[];
  deductions: PayrollComponentResponse[];
  normalOvertimePolicy?: OvertimePolicyResponse;
  weekendOvertimePolicy?: OvertimePolicyResponse;
  holidayOvertimePolicy?: OvertimePolicyResponse;
  dutyOvertimePolicy?: OvertimePolicyResponse;
  employeeId?: string;
  baseSalary?: number;
  currency?: string;
  assignmentId?: string;
  assignedEmployeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalaryStructureInput {
  companyId: string;
  name: string;
  code?: string;
  description?: string;
  ouId?: string;
  normalOvertimePolicyId?: string;
  weekendOvertimePolicyId?: string;
  holidayOvertimePolicyId?: string;
  dutyOvertimePolicyId?: string;
  allowanceIds?: string[];
  deductionIds?: string[];
}

export interface UpdateSalaryStructureInput {
  companyId: string;
  name?: string;
  code?: string;
  description?: string;
  ouId?: string;
  isActive?: boolean;
  normalOvertimePolicyId?: string;
  weekendOvertimePolicyId?: string;
  holidayOvertimePolicyId?: string;
  dutyOvertimePolicyId?: string;
  allowanceIds?: string[];
  deductionIds?: string[];
}

export interface AssignEmployeeSalaryInput {
  companyId: string;
  employeeId: string;
  employeeContractId?: string;
  salaryStructureId: string;
  baseSalary: number;
  currency: string;
  effectiveFrom?: string;
  changeReason?: string;
  changeReasonNote?: string;
}
