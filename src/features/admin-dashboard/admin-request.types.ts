import type { LeaveRequest } from '@/types/leave-requests';

export type AdminRequestKind = 'leave' | 'overtime';
export type AdminRequestTab = 'all' | 'pending' | 'approved' | 'denied';
export type AdminRequestStatusType =
  | 'approved'
  | 'approved-manager'
  | 'pending'
  | 'rejected'
  | 'neutral';

export interface AdminRequestRow {
  id: string;
  kind: AdminRequestKind;
  employeeName: string;
  dateLabel: string;
  statusLabel: string;
  statusType: AdminRequestStatusType;
  sortAt: string;
  leaveRequest?: LeaveRequest;
  overtimeRecordId?: string;
}
