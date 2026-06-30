'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  CREATE_LEAVE_POLICY_MUTATION,
  DELETE_LEAVE_POLICY_MUTATION,
  LEAVE_POLICIES_PAGINATED_QUERY,
  LEAVE_POLICY_DETAIL_QUERY,
  LEAVE_POLICY_STATS_QUERY,
  UPDATE_LEAVE_POLICY_MUTATION,
  UPDATE_LEAVE_POLICY_STATUS_MUTATION,
} from './leave-policy.queries';
import {
  CreateLeavePolicyInput,
  CreateLeavePolicyPayload,
  LeavePolicyConnection,
  LeavePolicyDetail,
  LeavePolicyFilterInput,
  LeavePolicyPaginationInput,
  LeavePolicyStats,
  LeavePolicyListItem,
  LeavePolicyStatus,
  UpdateLeavePolicyInput,
} from './leave-policy.types';
import { revalidatePath } from 'next/cache';

export async function fetchLeavePolicyStats(companyOuId: string): Promise<LeavePolicyStats> {
  try {
    const data = await gqlRequest<{ leavePolicyStats: LeavePolicyStats }>(
      GraphQLService.LEAVE,
      LEAVE_POLICY_STATS_QUERY,
      { companyOuId },
    );
    return data.leavePolicyStats;
  } catch (error) {
    console.error('Failed to fetch leave policy stats:', error);
    return { total: 0, active: 0 };
  }
}

export async function fetchLeavePoliciesPaginated(
  companyOuId: string,
  filter?: LeavePolicyFilterInput,
  pagination?: LeavePolicyPaginationInput,
): Promise<LeavePolicyConnection> {
  try {
    const data = await gqlRequest<{ leavePoliciesPaginated: LeavePolicyConnection }>(
      GraphQLService.LEAVE,
      LEAVE_POLICIES_PAGINATED_QUERY,
      { companyOuId, filter: filter ?? null, pagination: pagination ?? null },
    );
    return data.leavePoliciesPaginated;
  } catch (error) {
    console.error('fetchLeavePoliciesPaginated full error:', JSON.stringify(error, null, 2));
    return { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 };
  }
}

export async function fetchLeavePolicyDetail(id: string): Promise<LeavePolicyDetail | null> {
  try {
    const data = await gqlRequest<{ leavePolicy: LeavePolicyDetail }>(
      GraphQLService.LEAVE,
      LEAVE_POLICY_DETAIL_QUERY,
      { id },
    );
    return data.leavePolicy;
  } catch (error) {
    console.error(`Failed to fetch leave policy ${id}:`, error);
    return null;
  }
}

export async function createLeavePolicy(
  input: CreateLeavePolicyInput,
): Promise<CreateLeavePolicyPayload> {
  const data = await gqlRequest<{ createLeavePolicy: CreateLeavePolicyPayload }>(
    GraphQLService.LEAVE,
    CREATE_LEAVE_POLICY_MUTATION,
    { input },
  );
  revalidatePath('/dashboard/leave/policies');
  return data.createLeavePolicy;
}

export async function updateLeavePolicy(
  id: string,
  input: UpdateLeavePolicyInput,
): Promise<LeavePolicyDetail> {
  const data = await gqlRequest<{ updateLeavePolicy: LeavePolicyDetail }>(
    GraphQLService.LEAVE,
    UPDATE_LEAVE_POLICY_MUTATION,
    { id, input },
  );
  revalidatePath('/dashboard/leave/policies');
  return data.updateLeavePolicy;
}

export async function updateLeavePolicyStatus(
  id: string,
  status: LeavePolicyStatus,
): Promise<LeavePolicyListItem> {
  const data = await gqlRequest<{ updateLeavePolicyStatus: LeavePolicyListItem }>(
    GraphQLService.LEAVE,
    UPDATE_LEAVE_POLICY_STATUS_MUTATION,
    { id, status },
  );
  revalidatePath('/dashboard/leave/policies');
  return data.updateLeavePolicyStatus;
}

export async function deleteLeavePolicy(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteLeavePolicy: boolean }>(
    GraphQLService.LEAVE,
    DELETE_LEAVE_POLICY_MUTATION,
    { id },
  );
  revalidatePath('/dashboard/leave/policies');
  return data.deleteLeavePolicy;
}
