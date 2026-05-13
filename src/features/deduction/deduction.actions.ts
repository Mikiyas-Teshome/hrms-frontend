'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  GET_DEDUCTIONS_QUERY,
  CREATE_DEDUCTION_MUTATION,
  DELETE_DEDUCTION_MUTATION,
} from './deduction.queries';
import { DeductionResponse, CreateDeductionInput } from './deduction.types';
import { revalidatePath } from 'next/cache';

export async function fetchDeductions(companyId: string): Promise<DeductionResponse[]> {
  try {
    const data = await gqlRequest<{ deductions: DeductionResponse[] }>(
      GraphQLService.PAYROLL,
      GET_DEDUCTIONS_QUERY,
      { companyId }
    );
    return data.deductions;
  } catch (error) {
    console.error('Failed to fetch deductions:', error);
    return [];
  }
}

export async function createDeduction(input: CreateDeductionInput): Promise<DeductionResponse> {
  const data = await gqlRequest<{ createDeduction: DeductionResponse }>(
    GraphQLService.PAYROLL,
    CREATE_DEDUCTION_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/payroll');
  return data.createDeduction;
}

export async function deleteDeduction(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteDeduction: boolean }>(
    GraphQLService.PAYROLL,
    DELETE_DEDUCTION_MUTATION,
    { id }
  );
  revalidatePath('/dashboard/payroll');
  return data.deleteDeduction;
}
