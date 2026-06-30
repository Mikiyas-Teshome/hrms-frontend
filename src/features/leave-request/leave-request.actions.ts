'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { getDocumentAssetUploadApiUrl } from '@/features/documents/document-api-url';
import {
  CREATE_LEAVE_REQUEST_MUTATION,
  CANCEL_LEAVE_REQUEST_MUTATION,
  GET_LEAVE_REQUEST_QUERY,
  GET_LEAVE_REQUESTS_BY_COMPANY_QUERY,
  GET_LEAVE_REQUESTS_BY_EMPLOYEE_QUERY,
  LEAVE_REQUEST_STATS_QUERY,
  LEAVE_REQUESTS_PAGINATED_QUERY,
  LEAVE_REQUEST_REVIEW_QUERY,
  REQUEST_LEAVE_AMENDMENT_MUTATION,
  RESPOND_LEAVE_AMENDMENT_MUTATION,
} from './leave-request.queries';
import {
  LeaveRequestResponse,
  LeaveRequestListItem,
  LeaveRequestStats,
  LeaveRequestConnection,
  LeaveRequestFilterInput,
  LeaveRequestPaginationInput,
  CreateLeaveRequestInput,
  LeaveRequestReview,
  RequestLeaveAmendmentInput,
  LeaveRequestAmendment,
  RespondLeaveAmendmentInput,
} from './leave-request.types';
import { revalidatePath } from 'next/cache';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { cookies } from 'next/headers';

export async function fetchLeaveRequestStats(companyOuId: string): Promise<LeaveRequestStats> {
  const data = await gqlRequest<{ leaveRequestStats: LeaveRequestStats }>(
    GraphQLService.LEAVE,
    LEAVE_REQUEST_STATS_QUERY,
    { companyOuId },
  );
  return data.leaveRequestStats;
}

export async function fetchLeaveRequestsPaginated(
  companyOuId: string,
  filter?: LeaveRequestFilterInput,
  pagination?: LeaveRequestPaginationInput,
): Promise<LeaveRequestConnection> {
  const data = await gqlRequest<{ leaveRequestsPaginated: LeaveRequestConnection }>(
    GraphQLService.LEAVE,
    LEAVE_REQUESTS_PAGINATED_QUERY,
    { companyOuId, filter, pagination },
  );
  return data.leaveRequestsPaginated;
}

export async function fetchLeaveRequestsByCompany(): Promise<LeaveRequestResponse[]> {
  const data = await gqlRequest<{ leaveRequestsByCompany: LeaveRequestResponse[] }>(
    GraphQLService.LEAVE,
    GET_LEAVE_REQUESTS_BY_COMPANY_QUERY,
    {},
  );
  return data.leaveRequestsByCompany;
}

export async function fetchLeaveRequestsByEmployee(
  employeeId: string,
): Promise<LeaveRequestListItem[]> {
  const data = await gqlRequest<{ leaveRequestsByEmployee: LeaveRequestListItem[] }>(
    GraphQLService.LEAVE,
    GET_LEAVE_REQUESTS_BY_EMPLOYEE_QUERY,
    { employeeId },
  );
  return data.leaveRequestsByEmployee;
}

export async function fetchLeaveRequestReview(id: string): Promise<LeaveRequestReview> {
  const data = await gqlRequest<{ leaveRequestReview: LeaveRequestReview }>(
    GraphQLService.LEAVE,
    LEAVE_REQUEST_REVIEW_QUERY,
    { id },
  );
  return data.leaveRequestReview;
}

export async function fetchLeaveRequest(id: string): Promise<LeaveRequestResponse | null> {
  try {
    const data = await gqlRequest<{ leaveRequest: LeaveRequestResponse }>(
      GraphQLService.LEAVE,
      GET_LEAVE_REQUEST_QUERY,
      { id },
    );
    return data.leaveRequest;
  } catch {
    return null;
  }
}

export async function createLeaveRequest(
  input: CreateLeaveRequestInput,
): Promise<ActionResult<LeaveRequestResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createLeaveRequest: LeaveRequestResponse }>(
      GraphQLService.LEAVE,
      CREATE_LEAVE_REQUEST_MUTATION,
      { input },
    );
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/leave/leave-requests');
    return data.createLeaveRequest;
  });
}

export async function cancelLeaveRequest(id: string): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ cancelLeaveRequest: boolean }>(
      GraphQLService.LEAVE,
      CANCEL_LEAVE_REQUEST_MUTATION,
      { id },
    );
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/leave/leave-requests');
    return data.cancelLeaveRequest;
  });
}

export async function requestLeaveAmendment(
  input: RequestLeaveAmendmentInput,
): Promise<ActionResult<LeaveRequestAmendment>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ requestLeaveAmendment: LeaveRequestAmendment }>(
      GraphQLService.LEAVE,
      REQUEST_LEAVE_AMENDMENT_MUTATION,
      { input },
    );
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/leave/leave-requests');
    return data.requestLeaveAmendment;
  });
}

export async function respondLeaveAmendment(
  input: RespondLeaveAmendmentInput,
): Promise<ActionResult<LeaveRequestAmendment>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ respondLeaveAmendment: LeaveRequestAmendment }>(
      GraphQLService.LEAVE,
      RESPOND_LEAVE_AMENDMENT_MUTATION,
      { input },
    );
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/leave/leave-requests');
    return data.respondLeaveAmendment;
  });
}

export async function uploadLeaveAttachment(file: File): Promise<ActionResult<{
  fileName: string;
  fileUrl: string;
  storageKey?: string;
  mimeType?: string;
  size?: number;
}>> {
  return safeAction(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('hrms.accessToken')?.value;
    if (!token) {
      throw new Error('Not authenticated. Please log in.');
    }
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(getDocumentAssetUploadApiUrl(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Upload failed with status ${response.status}`);
    }
    const payload = (await response.json()) as {
      url?: string;
      key?: string;
      mimeType?: string;
      size?: number;
    };
    if (!payload.url) {
      throw new Error('Attachment upload succeeded but URL was missing.');
    }
    return {
      fileName: file.name,
      fileUrl: payload.url,
      storageKey: payload.key,
      mimeType: payload.mimeType ?? file.type,
      size: payload.size ?? file.size,
    };
  });
}
