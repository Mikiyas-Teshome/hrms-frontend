export type LeaveBalanceSortOrder = 'asc' | 'desc';

export interface LeaveBalanceStats {
  employeeCount: number;
  totalAllocatedDays: number;
  totalRemainingDays: number;
  totalCarriedForwardDays: number;
}

export interface LeaveBalanceListItem {
  id: string;
  employeeId: string;
  name: string;
  avatar?: string | null;
  leavePolicy: string;
  leavePolicyId: string;
  leavePolicyCode: string;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
  carriedForward: number;
}

export type LeaveBalanceDetail = LeaveBalanceListItem;

export interface LeaveBalanceConnection {
  items: LeaveBalanceListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LeaveBalanceFilterInput {
  search?: string;
  year?: number;
  leavePolicyId?: string;
  departmentId?: string;
  employeeId?: string;
  sortBy?: string;
  sortOrder?: LeaveBalanceSortOrder;
}

export interface LeaveBalancePaginationInput {
  page?: number;
  pageSize?: number;
}

export interface UpdateLeaveBalanceInput {
  allocatedDays: number;
  usedDays: number;
  carriedForwardDays: number;
  reason: string;
}

export interface LeaveBalancePolicyOption {
  id: string;
  name: string;
  code: string;
}

export interface LeaveBalanceDepartmentOption {
  id: string;
  name: string;
}

export interface LeaveBalanceFilterOptions {
  years: number[];
  policies: LeaveBalancePolicyOption[];
  departments: LeaveBalanceDepartmentOption[];
}

export type LeaveBalance = LeaveBalanceListItem;
