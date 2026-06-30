export enum InsuranceCoverageType {
    HEALTH = 'HEALTH',
    DENTAL = 'DENTAL',
    VISION = 'VISION',
    LIFE = 'LIFE',
    OTHER = 'OTHER'
}

export enum InsuranceAssignment {
    ALL_EMPLOYEES = 'ALL_EMPLOYEES',
    INDIVIDUAL = 'INDIVIDUAL',
    DEPARTMENT_BASED = 'DEPARTMENT_BASED',
    ROLE_BASED = 'ROLE_BASED'
}

export enum InsuranceRenewalType {
    YEARLY = 'YEARLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY'
}

export enum InsuranceIncludedService {
    HOSPITALIZATION = 'HOSPITALIZATION',
    OUTPATIENT = 'OUTPATIENT',
    DENTAL = 'DENTAL',
    VISION = 'VISION'
}

export enum DependentRelationship {
    SPOUSE = 'SPOUSE',
    CHILD = 'CHILD',
    PARENT = 'PARENT',
    OTHER = 'OTHER'
}

export enum EmploymentType {
    full_time = 'full_time',
    part_time = 'part_time',
    contract = 'contract',
    intern = 'intern',
    consultant = 'consultant',
}

export enum EntitlementType {
    BONUS = 'BONUS',
    ALLOWANCE = 'ALLOWANCE',
    STIPEND = 'STIPEND',
    EQUITY = 'EQUITY'
}

export enum EntitlementValueDefinition {
    FIXED_AMOUNT = 'FIXED_AMOUNT',
    PERCENTAGE = 'PERCENTAGE',
    FORMULA = 'FORMULA'
}

export enum EntitlementAccessBasis {
    ROLE = 'ROLE',
    LEVEL = 'LEVEL',
    TENURE = 'TENURE',
    PERFORMANCE = 'PERFORMANCE'
}

export interface Insurance {
    id: string;
    employeeId?: string;
    ouId: string;
    dependentId?: string;
    insuranceName: string;
    providerName: string;
    policyNumber: string;
    cardId?: string;
    coverageType: InsuranceCoverageType;
    coverageAmount?: number;
    assignment: InsuranceAssignment;
    renewalType: InsuranceRenewalType;
    hasDependentsCoverage: boolean;
    maxDependents?: number;
    allowedDependents: DependentRelationship[];
    includedServices: InsuranceIncludedService[];
    employmentType?: EmploymentType;
    minTenureMonths?: number;
    employerContribution: number;
    employeeContribution: number;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInsuranceInput {
    employeeId?: string;
    ouId: string;
    dependentId?: string;
    insuranceName: string;
    providerName: string;
    policyNumber: string;
    cardId?: string;
    coverageType?: InsuranceCoverageType;
    coverageAmount?: number;
    assignment?: InsuranceAssignment;
    renewalType?: InsuranceRenewalType;
    hasDependentsCoverage?: boolean;
    maxDependents?: number;
    allowedDependents?: DependentRelationship[];
    includedServices?: InsuranceIncludedService[];
    employmentType?: EmploymentType;
    minTenureMonths?: number;
    employerContribution?: number;
    employeeContribution?: number;
    startDate: string;
    endDate: string;
    status?: string;
}

export interface UpdateInsuranceInput {
    employeeId?: string;
    ouId?: string;
    insuranceName?: string;
    providerName?: string;
    policyNumber?: string;
    cardId?: string;
    coverageType?: InsuranceCoverageType;
    coverageAmount?: number;
    assignment?: InsuranceAssignment;
    renewalType?: InsuranceRenewalType;
    hasDependentsCoverage?: boolean;
    maxDependents?: number;
    allowedDependents?: DependentRelationship[];
    includedServices?: InsuranceIncludedService[];
    employmentType?: EmploymentType;
    minTenureMonths?: number;
    employerContribution?: number;
    employeeContribution?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
}

export interface UpdateInsuranceStatusInput {
    status: string;
}

export interface InsuranceFilterInput {
    employeeId?: string;
    ouId?: string;
    status?: string;
    coverageType?: InsuranceCoverageType;
    assignment?: InsuranceAssignment;
    providerName?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'insuranceName' | 'providerName' | 'coverageType' | 'assignment' | 'status' | 'startDate';
    sortOrder?: 'ASC' | 'DESC';
}

export interface InsurancePaginationMeta {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
}

export interface PaginatedInsuranceResponse {
    data: Insurance[];
    pagination: InsurancePaginationMeta;
}

export interface InsuranceStats {
    totalPlans: number;
    activePlans: number;
    providerCount: number;
    monthlySpending: number;
}
