'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  GET_EMPLOYEE_CONTRACTS_QUERY,
  GET_MY_EMPLOYEE_CONTRACTS_QUERY,
  GET_EMPLOYEE_CONTRACT_QUERY,
  GET_ACTIVE_EMPLOYEE_CONTRACT_BY_TEMPLATE_QUERY,
  ASSIGN_EMPLOYEE_CONTRACT_MUTATION,
  UPDATE_DRAFT_EMPLOYEE_CONTRACT_MUTATION,
  RENEW_EMPLOYEE_CONTRACT_MUTATION,
  ACTIVATE_EMPLOYEE_CONTRACT_MUTATION,
  ACTIVATE_MY_EMPLOYEE_CONTRACT_MUTATION,
  REJECT_MY_EMPLOYEE_CONTRACT_MUTATION,
} from './employee-contract.queries';
import {
  EmployeeContract,
  EmployeeContractFilterInput,
  PaginatedEmployeeContractResponse,
  ActiveEmployeeContractByTemplateFilter,
  AssignEmployeeContractInput,
  UpdateDraftEmployeeContractInput,
  RenewEmployeeContractInput,
} from './employee-contract.types';
import { ContractStatus } from './contracts.types';

function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toActionError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallback);
}

export async function fetchMyEmployeeContracts(
  filter: EmployeeContractFilterInput = {},
): Promise<PaginatedEmployeeContractResponse> {
  try {
    const data = await gqlRequest<{ myEmployeeContracts: PaginatedEmployeeContractResponse }>(
      GraphQLService.CORE_HR,
      GET_MY_EMPLOYEE_CONTRACTS_QUERY,
      { filter },
    );
    return toSerializable(data.myEmployeeContracts);
  } catch (error) {
    console.error('Failed to fetch my employee contracts:', error);
    throw toActionError(
      error,
      'Failed to load your contract. Please try again.',
    );
  }
}

export async function fetchEmployeeContracts(
  filter: EmployeeContractFilterInput = {},
): Promise<PaginatedEmployeeContractResponse> {
  try {
    const data = await gqlRequest<{ employeeContracts: PaginatedEmployeeContractResponse }>(
      GraphQLService.CORE_HR,
      GET_EMPLOYEE_CONTRACTS_QUERY,
      { filter },
    );
    return data.employeeContracts;
  } catch (error) {
    console.error('Failed to fetch employee contracts:', error);
    return {
      data: [],
      pagination: {
        total: 0,
        page: filter.page || 1,
        limit: filter.limit || 10,
        totalPages: 0,
      },
    };
  }
}

export async function fetchEmployeeContract(id: string): Promise<EmployeeContract | null> {
  try {
    const data = await gqlRequest<{ employeeContract: EmployeeContract | null }>(
      GraphQLService.CORE_HR,
      GET_EMPLOYEE_CONTRACT_QUERY,
      { id },
    );
    return data.employeeContract;
  } catch (error) {
    console.error('Failed to fetch employee contract:', error);
    return null;
  }
}

export async function fetchActiveEmployeeContractByTemplate(
  input: ActiveEmployeeContractByTemplateFilter,
): Promise<EmployeeContract | null> {
  try {
    const data = await gqlRequest<{ employeeContracts: PaginatedEmployeeContractResponse }>(
      GraphQLService.CORE_HR,
      GET_ACTIVE_EMPLOYEE_CONTRACT_BY_TEMPLATE_QUERY,
      {
        filter: {
          employeeId: input.employeeId,
          contractId: input.contractId,
          status: ContractStatus.active,
          page: 1,
          limit: 1,
        },
      },
    );
    return data.employeeContracts.data[0] ?? null;
  } catch (error) {
    console.error('Failed to fetch active employee contract by template:', error);
    return null;
  }
}

export async function assignEmployeeContract(
  input: AssignEmployeeContractInput,
): Promise<{ success: boolean; data?: EmployeeContract; error?: string }> {
  try {
    const data = await gqlRequest<{ assignEmployeeContract: EmployeeContract }>(
      GraphQLService.CORE_HR,
      ASSIGN_EMPLOYEE_CONTRACT_MUTATION,
      { input },
    );
    return { success: true, data: data.assignEmployeeContract };
  } catch (error: any) {
    console.error('Failed to assign employee contract:', error);
    return { success: false, error: error.message || 'Failed to assign contract' };
  }
}

export async function updateDraftEmployeeContract(
  id: string,
  input: UpdateDraftEmployeeContractInput,
): Promise<{ success: boolean; data?: EmployeeContract; error?: string }> {
  try {
    const data = await gqlRequest<{ updateDraftEmployeeContract: EmployeeContract }>(
      GraphQLService.CORE_HR,
      UPDATE_DRAFT_EMPLOYEE_CONTRACT_MUTATION,
      { id, input },
    );
    return { success: true, data: data.updateDraftEmployeeContract };
  } catch (error: any) {
    console.error('Failed to update draft employee contract:', error);
    return { success: false, error: error.message || 'Failed to update contract' };
  }
}

export async function renewEmployeeContract(
  id: string,
  input: RenewEmployeeContractInput,
): Promise<{ success: boolean; data?: EmployeeContract; error?: string }> {
  try {
    const data = await gqlRequest<{ renewEmployeeContract: EmployeeContract }>(
      GraphQLService.CORE_HR,
      RENEW_EMPLOYEE_CONTRACT_MUTATION,
      { id, input },
    );
    return { success: true, data: data.renewEmployeeContract };
  } catch (error: any) {
    console.error('Failed to renew employee contract:', error);
    return { success: false, error: error.message || 'Failed to renew contract' };
  }
}

export async function activateMyEmployeeContract(
  id: string,
): Promise<{ success: boolean; data?: EmployeeContract; error?: string }> {
  try {
    const data = await gqlRequest<{ activateMyEmployeeContract: EmployeeContract }>(
      GraphQLService.CORE_HR,
      ACTIVATE_MY_EMPLOYEE_CONTRACT_MUTATION,
      { id },
    );
    return {
      success: true,
      data: toSerializable(data.activateMyEmployeeContract),
    };
  } catch (error: any) {
    console.error('Failed to activate my employee contract:', error);
    return { success: false, error: error.message || 'Failed to activate contract' };
  }
}

export async function rejectMyEmployeeContract(
  id: string,
): Promise<{ success: boolean; data?: EmployeeContract; error?: string }> {
  try {
    const data = await gqlRequest<{ rejectMyEmployeeContract: EmployeeContract }>(
      GraphQLService.CORE_HR,
      REJECT_MY_EMPLOYEE_CONTRACT_MUTATION,
      { id },
    );
    return {
      success: true,
      data: toSerializable(data.rejectMyEmployeeContract),
    };
  } catch (error: any) {
    console.error('Failed to reject my employee contract:', error);
    return { success: false, error: error.message || 'Failed to decline contract' };
  }
}

export async function activateEmployeeContract(
  id: string,
): Promise<{ success: boolean; data?: EmployeeContract; error?: string }> {
  try {
    const data = await gqlRequest<{ activateEmployeeContract: EmployeeContract }>(
      GraphQLService.CORE_HR,
      ACTIVATE_EMPLOYEE_CONTRACT_MUTATION,
      { id },
    );
    return {
      success: true,
      data: toSerializable(data.activateEmployeeContract),
    };
  } catch (error: any) {
    console.error('Failed to activate employee contract:', error);
    return { success: false, error: error.message || 'Failed to activate contract' };
  }
}

