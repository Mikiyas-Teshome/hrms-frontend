export interface LeaveRequest {
    id: string;
    employeeName: string;
    requestType: string;
    leaveFrom: string;
    leaveTo: string;
    duration: string;
    reason?: string | null;
    status: 'Manager approved' | 'Approved' | 'Pending' | 'Rejected';
}

