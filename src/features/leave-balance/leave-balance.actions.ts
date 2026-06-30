'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import {
  LEAVE_BALANCE_STATS_QUERY,
  LEAVE_BALANCES_PAGINATED_QUERY,
  LEAVE_BALANCE_DETAIL_QUERY,
  LEAVE_BALANCE_FILTER_OPTIONS_QUERY,
  UPDATE_LEAVE_BALANCE_MUTATION,
  DELETE_LEAVE_BALANCE_MUTATION,
} from './leave-balance.queries';
import {
  LeaveBalanceStats,
  LeaveBalanceConnection,
  LeaveBalanceDetail,
  LeaveBalanceFilterInput,
  LeaveBalancePaginationInput,
  LeaveBalanceFilterOptions,
  UpdateLeaveBalanceInput,
} from './leave-balance.types';

const EMPTY_STATS: LeaveBalanceStats = {
  employeeCount: 0,
  totalAllocatedDays: 0,
  totalRemainingDays: 0,
  totalCarriedForwardDays: 0,
};

export async function fetchLeaveBalanceStats(
  companyOuId: string,
  year?: number,
): Promise<LeaveBalanceStats> {
  try {
    const data = await gqlRequest<{ leaveBalanceStats: LeaveBalanceStats }>(
      GraphQLService.LEAVE,
      LEAVE_BALANCE_STATS_QUERY,
      { companyOuId, year: year ?? undefined },
    );
    return data.leaveBalanceStats;
  } catch (error) {
    console.error('Failed to fetch leave balance stats:', error);
    return EMPTY_STATS;
  }
}

export async function fetchLeaveBalancesPaginated(
  companyOuId: string,
  filter: LeaveBalanceFilterInput = {},
  pagination: LeaveBalancePaginationInput = {},
): Promise<LeaveBalanceConnection> {
  try {
    const data = await gqlRequest<{ leaveBalancesPaginated: LeaveBalanceConnection }>(
      GraphQLService.LEAVE,
      LEAVE_BALANCES_PAGINATED_QUERY,
      { companyOuId, filter, pagination },
    );
    return data.leaveBalancesPaginated;
  } catch (error) {
    console.error('Failed to fetch leave balances:', error);
    return {
      items: [],
      totalCount: 0,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
      totalPages: 0,
    };
  }
}

export async function fetchLeaveBalanceDetail(id: string): Promise<LeaveBalanceDetail | null> {
  try {
    const data = await gqlRequest<{ leaveBalance: LeaveBalanceDetail }>(
      GraphQLService.LEAVE,
      LEAVE_BALANCE_DETAIL_QUERY,
      { id },
    );
    return data.leaveBalance;
  } catch (error) {
    console.error(`Failed to fetch leave balance ${id}:`, error);
    return null;
  }
}

export async function fetchLeaveBalanceFilterOptions(
  companyOuId: string,
): Promise<LeaveBalanceFilterOptions> {
  try {
    const data = await gqlRequest<{ leaveBalanceFilterOptions: LeaveBalanceFilterOptions }>(
      GraphQLService.LEAVE,
      LEAVE_BALANCE_FILTER_OPTIONS_QUERY,
      { companyOuId },
    );
    return data.leaveBalanceFilterOptions;
  } catch (error) {
    console.error('Failed to fetch leave balance filter options:', error);
    return { years: [], policies: [], departments: [] };
  }
}

export async function updateLeaveBalance(
  id: string,
  input: UpdateLeaveBalanceInput,
): Promise<ActionResult<LeaveBalanceDetail>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateLeaveBalance: LeaveBalanceDetail }>(
      GraphQLService.LEAVE,
      UPDATE_LEAVE_BALANCE_MUTATION,
      { id, input },
    );
    revalidatePath('/dashboard/leave/balances');
    return data.updateLeaveBalance;
  });
}

export async function deleteLeaveBalance(id: string): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deleteLeaveBalance: boolean }>(
      GraphQLService.LEAVE,
      DELETE_LEAVE_BALANCE_MUTATION,
      { id },
    );
    revalidatePath('/dashboard/leave/balances');
    return data.deleteLeaveBalance;
  });
}
