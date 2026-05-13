'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  CREATE_LEAVE_POLICY_MUTATION,
  DELETE_LEAVE_POLICY_MUTATION,
  GET_LEAVE_POLICIES_QUERY,
  GET_LEAVE_POLICY_QUERY,
} from './leave-policy.queries';
import {
  LeavePolicyResponse,
  CreateLeavePolicyInput,
} from './leave-policy.types';
import { revalidatePath } from 'next/cache';

export async function fetchLeavePolicies(): Promise<LeavePolicyResponse[]> {
  try {
    const data = await gqlRequest<{ leavePolicies: LeavePolicyResponse[] }>(
      GraphQLService.LEAVE,
      GET_LEAVE_POLICIES_QUERY,
      {}
    );
    return data.leavePolicies;
  } catch (error) {
    console.error('Failed to fetch leave policies:', error);
    throw error;
  }
}

export async function fetchLeavePolicy(id: string): Promise<LeavePolicyResponse | null> {
  try {
    const data = await gqlRequest<{ leavePolicy: LeavePolicyResponse }>(
      GraphQLService.LEAVE,
      GET_LEAVE_POLICY_QUERY,
      { id }
    );
    return data.leavePolicy;
  } catch (error) {
    console.error(`Failed to fetch leave policy ${id}:`, error);
    return null;
  }
}

export async function createLeavePolicy(input: CreateLeavePolicyInput): Promise<LeavePolicyResponse> {
  const data = await gqlRequest<{ createLeavePolicy: LeavePolicyResponse }>(
    GraphQLService.LEAVE,
    CREATE_LEAVE_POLICY_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/leave'); // Broad cache invalidation for leave sections
  return data.createLeavePolicy;
}

export async function deleteLeavePolicy(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteLeavePolicy: boolean }>(
    GraphQLService.LEAVE,
    DELETE_LEAVE_POLICY_MUTATION,
    { id }
  );
  revalidatePath('/dashboard/leave');
  return data.deleteLeavePolicy;
}
