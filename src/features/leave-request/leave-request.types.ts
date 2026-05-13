export interface LeaveRequestResponse {
    id: string;
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason?: string | null;
    status: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeaveRequestInput {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason?: string;
}
