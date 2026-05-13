'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  CREATE_EMPLOYEE_MUTATION,
  UPDATE_EMPLOYEE_MUTATION,
  DELETE_EMPLOYEE_MUTATION,
  GET_EMPLOYEE_QUERY,
  GET_EMPLOYEES_QUERY,
  GET_MY_EMPLOYEE_PROFILE_QUERY,
  INITIATE_TRANSFER_MUTATION,
  INVITE_EMPLOYEE_MUTATION,
  GET_EMPLOYEE_TRANSFER_HISTORY_QUERY,
  RECORD_TRANSFER_MUTATION,
  UPDATE_EMPLOYEE_STATUS_MUTATION,
} from './employee.queries';
import {
  EmployeeResponse,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeesFilters,
  TransferEmployeeInput,
  CreateInvitationInput,
  InvitationResponse,
  EmployeeTransferHistory,
  RecordTransferInput,
  UpdateEmployeeStatusInput,
} from './employee.types';
import { revalidatePath } from 'next/cache';

export async function fetchEmployees(filters: EmployeesFilters = {}): Promise<EmployeeResponse[]> {
  try {
    const data = await gqlRequest<{ employees: EmployeeResponse[] }>(
      GraphQLService.CORE_HR,
      GET_EMPLOYEES_QUERY,
      { ...filters }
    );
    return data.employees;
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
}

export async function fetchEmployee(id: string): Promise<EmployeeResponse | null> {
  try {
    const data = await gqlRequest<{ employee: EmployeeResponse }>(
      GraphQLService.CORE_HR,
      GET_EMPLOYEE_QUERY,
      { id }
    );
    return data.employee;
  } catch (error) {
    console.error(`Failed to fetch employee with id ${id}:`, error);
    return null;
  }
}

export async function createEmployee(input: CreateEmployeeInput): Promise<ActionResult<EmployeeResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createEmployee: EmployeeResponse }>(
      GraphQLService.CORE_HR,
      CREATE_EMPLOYEE_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/employees');
    return data.createEmployee;
  });
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<ActionResult<EmployeeResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateEmployee: EmployeeResponse }>(
      GraphQLService.CORE_HR,
      UPDATE_EMPLOYEE_MUTATION,
      { id, input }
    );
    revalidatePath('/dashboard/employees');
    return data.updateEmployee;
  });
}

export async function deleteEmployee(id: string): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deleteEmployee: boolean }>(
      GraphQLService.CORE_HR,
      DELETE_EMPLOYEE_MUTATION,
      { id }
    );
    revalidatePath('/dashboard/employees');
    return data.deleteEmployee;
  });
}

export async function fetchMyEmployeeProfile(): Promise<EmployeeResponse | null> {
  try {
    const data = await gqlRequest<{ myEmployeeProfile: EmployeeResponse }>(
      GraphQLService.CORE_HR,
      GET_MY_EMPLOYEE_PROFILE_QUERY,
      {}
    );
    return data.myEmployeeProfile;
  } catch (error) {
    console.error('Failed to fetch my employee profile:', error);
    return null;
  }
}

export async function initiateTransfer(input: TransferEmployeeInput): Promise<ActionResult<EmployeeResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ initiateTransfer: EmployeeResponse }>(
      GraphQLService.CORE_HR,
      INITIATE_TRANSFER_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/employees');
    return data.initiateTransfer;
  });
}

export async function inviteEmployee(input: CreateInvitationInput): Promise<ActionResult<InvitationResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ inviteEmployee: InvitationResponse }>(
      GraphQLService.AUTH,
      INVITE_EMPLOYEE_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/employees');
    return data.inviteEmployee;
  });
}

export async function fetchEmployeeTransferHistory(employeeId: string): Promise<EmployeeTransferHistory[]> {
  try {
    const data = await gqlRequest<{ employeeTransferHistory: EmployeeTransferHistory[] }>(
      GraphQLService.CORE_HR,
      GET_EMPLOYEE_TRANSFER_HISTORY_QUERY,
      { employeeId }
    );
    return data.employeeTransferHistory;
  } catch (error) {
    console.error(`Failed to fetch transfer history for employee ${employeeId}:`, error);
    return [];
  }
}

export async function recordTransfer(input: RecordTransferInput): Promise<ActionResult<EmployeeTransferHistory>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ recordTransfer: EmployeeTransferHistory }>(
      GraphQLService.CORE_HR,
      RECORD_TRANSFER_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/reports/payroll-reports');
    return data.recordTransfer;
  });
}

export async function updateEmployeeStatus(id: string, input: UpdateEmployeeStatusInput): Promise<ActionResult<EmployeeResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateEmployeeStatus: EmployeeResponse }>(
      GraphQLService.CORE_HR,
      UPDATE_EMPLOYEE_STATUS_MUTATION,
      { id, input }
    );
    revalidatePath('/dashboard/employees');
    return data.updateEmployeeStatus;
  });
}
