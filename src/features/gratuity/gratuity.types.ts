export enum ContractType {
    LIMITED = 'LIMITED',
    UNLIMITED = 'UNLIMITED'
}

export enum GratuityReason {
    RESIGNATION = 'RESIGNATION',
    TERMINATION = 'TERMINATION',
    RETIREMENT = 'RETIREMENT',
    DEATH = 'DEATH'
}

export interface GratuityCalculation {
    id: string;
    companyId: string;
    employeeId: string;
    contractType: ContractType;
    reason: GratuityReason;
    lastBasicSalary: number;
    totalDaysWorked: number;
    totalYearsWorked: number;
    gratuityAmount: number;
    createdAt: string;
}

export interface EosResult {
    employeeId: string;
    currency: string;
    gratuity: number;
    serviceYears: number;
}

export interface CalculateGratuityInput {
    employeeId: string;
    contractType: ContractType;
    reason: GratuityReason;
    lastBasicSalary: number;
    endDate: string;
}

export interface CalculateEosInput {
    employeeId: string;
    lastBasicSalary: number;
    endDate: string;
}
