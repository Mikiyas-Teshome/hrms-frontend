import { LeaveRequestListItem } from '@/features/leave-request/leave-request.types';
import { LeaveRequest, LeaveRequestDisplayStatus } from '@/types/leave-requests';

export function formatLeaveDuration(
  startDate: string,
  endDate: string,
  totalDays: number,
  locale?: string,
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  const dayLabel = totalDays === 1 ? 'day' : 'days';
  return `${fmt(start)} – ${fmt(end)} (${totalDays} ${dayLabel})`;
}

export function mapListItemToLeaveRequest(
  item: LeaveRequestListItem,
  locale?: string,
): LeaveRequest {
  return {
    id: item.id,
    employeeId: item.employeeId,
    employeeName: item.employeeName,
    requestType: item.leavePolicyName,
    leaveFrom: new Date(item.startDate).toLocaleDateString(locale),
    leaveTo: new Date(item.endDate).toLocaleDateString(locale),
    duration: formatLeaveDuration(item.startDate, item.endDate, item.totalDays, locale),
    appliedOn: new Date(item.createdAt).toLocaleDateString(locale),
    reason: item.reason,
    status: item.displayStatus as LeaveRequestDisplayStatus,
  };
}

export function mapDisplayStatusToApiStatus(
  displayStatus: string,
): string | undefined {
  switch (displayStatus) {
    case 'Pending':
      return 'pending';
    case 'HR approved':
      return 'pending';
    case 'Manager approved':
      return 'pending';
    case 'Approved':
      return 'approved';
    case 'Rejected':
      return 'rejected';
    case 'Cancelled':
      return 'cancelled';
    default:
      return undefined;
  }
}
