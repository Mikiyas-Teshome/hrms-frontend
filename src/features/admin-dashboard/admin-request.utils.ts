import { format, subDays } from 'date-fns';
import type { AttendanceRecord } from '@/features/attendance/attendance.types';
import type { LeaveRequestFilterInput, LeaveRequestListItem } from '@/features/leave-request/leave-request.types';
import { mapDisplayStatusToApiStatus, mapListItemToLeaveRequest } from '@/components/dashboard/leave-requests/leave-request.util';
import type {
  AdminRequestRow,
  AdminRequestStatusType,
  AdminRequestTab,
} from './admin-request.types';

export const DASHBOARD_REQUESTS_LIMIT = 6;
export const ADMIN_REQUESTS_FETCH_SIZE = 15;

export function adminRequestsDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = subDays(end, 30);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export function leaveFilterForTab(tab: AdminRequestTab): LeaveRequestFilterInput | undefined {
  if (tab === 'all') {
    return undefined;
  }
  if (tab === 'pending') {
    return { status: mapDisplayStatusToApiStatus('Pending') };
  }
  if (tab === 'approved') {
    return { status: mapDisplayStatusToApiStatus('Approved') };
  }
  if (tab === 'denied') {
    return { status: mapDisplayStatusToApiStatus('Rejected') };
  }
  return undefined;
}

export function overtimeStatusForTab(tab: AdminRequestTab): string | undefined {
  if (tab === 'pending') {
    return 'PENDING';
  }
  if (tab === 'approved') {
    return 'APPROVED';
  }
  if (tab === 'denied') {
    return 'REJECTED';
  }
  return undefined;
}

function leaveStatusType(displayStatus: string): AdminRequestStatusType {
  const normalized = displayStatus.toLowerCase();
  if (normalized.includes('manager approved')) {
    return 'approved-manager';
  }
  if (normalized === 'approved' || normalized.includes('hr approved')) {
    return 'approved';
  }
  if (normalized === 'pending') {
    return 'pending';
  }
  if (normalized === 'rejected' || normalized === 'cancelled') {
    return 'rejected';
  }
  return 'neutral';
}

function overtimeStatusType(status?: string | null): AdminRequestStatusType {
  const normalized = (status ?? 'PENDING').toUpperCase();
  if (normalized === 'APPROVED' || normalized === 'PAID') {
    return 'approved';
  }
  if (normalized === 'REJECTED') {
    return 'rejected';
  }
  if (normalized === 'PENDING' || normalized === 'SUBMITTED') {
    return 'pending';
  }
  return 'neutral';
}

export function mapLeaveItemToAdminRow(
  item: LeaveRequestListItem,
  locale?: string,
): AdminRequestRow {
  const leaveRequest = mapListItemToLeaveRequest(item, locale);
  return {
    id: `leave-${item.id}`,
    kind: 'leave',
    employeeName: item.employeeName,
    dateLabel: format(new Date(item.startDate), 'MMM dd'),
    statusLabel: item.displayStatus,
    statusType: leaveStatusType(item.displayStatus),
    sortAt: item.createdAt,
    leaveRequest,
  };
}

export function mapOvertimeRecordToAdminRow(record: AttendanceRecord): AdminRequestRow {
  const statusRaw = (record.overtimeStatus ?? 'PENDING').toUpperCase();
  return {
    id: `overtime-${record.id}`,
    kind: 'overtime',
    employeeName: record.employeeName ?? '—',
    dateLabel: format(new Date(record.date), 'MMM dd'),
    statusLabel: statusRaw.charAt(0) + statusRaw.slice(1).toLowerCase(),
    statusType: overtimeStatusType(record.overtimeStatus),
    sortAt: record.createdAt ?? record.date,
    overtimeRecordId: record.id,
  };
}

export function mergeAdminRequestRows(
  leaveRows: AdminRequestRow[],
  overtimeRows: AdminRequestRow[],
  limit = DASHBOARD_REQUESTS_LIMIT,
): AdminRequestRow[] {
  return [...leaveRows, ...overtimeRows]
    .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
    .slice(0, limit);
}
