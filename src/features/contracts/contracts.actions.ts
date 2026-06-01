'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  GET_CONTRACTS_QUERY,
  GET_CONTRACT_QUERY,
  CREATE_CONTRACT_MUTATION,
  UPDATE_CONTRACT_MUTATION,
  REMOVE_CONTRACT_MUTATION,
} from './contracts.queries';
import {
  Contract,
  CreateContractInput,
  UpdateContractInput,
  ContractFilterInput,
  PaginatedContractResponse,
} from './contracts.types';
import { revalidatePath } from 'next/cache';

export async function fetchContracts(filter: ContractFilterInput = {}): Promise<PaginatedContractResponse> {
  try {
    const data = await gqlRequest<{ contracts: PaginatedContractResponse }>(
      GraphQLService.CORE_HR,
      GET_CONTRACTS_QUERY,
      { filter }
    );
    return data.contracts;
  } catch (error) {
    console.error('Failed to fetch contracts:', error);
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

export async function fetchContract(id: string): Promise<Contract | null> {
  try {
    const data = await gqlRequest<{ contract: Contract | null }>(
      GraphQLService.CORE_HR,
      GET_CONTRACT_QUERY,
      { id }
    );
    return data.contract;
  } catch (error) {
    console.error('Failed to fetch contract:', error);
    return null;
  }
}

export async function createContract(input: CreateContractInput): Promise<ActionResult<Contract>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createContract: Contract }>(
      GraphQLService.CORE_HR,
      CREATE_CONTRACT_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/employees/contracts');
    return data.createContract;
  });
}

export async function updateContract(id: string, input: UpdateContractInput): Promise<ActionResult<Contract>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateContract: Contract }>(
      GraphQLService.CORE_HR,
      UPDATE_CONTRACT_MUTATION,
      { id, input }
    );
    revalidatePath('/dashboard/employees/contracts');
    return data.updateContract;
  });
}

export async function deleteContract(id: string): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ removeContract: { id: string } }>(
      GraphQLService.CORE_HR,
      REMOVE_CONTRACT_MUTATION,
      { id }
    );
    revalidatePath('/dashboard/employees/contracts');
    return data.removeContract;
  });
}
