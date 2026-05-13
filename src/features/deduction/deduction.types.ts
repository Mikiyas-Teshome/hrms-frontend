export interface DeductionResponse {
    __typename?: 'DeductionResponse';
    id: string;
    companyId: string;
    name: string;
    description?: string;
    type: string;
    value: number;
    recurring: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDeductionInput {
    name: string;
    description?: string;
    type: string;
    value: number;
    recurring: boolean;
}
