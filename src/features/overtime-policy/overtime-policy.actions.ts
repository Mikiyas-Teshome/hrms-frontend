'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  GET_OVERTIME_POLICIES_QUERY,
  GET_OVERTIME_POLICY_QUERY,
  CREATE_OVERTIME_POLICY_MUTATION,
  UPDATE_OVERTIME_POLICY_MUTATION,
  DELETE_OVERTIME_POLICY_MUTATION,
} from './overtime-policy.queries';
import {
  OvertimePolicyResponse,
  CreateOvertimePolicyInput,
  UpdateOvertimePolicyInput,
} from './overtime-policy.types';
import { revalidatePath } from 'next/cache';

export async function fetchOvertimePolicies(companyId: string): Promise<OvertimePolicyResponse[]> {
  try {
    const data = await gqlRequest<{ overtimePolicies: OvertimePolicyResponse[] }>(
      GraphQLService.PAYROLL,
      GET_OVERTIME_POLICIES_QUERY,
      { companyId }
    );
    return data.overtimePolicies;
  } catch (error) {
    console.error('Failed to fetch overtime policies:', error);
    return [];
  }
}

export async function fetchOvertimePolicy(id: string): Promise<OvertimePolicyResponse | null> {
  try {
    const data = await gqlRequest<{ overtimePolicy: OvertimePolicyResponse }>(
      GraphQLService.PAYROLL,
      GET_OVERTIME_POLICY_QUERY,
      { id }
    );
    return data.overtimePolicy;
  } catch (error) {
    console.error(`Failed to fetch overtime policy ${id}:`, error);
    return null;
  }
}

export async function createOvertimePolicy(
  input: CreateOvertimePolicyInput
): Promise<ActionResult<OvertimePolicyResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createOvertimePolicy: OvertimePolicyResponse }>(
      GraphQLService.PAYROLL,
      CREATE_OVERTIME_POLICY_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.createOvertimePolicy;
  });
}

export async function updateOvertimePolicy(
  id: string,
  input: UpdateOvertimePolicyInput
): Promise<ActionResult<OvertimePolicyResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateOvertimePolicy: OvertimePolicyResponse }>(
      GraphQLService.PAYROLL,
      UPDATE_OVERTIME_POLICY_MUTATION,
      { id, input }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.updateOvertimePolicy;
  });
}

export async function deleteOvertimePolicy(id: string): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deleteOvertimePolicy: boolean }>(
      GraphQLService.PAYROLL,
      DELETE_OVERTIME_POLICY_MUTATION,
      { id }
    );
    revalidatePath('/dashboard/payroll/settings');
    return data.deleteOvertimePolicy;
  });
}

export async function createOvertimePoliciesBatch(
  inputs: CreateOvertimePolicyInput[]
): Promise<ActionResult<OvertimePolicyResponse[]>> {
  return safeAction(async () => {
    const results: OvertimePolicyResponse[] = [];
    
    for (const [index, input] of inputs.entries()) {
      const data = await gqlRequest<{ createOvertimePolicy: OvertimePolicyResponse }>(
        GraphQLService.PAYROLL,
        CREATE_OVERTIME_POLICY_MUTATION,
        { input }
      );
      results.push(data.createOvertimePolicy);
    }
    
    revalidatePath('/dashboard/payroll/settings');
    return JSON.parse(JSON.stringify(results));
  });
}
