'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  ACT_ON_APPROVAL_MUTATION,
  GET_APPROVALS_BY_REQUEST_QUERY,
} from './approval.queries';
import {
  ApprovalResponse,
  ApprovalActInput,
} from './approval.types';
import { revalidatePath } from 'next/cache';

export async function fetchApprovalsByRequest(requestId: string): Promise<ApprovalResponse[]> {
  try {
    const data = await gqlRequest<{ approvalsByRequest: ApprovalResponse[] }>(
      GraphQLService.LEAVE,
      GET_APPROVALS_BY_REQUEST_QUERY,
      { requestId }
    );
    return data.approvalsByRequest;
  } catch (error) {
    console.error(`Failed to fetch approvals for request ${requestId}:`, error);
    return [];
  }
}

export async function actOnApproval(input: ApprovalActInput): Promise<ApprovalResponse> {
  const data = await gqlRequest<{ actOnApproval: ApprovalResponse }>(
    GraphQLService.LEAVE,
    ACT_ON_APPROVAL_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/manager-review'); 
  return data.actOnApproval;
}
