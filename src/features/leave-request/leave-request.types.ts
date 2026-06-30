export interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  leavePolicyId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string | null;
  status: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  attachments: LeaveRequestAttachment[];
  amendments: LeaveRequestAmendment[];
}

export interface LeaveRequestAttachment {
  id: string;
  requestId: string;
  fileName: string;
  fileUrl: string;
  storageKey?: string | null;
  mimeType?: string | null;
  size?: number | null;
  uploadedById?: string | null;
  createdAt: string;
}

export interface LeaveRequestAmendment {
  id: string;
  requestId: string;
  proposedStart: string;
  proposedEnd: string;
  comment: string;
  status: string;
  createdById: string;
  acceptedByEmployeeAt?: string | null;
  rejectedByEmployeeAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestListItem {
  id: string;
  employeeId: string;
  employeeName: string;
  leavePolicyId: string;
  leavePolicyName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  displayStatus: string;
  reason?: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  hasPendingAmendment: boolean;
  pendingAmendmentId?: string | null;
  pendingAmendmentProposedStart?: string | null;
  pendingAmendmentProposedEnd?: string | null;
  pendingAmendmentComment?: string | null;
}

export interface LeaveRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface LeaveRequestFilterInput {
  search?: string;
  status?: string;
  leavePolicyId?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface LeaveRequestPaginationInput {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface LeaveRequestConnection {
  items: LeaveRequestListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateLeaveRequestInput {
  employeeId: string;
  leavePolicyId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    storageKey?: string;
    mimeType?: string;
    size?: number;
  }[];
}

export interface RequestLeaveAmendmentInput {
  requestId: string;
  proposedStart: string;
  proposedEnd: string;
  comment: string;
}

export interface RespondLeaveAmendmentInput {
  amendmentId: string;
  decision: 'accepted' | 'rejected';
}

export interface LeaveBalanceSnapshot {
  allocatedDays: number;
  usedDays: number;
  carriedForwardDays: number;
  remainingDays: number;
}

export interface LeaveRequestReviewApproval {
  id: string;
  requestId: string;
  approverRole: string;
  status: string;
  approverId?: string | null;
  remarks?: string | null;
  actedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestReview {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeJobTitle?: string | null;
  employeeDepartment?: string | null;
  companyId: string;
  leavePolicyId: string;
  leavePolicyName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  displayStatus: string;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
  approvals: LeaveRequestReviewApproval[];
  leaveBalanceSnapshot?: LeaveBalanceSnapshot | null;
  canApprove: boolean;
  canCurrentUserApprove: boolean;
  attachments: LeaveRequestAttachment[];
  amendments: LeaveRequestAmendment[];
}
