'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  CREATE_LEAVE_TYPE_MUTATION,
  DELETE_LEAVE_TYPE_MUTATION,
  GET_LEAVE_TYPE_QUERY,
  GET_LEAVE_TYPES_QUERY,
  UPDATE_LEAVE_TYPE_MUTATION,
} from './leave-type.queries';
import {
  LeaveTypeResponse,
  CreateLeaveTypeInput,
  UpdateLeaveTypeInput,
} from './leave-type.types';
import { revalidatePath } from 'next/cache';

export async function fetchLeaveTypes(companyOuId: string): Promise<LeaveTypeResponse[]> {
  try {
    const data = await gqlRequest<{ leaveTypes: LeaveTypeResponse[] }>(
      GraphQLService.LEAVE,
      GET_LEAVE_TYPES_QUERY,
      { companyOuId }
    );
    return data.leaveTypes;
  } catch (error) {
    console.error('Failed to fetch leave types:', error);
    throw error;
  }
}

export async function fetchLeaveType(id: string): Promise<LeaveTypeResponse | null> {
  try {
    const data = await gqlRequest<{ leaveType: LeaveTypeResponse }>(
      GraphQLService.LEAVE,
      GET_LEAVE_TYPE_QUERY,
      { id }
    );
    return data.leaveType;
  } catch (error) {
    console.error(`Failed to fetch leave type ${id}:`, error);
    return null;
  }
}

export async function createLeaveType(input: CreateLeaveTypeInput): Promise<ActionResult<LeaveTypeResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createLeaveType: LeaveTypeResponse }>(
      GraphQLService.LEAVE,
      CREATE_LEAVE_TYPE_MUTATION,
      { input }
    );
    return data.createLeaveType;
  });
}

export async function updateLeaveType(id: string, input: UpdateLeaveTypeInput): Promise<ActionResult<LeaveTypeResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateLeaveType: LeaveTypeResponse }>(
      GraphQLService.LEAVE,
      UPDATE_LEAVE_TYPE_MUTATION,
      { id, input }
    );
    return data.updateLeaveType;
  });
}

export async function deleteLeaveType(id: string): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deleteLeaveType: boolean }>(
      GraphQLService.LEAVE,
      DELETE_LEAVE_TYPE_MUTATION,
      { id }
    );
    revalidatePath('/dashboard/leave');
    return data.deleteLeaveType;
  });
}
