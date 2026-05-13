export const VALID_LEAVE_CODES = ["annual", "sick", "unpaid", "maternity", "custom"] as const;
export type LeaveCode = typeof VALID_LEAVE_CODES[number];

export interface LeaveTypeResponse {
    id: string;
    code: string;
    name: string;
    paid: boolean;
    carryForwardAllowed: boolean;
    maxDaysPerYear: number;
    companyOuId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeaveTypeInput {
    code: string;
    name: string;
    companyOuId: string;
    paid?: boolean;
    carryForwardAllowed?: boolean;
    maxDaysPerYear?: number;
}

export interface UpdateLeaveTypeInput {
    code?: string;
    name?: string;
    companyOuId?: string;
    paid?: boolean;
    carryForwardAllowed?: boolean;
    maxDaysPerYear?: number;
}
