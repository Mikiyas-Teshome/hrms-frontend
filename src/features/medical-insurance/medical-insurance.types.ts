export interface MedicalInsurance {
    id: string;
    employeeId: string;
    dependentId?: string | null;
    providerName: string;
    policyNumber: string;
    planType?: string | null;
    cardId?: string | null;
    coverageAmount?: number | null;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMedicalInsuranceInput {
    employeeId: string;
    dependentId?: string;
    providerName: string;
    policyNumber: string;
    planType?: string;
    cardId?: string;
    coverageAmount?: number;
    startDate: string;
    endDate: string;
    status?: string;
}

export interface UpdateMedicalInsuranceInput {
    providerName?: string;
    policyNumber?: string;
    planType?: string;
    cardId?: string;
    coverageAmount?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
}
