export enum OvertimeType {
    FIXED_RATE = 'FIXED_RATE',
    MULTIPLIER = 'MULTIPLIER'
}

export interface OvertimePolicyResponse {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    rateValue: number;
    type: OvertimeType;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOvertimePolicyInput {
    companyId?: string;
    name: string;
    description?: string;
    rateValue: number;
    type: OvertimeType;
}

export interface UpdateOvertimePolicyInput {
    name?: string;
    description?: string;
    rateValue?: number;
    type?: OvertimeType;
}
