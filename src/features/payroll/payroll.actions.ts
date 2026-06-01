'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  GET_PAYROLL_CONFIG_QUERY,
  GET_UPCOMING_PAYROLL_DATE_QUERY,
  GET_PAYROLL_RUN_QUERY,
  GET_PAYROLL_RUNS_QUERY,
  GET_PAYSLIP_QUERY,
  GET_PAYSLIPS_BY_EMPLOYEE_QUERY,
  GET_PAYSLIPS_BY_PAYROLL_RUN_QUERY,
  GET_SALARY_STRUCTURE_QUERY,
  CREATE_PAYROLL_RUN_MUTATION,
  FINALIZE_PAYROLL_RUN_MUTATION,
  MARK_PAYROLL_RUN_PAID_MUTATION,
  GENERATE_PAYSLIP_MUTATION,
  GENERATE_WPS_FILE_MUTATION,
  UPDATE_PAYROLL_CONFIG_MUTATION,
  CREATE_SALARY_STRUCTURE_MUTATION,
  ADD_ALLOWANCE_TO_SALARY_STRUCTURE_MUTATION,
  REMOVE_ALLOWANCE_FROM_SALARY_STRUCTURE_MUTATION,
  ADD_DEDUCTION_TO_SALARY_STRUCTURE_MUTATION,
  REMOVE_DEDUCTION_FROM_SALARY_STRUCTURE_MUTATION,
  CREATE_PAYROLL_COMPONENT_MUTATION,
  UPDATE_PAYROLL_COMPONENT_MUTATION,
  UPSERT_PAYROLL_COMPONENTS_MUTATION,
  DELETE_PAYROLL_COMPONENT_MUTATION,
  GET_PAYROLL_COMPONENTS_QUERY,
  GET_EMPLOYEE_SALARY_HISTORY_QUERY,
} from './payroll.queries';
import {
  PayrollConfigResponse,
  UpcomingPayrollResponse,
  PayrollRunResponse,
  PayslipResponse,
  SalaryStructureResponse,
  WpsFileResult,
  PayrollComponent,
  PayrollComponentType,
  CreatePayrollRunInput,
  GeneratePayslipInput,
  GenerateWpsInput,
  UpdatePayrollConfigInput,
  CreateSalaryStructureInput,
  CreatePayrollComponentInput,
  UpdatePayrollComponentInput,
  UpsertPayrollComponentInput,
  SalaryHistory,
} from './payroll.types';
import { revalidatePath } from 'next/cache';

export async function fetchPayrollConfig(companyId: string): Promise<PayrollConfigResponse | null> {
  try {
    const data = await gqlRequest<{ getPayrollConfig: PayrollConfigResponse }>(
      GraphQLService.PAYROLL,
      GET_PAYROLL_CONFIG_QUERY,
      { companyId }
    );
    return data.getPayrollConfig;
  } catch (error) {
    console.error('Failed to fetch payroll config:', error);
    return null;
  }
}

export async function fetchPayrollComponents(companyId: string, isActive?: boolean): Promise<PayrollComponent[]> {
  try {
    const variables: any = { companyId };
    if (isActive !== undefined) {
      variables.isActive = isActive;
    }
    
    const data = await gqlRequest<{ payrollComponents: PayrollComponent[] }>(
      GraphQLService.PAYROLL,
      GET_PAYROLL_COMPONENTS_QUERY,
      variables
    );
    return data.payrollComponents;
  } catch (error) {
    console.error('Failed to fetch payroll components:', error);
    return [];
  }
}

export async function fetchUpcomingPayrollDate(companyId: string): Promise<UpcomingPayrollResponse | null> {
  try {
    const data = await gqlRequest<{ getUpcomingPayrollDate: UpcomingPayrollResponse }>(
      GraphQLService.PAYROLL,
      GET_UPCOMING_PAYROLL_DATE_QUERY,
      { companyId }
    );
    return data.getUpcomingPayrollDate;
  } catch (error) {
    console.error('Failed to fetch upcoming payroll date:', error);
    return null;
  }
}

export async function fetchPayrollRuns(companyId: string): Promise<PayrollRunResponse[]> {
  try {
    const data = await gqlRequest<{ payrollRuns: PayrollRunResponse[] }>(
      GraphQLService.PAYROLL,
      GET_PAYROLL_RUNS_QUERY,
      { companyId }
    );
    return data.payrollRuns;
  } catch (error) {
    console.error('Failed to fetch payroll runs:', error);
    return [];
  }
}

export async function fetchPayrollRun(id: string): Promise<PayrollRunResponse | null> {
  try {
    const data = await gqlRequest<{ payrollRun: PayrollRunResponse }>(
      GraphQLService.PAYROLL,
      GET_PAYROLL_RUN_QUERY,
      { id }
    );
    return data.payrollRun;
  } catch (error) {
    console.error(`Failed to fetch payroll run with id ${id}:`, error);
    return null;
  }
}

export async function fetchPayslip(id: string): Promise<PayslipResponse | null> {
  try {
    const data = await gqlRequest<{ payslip: PayslipResponse }>(
      GraphQLService.PAYROLL,
      GET_PAYSLIP_QUERY,
      { id }
    );
    return data.payslip;
  } catch (error) {
    console.error(`Failed to fetch payslip with id ${id}:`, error);
    return null;
  }
}

export async function fetchPayslipsByEmployee(employeeId: string): Promise<PayslipResponse[]> {
  try {
    const data = await gqlRequest<{ payslipsByEmployee: PayslipResponse[] }>(
      GraphQLService.PAYROLL,
      GET_PAYSLIPS_BY_EMPLOYEE_QUERY,
      { employeeId }
    );
    return data.payslipsByEmployee;
  } catch (error) {
    console.error(`Failed to fetch payslips for employee ${employeeId}:`, error);
    return [];
  }
}

export async function fetchPayslipsByPayrollRun(payrollRunId: string): Promise<PayslipResponse[]> {
  try {
    const data = await gqlRequest<{ payslipsByPayrollRun: PayslipResponse[] }>(
      GraphQLService.PAYROLL,
      GET_PAYSLIPS_BY_PAYROLL_RUN_QUERY,
      { payrollRunId }
    );
    return data.payslipsByPayrollRun;
  } catch (error) {
    console.error(`Failed to fetch payslips for payroll run ${payrollRunId}:`, error);
    return [];
  }
}

export async function fetchSalaryStructure(
  employeeId: string
): Promise<SalaryStructureResponse | null> {
  try {
    const data = await gqlRequest<{ salaryStructure: SalaryStructureResponse | null }>(
      GraphQLService.PAYROLL,
      GET_SALARY_STRUCTURE_QUERY,
      { employeeId }
    );
    return data.salaryStructure;
  } catch (error) {
    console.error(`Failed to fetch salary structure for employee ${employeeId}:`, error);
    return null;
  }
}

export async function createPayrollRun(input: CreatePayrollRunInput): Promise<ActionResult<PayrollRunResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createPayrollRun: PayrollRunResponse }>(
      GraphQLService.PAYROLL,
      CREATE_PAYROLL_RUN_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/payroll');
    return data.createPayrollRun;
  });
}

export async function finalizePayrollRun(id: string): Promise<ActionResult<PayrollRunResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ finalizePayrollRun: PayrollRunResponse }>(
      GraphQLService.PAYROLL,
      FINALIZE_PAYROLL_RUN_MUTATION,
      { id }
    );
    revalidatePath('/dashboard/payroll');
    return data.finalizePayrollRun;
  });
}

export async function markPayrollRunPaid(id: string): Promise<ActionResult<PayrollRunResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ markPayrollRunPaid: PayrollRunResponse }>(
      GraphQLService.PAYROLL,
      MARK_PAYROLL_RUN_PAID_MUTATION,
      { id }
    );
    revalidatePath('/dashboard/payroll');
    return data.markPayrollRunPaid;
  });
}

export async function generatePayslip(input: GeneratePayslipInput): Promise<ActionResult<PayslipResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ generatePayslip: PayslipResponse }>(
      GraphQLService.PAYROLL,
      GENERATE_PAYSLIP_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/payroll/payslips');
    return data.generatePayslip;
  });
}

export async function generateWpsFile(input: GenerateWpsInput): Promise<ActionResult<WpsFileResult>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ generateWpsFile: WpsFileResult }>(
      GraphQLService.PAYROLL,
      GENERATE_WPS_FILE_MUTATION,
      { input }
    );
    return data.generateWpsFile;
  });
}

export async function updatePayrollConfig(
  input: UpdatePayrollConfigInput
): Promise<ActionResult<PayrollConfigResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updatePayrollConfig: PayrollConfigResponse }>(
      GraphQLService.PAYROLL,
      UPDATE_PAYROLL_CONFIG_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.updatePayrollConfig;
  });
}

export async function createSalaryStructure(
  input: CreateSalaryStructureInput
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      CREATE_SALARY_STRUCTURE_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    return data.createSalaryStructure;
  });
}

export async function addAllowanceToSalaryStructure(
  id: string,
  allowanceId: string
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ addAllowanceToSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      ADD_ALLOWANCE_TO_SALARY_STRUCTURE_MUTATION,
      { id, allowanceId }
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    return data.addAllowanceToSalaryStructure;
  });
}

export async function removeAllowanceFromSalaryStructure(
  id: string,
  allowanceId: string
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ removeAllowanceFromSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      REMOVE_ALLOWANCE_FROM_SALARY_STRUCTURE_MUTATION,
      { id, allowanceId }
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    return data.removeAllowanceFromSalaryStructure;
  });
}

export async function addDeductionToSalaryStructure(
  id: string,
  deductionId: string
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ addDeductionToSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      ADD_DEDUCTION_TO_SALARY_STRUCTURE_MUTATION,
      { id, deductionId }
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    return data.addDeductionToSalaryStructure;
  });
}

export async function removeDeductionFromSalaryStructure(
  id: string,
  deductionId: string
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ removeDeductionFromSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      REMOVE_DEDUCTION_FROM_SALARY_STRUCTURE_MUTATION,
      { id, deductionId }
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    return data.removeDeductionFromSalaryStructure;
  });
}

export async function createPayrollComponent(
  input: CreatePayrollComponentInput
): Promise<ActionResult<PayrollComponent>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createPayrollComponent: PayrollComponent }>(
      GraphQLService.PAYROLL,
      CREATE_PAYROLL_COMPONENT_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.createPayrollComponent;
  });
}

export async function upsertPayrollComponents(
  inputs: UpsertPayrollComponentInput[]
): Promise<ActionResult<PayrollComponent[]>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ upsertPayrollComponents: PayrollComponent[] }>(
      GraphQLService.PAYROLL,
      UPSERT_PAYROLL_COMPONENTS_MUTATION,
      { inputs }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.upsertPayrollComponents;
  });
}

export async function createPayrollComponentsBatch(
  inputs: CreatePayrollComponentInput[]
): Promise<ActionResult<PayrollComponent[]>> {
  return safeAction(async () => {
    const results: PayrollComponent[] = [];
    
    for (const input of inputs) {
      const data = await gqlRequest<{ createPayrollComponent: PayrollComponent }>(
        GraphQLService.PAYROLL,
        CREATE_PAYROLL_COMPONENT_MUTATION,
        { input }
      );
      results.push(data.createPayrollComponent);
    }
    
    revalidatePath('/dashboard/payroll/settings');
    return JSON.parse(JSON.stringify(results));
  });
}

export async function updatePayrollComponent(
  input: UpdatePayrollComponentInput
): Promise<ActionResult<PayrollComponent>> {
  return safeAction(async () => {
    const { id, ...inputWithoutId } = input;
    const data = await gqlRequest<{ updatePayrollComponent: PayrollComponent }>(
      GraphQLService.PAYROLL,
      UPDATE_PAYROLL_COMPONENT_MUTATION,
      { id, input: inputWithoutId }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.updatePayrollComponent;
  });
}

export async function deletePayrollComponent(
  id: string,
  componentType: PayrollComponentType
): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deletePayrollComponent: boolean }>(
      GraphQLService.PAYROLL,
      DELETE_PAYROLL_COMPONENT_MUTATION,
      { id, componentType }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.deletePayrollComponent;
  });
}

export async function fetchEmployeeSalaryHistory(employeeId: string): Promise<SalaryHistory[]> {
  try {
    const data = await gqlRequest<{ employeeSalaryHistory: SalaryHistory[] }>(
      GraphQLService.PAYROLL,
      GET_EMPLOYEE_SALARY_HISTORY_QUERY,
      { employeeId }
    );
    return data.employeeSalaryHistory;
  } catch (error) {
    console.error(`Failed to fetch salary history for employee ${employeeId}:`, error);
    return [];
  }
}
