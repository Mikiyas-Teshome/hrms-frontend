export enum LoanStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ACTIVE = 'ACTIVE',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}

export interface EmployeeLoan {
    id: string;
    companyId: string;
    employeeId: string;
    principalAmount: number;
    monthlyInstallment: number;
    remainingBalance: number;
    disbursementDate: string;
    status: LoanStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLoanInput {
    employeeId: string;
    principalAmount: number;
    monthlyInstallment: number;
    disbursementDate: string;
}

export interface UpdateLoanInput {
    principalAmount?: number;
    monthlyInstallment?: number;
    status?: LoanStatus;
}
