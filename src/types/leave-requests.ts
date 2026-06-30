export type LeaveRequestDisplayStatus =
  | 'HR approved'
  | 'Manager approved'
  | 'Approved'
  | 'Pending'
  | 'Rejected'
  | 'Cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  requestType: string;
  leaveFrom: string;
  leaveTo: string;
  duration: string;
  appliedOn: string;
  reason?: string | null;
  status: LeaveRequestDisplayStatus;
}
