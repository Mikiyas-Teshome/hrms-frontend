export interface LeavePolicyResponse {
    id: string;
    leaveTypeId: string;
    accrualMethod: string;
    accrualRate: number;
    maxBalance: number;
    probationRequired: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeavePolicyInput {
    leaveTypeId: string;
    accrualMethod: string;
    accrualRate: number;
    maxBalance: number;
    probationRequired?: boolean;
}
