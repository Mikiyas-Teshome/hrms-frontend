'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  CREATE_LEAVE_REQUEST_MUTATION,
  CANCEL_LEAVE_REQUEST_MUTATION,
  GET_LEAVE_REQUEST_QUERY,
  GET_LEAVE_REQUESTS_BY_COMPANY_QUERY,
  GET_LEAVE_REQUESTS_BY_EMPLOYEE_QUERY,
} from './leave-request.queries';
import {
  LeaveRequestResponse,
  CreateLeaveRequestInput,
} from './leave-request.types';
import { revalidatePath } from 'next/cache';

export async function fetchLeaveRequestsByCompany(): Promise<LeaveRequestResponse[]> {
  try {
    const data = await gqlRequest<{ leaveRequestsByCompany: LeaveRequestResponse[] }>(
      GraphQLService.LEAVE,
      GET_LEAVE_REQUESTS_BY_COMPANY_QUERY,
      {}
    );
    return data.leaveRequestsByCompany;
  } catch (error) {
    console.error('Failed to fetch leave requests by company:', error);
    throw error;
  }
}

export async function fetchLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequestResponse[]> {
  try {
    const data = await gqlRequest<{ leaveRequestsByEmployee: LeaveRequestResponse[] }>(
      GraphQLService.LEAVE,
      GET_LEAVE_REQUESTS_BY_EMPLOYEE_QUERY,
      { employeeId }
    );
    return data.leaveRequestsByEmployee;
  } catch (error) {
    console.error(`Failed to fetch leave requests for employee ${employeeId}:`, error);
    throw error;
  }
}

export async function fetchLeaveRequest(id: string): Promise<LeaveRequestResponse | null> {
  try {
    const data = await gqlRequest<{ leaveRequest: LeaveRequestResponse }>(
      GraphQLService.LEAVE,
      GET_LEAVE_REQUEST_QUERY,
      { id }
    );
    return data.leaveRequest;
  } catch (error) {
    console.error(`Failed to fetch leave request ${id}:`, error);
    return null;
  }
}

export async function createLeaveRequest(input: CreateLeaveRequestInput): Promise<LeaveRequestResponse> {
  const data = await gqlRequest<{ createLeaveRequest: LeaveRequestResponse }>(
    GraphQLService.LEAVE,
    CREATE_LEAVE_REQUEST_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/leave/leave-requests');
  return data.createLeaveRequest;
}

export async function cancelLeaveRequest(id: string): Promise<boolean> {
  const data = await gqlRequest<{ cancelLeaveRequest: boolean }>(
    GraphQLService.LEAVE,
    CANCEL_LEAVE_REQUEST_MUTATION,
    { id }
  );
  revalidatePath('/dashboard/leave/leave-requests');
  return data.cancelLeaveRequest;
}
