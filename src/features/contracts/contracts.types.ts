import { Insurance } from '../insurance/insurance.types';
import { BenefitEntitlement } from '../entitlements/entitlements.types';

export enum EmploymentContractType {
    permanent = 'permanent',
    fixed_term = 'fixed_term',
    probation = 'probation',
    internship = 'internship',
    consultant = 'consultant',
    part_time = 'part_time',
}

export enum ContractStatus {
    draft = 'draft',
    active = 'active',
    expired = 'expired',
    terminated = 'terminated',
    renewed = 'renewed',
}

export enum EmploymentType {
    full_time = 'full_time',
    part_time = 'part_time',
    contract = 'contract',
    intern = 'intern',
    consultant = 'consultant',
}

export interface Contract {
    id: string;
    ouId: string;
    contractNumber: string;
    contractName?: string;
    description?: string;
    contractType: EmploymentContractType;
    employmentType?: EmploymentType;
    status: ContractStatus;
    durationMonths?: number;
    isRenewable: boolean;
    probationPeriodMonths?: number;
    noticePeriodDays?: number;
    documentUrl?: string;
    createdBy?: string;
    insurances?: Insurance[];
    benefitEntitlements?: BenefitEntitlement[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateContractInput {
    contractNumber: string;
    contractName?: string;
    description?: string;
    contractType: EmploymentContractType;
    employmentType?: EmploymentType;
    status?: ContractStatus;
    durationMonths?: number;
    isRenewable?: boolean;
    probationPeriodMonths?: number;
    noticePeriodDays?: number;
    documentUrl?: string;
    insurances?: any[]; // We can map CreateInsuranceInput here
}

export interface UpdateContractInput {
    contractNumber?: string;
    contractName?: string;
    description?: string;
    contractType?: EmploymentContractType;
    employmentType?: EmploymentType;
    status?: ContractStatus;
    durationMonths?: number;
    isRenewable?: boolean;
    probationPeriodMonths?: number;
    noticePeriodDays?: number;
    documentUrl?: string;
}

export interface ContractFilterInput {
    search?: string;
    contractType?: EmploymentContractType;
    status?: ContractStatus;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'contractNumber' | 'contractName' | 'contractType' | 'status' | 'durationMonths';
    sortOrder?: 'ASC' | 'DESC';
}

export interface ContractPaginationMeta {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
}

export interface PaginatedContractResponse {
    data: Contract[];
    pagination: ContractPaginationMeta;
}
