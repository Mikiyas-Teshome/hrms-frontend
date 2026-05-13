export interface AllowanceResponse {
    __typename?: 'AllowanceResponse';
    id: string;
    companyId: string;
    name: string;
    description?: string;
    type: string;
    value: number;
    taxable: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAllowanceInput {
    name: string;
    description?: string;
    type: string;
    value: number;
    taxable?: boolean;
}
