'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  GET_PAYROLL_CONFIG_QUERY,
  GET_UPCOMING_PAYROLL_DATE_QUERY,
  GET_PAYROLL_RUN_QUERY,
  GET_PAYROLL_RUNS_QUERY,
  GET_PAYROLL_RUNS_PAGINATED_QUERY,
  GET_PAYSLIP_QUERY,
  GET_PAYSLIPS_PAGINATED_QUERY,
  EMPLOYEE_PAYROLL_PREVIEW_QUERY,
  CREATE_PAYROLL_RUN_MUTATION,
  FINALIZE_PAYROLL_RUN_MUTATION,
  MARK_PAYROLL_RUN_PAID_MUTATION,
  DELETE_PAYROLL_RUN_MUTATION,
  GENERATE_PAYSLIP_MUTATION,
  REGENERATE_PAYSLIP_MUTATION,
  GENERATE_PAYROLL_RUN_PAYSLIPS_MUTATION,
  GENERATE_WPS_FILE_MUTATION,
  UPDATE_PAYROLL_CONFIG_MUTATION,
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
  PayslipDetailResponse,
  WpsFileResult,
  PayrollComponent,
  PayrollComponentType,
  PaginatedPayrollComponentResponse,
  PayrollComponentFilterInput,
  PayrollComponentPaginationInput,
  PaginatedPayrollRunResponse,
  PaginatedPayslipResponse,
  PayrollRunFilterInput,
  PayrollRunPaginationInput,
  PayslipFilterInput,
  PayslipPaginationInput,
  CreatePayrollRunInput,
  PreviewEmployeePayrollInput,
  EmployeePayrollPreviewResponse,
  GeneratePayslipInput,
  GeneratePayrollRunPayslipsInput,
  GeneratePayrollRunPayslipsResponse,
  GenerateWpsInput,
  UpdatePayrollConfigInput,
  CreatePayrollComponentInput,
  UpdatePayrollComponentInput,
  UpsertPayrollComponentInput,
  SalaryHistory,
  toPayrollValueType,
} from './payroll.types';
import {
  serializePayrollRunFilterForGraphql,
  serializePayslipFilterForGraphql,
} from './payroll-graphql-filter.utils';
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

function mapPayrollComponentInput<T extends CreatePayrollComponentInput | UpsertPayrollComponentInput>(
  input: T,
): T {
  return {
    ...input,
    type: toPayrollValueType(String(input.type)),
  };
}

export async function fetchPayrollComponents(
  ouId: string,
  filter?: PayrollComponentFilterInput,
  pagination?: PayrollComponentPaginationInput,
): Promise<PaginatedPayrollComponentResponse> {
  try {
    const data = await gqlRequest<{ payrollComponents: PaginatedPayrollComponentResponse }>(
      GraphQLService.PAYROLL,
      GET_PAYROLL_COMPONENTS_QUERY,
      {
        ouId,
        ...(filter ? { filter } : {}),
        ...(pagination ? { pagination } : {}),
      },
    );
    return data.payrollComponents;
  } catch (error) {
    console.error('Failed to fetch payroll components:', error);
    return {
      data: [],
      metaData: {
        page: 1,
        size: pagination?.size ?? 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      summary: {
        activeCount: 0,
        fixedCount: 0,
        totalFixedValue: 0,
      },
    };
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

export async function fetchPayrollRunsPaginated(
  companyId: string,
  filter?: PayrollRunFilterInput,
  pagination?: PayrollRunPaginationInput,
  displayCurrency?: string,
): Promise<PaginatedPayrollRunResponse> {
  try {
    const data = await gqlRequest<{ payrollRunsPaginated: PaginatedPayrollRunResponse }>(
      GraphQLService.PAYROLL,
      GET_PAYROLL_RUNS_PAGINATED_QUERY,
      {
        companyId,
        ...(filter ? { filter: serializePayrollRunFilterForGraphql(filter) } : {}),
        ...(pagination ? { pagination } : {}),
        ...(displayCurrency ? { displayCurrency } : {}),
      },
    );
    return data.payrollRunsPaginated;
  } catch (error) {
    console.error('Failed to fetch paginated payroll runs:', error);
    return {
      data: [],
      metaData: {
        page: 1,
        size: pagination?.size ?? 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      summary: {
        totalRuns: 0,
        completedRuns: 0,
        pendingRuns: 0,
        totalGrossPay: 0,
      },
    };
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

export async function fetchPayslip(id: string): Promise<PayslipDetailResponse | null> {
  const data = await gqlRequest<{ payslip: PayslipDetailResponse }>(
    GraphQLService.PAYROLL,
    GET_PAYSLIP_QUERY,
    { id },
  );
  return data.payslip ?? null;
}

export async function fetchPayslipsPaginated(
  companyId: string,
  filter?: PayslipFilterInput,
  pagination?: PayslipPaginationInput,
  displayCurrency?: string,
): Promise<PaginatedPayslipResponse> {
  try {
    const data = await gqlRequest<{ payslipsPaginated: PaginatedPayslipResponse }>(
      GraphQLService.PAYROLL,
      GET_PAYSLIPS_PAGINATED_QUERY,
      {
        companyId,
        ...(filter ? { filter: serializePayslipFilterForGraphql(filter) } : {}),
        ...(pagination ? { pagination } : {}),
        ...(displayCurrency ? { displayCurrency } : {}),
      },
    );
    return data.payslipsPaginated;
  } catch (error) {
    console.error(`Failed to fetch payslips for company ${companyId}:`, error);
    return {
      data: [],
      metaData: {
        page: pagination?.page ?? 1,
        size: pagination?.size ?? 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      summary: {
        totalGrossPay: 0,
        totalNetPay: 0,
      },
    };
  }
}

export async function fetchEmployeePayrollPreview(
  input: PreviewEmployeePayrollInput,
): Promise<EmployeePayrollPreviewResponse | null> {
  try {
    const data = await gqlRequest<{ employeePayrollPreview: EmployeePayrollPreviewResponse }>(
      GraphQLService.PAYROLL,
      EMPLOYEE_PAYROLL_PREVIEW_QUERY,
      { input },
    );
    return data.employeePayrollPreview;
  } catch (error) {
    console.error('Failed to fetch employee payroll preview:', error);
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

export async function deletePayrollRun(id: string): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deletePayrollRun: boolean }>(
      GraphQLService.PAYROLL,
      DELETE_PAYROLL_RUN_MUTATION,
      { id },
    );
    revalidatePath('/dashboard/payroll/runs');
    return data.deletePayrollRun;
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
    revalidatePath('/dashboard/payroll/runs');
    return data.generatePayslip;
  });
}

export async function regeneratePayslip(input: GeneratePayslipInput): Promise<ActionResult<PayslipResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ regeneratePayslip: PayslipResponse }>(
      GraphQLService.PAYROLL,
      REGENERATE_PAYSLIP_MUTATION,
      { input },
    );
    revalidatePath('/dashboard/payroll/payslips');
    revalidatePath('/dashboard/payroll/runs');
    return data.regeneratePayslip;
  });
}

export async function generatePayrollRunPayslips(
  input: GeneratePayrollRunPayslipsInput,
): Promise<ActionResult<GeneratePayrollRunPayslipsResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ generatePayrollRunPayslips: GeneratePayrollRunPayslipsResponse }>(
      GraphQLService.PAYROLL,
      GENERATE_PAYROLL_RUN_PAYSLIPS_MUTATION,
      { input },
    );
    revalidatePath('/dashboard/payroll/payslips');
    revalidatePath('/dashboard/payroll/runs');
    return data.generatePayrollRunPayslips;
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

export async function createPayrollComponent(
  input: CreatePayrollComponentInput
): Promise<ActionResult<PayrollComponent>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createPayrollComponent: PayrollComponent }>(
      GraphQLService.PAYROLL,
      CREATE_PAYROLL_COMPONENT_MUTATION,
      { input: mapPayrollComponentInput(input) }
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
      { inputs: inputs.map(mapPayrollComponentInput) }
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
        { input: mapPayrollComponentInput(input) }
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
    const payload = {
      ...inputWithoutId,
      type: toPayrollValueType(String(inputWithoutId.type)),
    };
    const data = await gqlRequest<{ updatePayrollComponent: PayrollComponent }>(
      GraphQLService.PAYROLL,
      UPDATE_PAYROLL_COMPONENT_MUTATION,
      { id, input: payload }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.updatePayrollComponent;
  });
}

export async function deletePayrollComponent(
  id: string,
  category: PayrollComponentType
): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deletePayrollComponent: boolean }>(
      GraphQLService.PAYROLL,
      DELETE_PAYROLL_COMPONENT_MUTATION,
      { id, category }
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
