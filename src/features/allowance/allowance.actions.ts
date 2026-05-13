'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  GET_ALLOWANCES_QUERY,
  CREATE_ALLOWANCE_MUTATION,
  DELETE_ALLOWANCE_MUTATION,
} from './allowance.queries';
import { AllowanceResponse, CreateAllowanceInput } from './allowance.types';
import { revalidatePath } from 'next/cache';

export async function fetchAllowances(companyId: string): Promise<AllowanceResponse[]> {
  try {
    const data = await gqlRequest<{ allowances: AllowanceResponse[] }>(
      GraphQLService.PAYROLL,
      GET_ALLOWANCES_QUERY,
      { companyId }
    );
    return data.allowances;
  } catch (error) {
    console.error('Failed to fetch allowances:', error);
    return [];
  }
}

export async function createAllowance(input: CreateAllowanceInput): Promise<AllowanceResponse> {
  const data = await gqlRequest<{ createAllowance: AllowanceResponse }>(
    GraphQLService.PAYROLL,
    CREATE_ALLOWANCE_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/payroll');
  return data.createAllowance;
}

export async function deleteAllowance(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteAllowance: boolean }>(
    GraphQLService.PAYROLL,
    DELETE_ALLOWANCE_MUTATION,
    { id }
  );
  revalidatePath('/dashboard/payroll');
  return data.deleteAllowance;
}
