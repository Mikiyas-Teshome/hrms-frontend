export interface ApprovalResponse {
    id: string;
    requestId: string;
    approverId?: string | null;
    approverRole: string;
    actedAt?: string | null;
    remarks?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApprovalActInput {
    requestId: string;
    approverId: string;
    approverRole: string;
    remarks?: string;
    status: string;
}
