import { Contract, ContractStatus, EmploymentType } from './contracts.types';

export interface EmployeeContract {
  id: string;
  employeeId: string;
  contractId: string;
  effectiveDate?: string | null;
  endDate?: string | null;
  probationEndDate?: string | null;
  terminationDate?: string | null;
  terminationReason?: string | null;
  terminatedBy?: string | null;
  renewedFromId?: string | null;
  signedDate?: string | null;
  jobTitle?: string | null;
  employmentType?: EmploymentType | null;
  salary?: number | null;
  status: ContractStatus;
  contract?: Contract | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeContractFilterInput {
  employeeId?: string;
  contractId?: string;
  status?: ContractStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EmployeeContractPaginationMeta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface PaginatedEmployeeContractResponse {
  data: EmployeeContract[];
  pagination: EmployeeContractPaginationMeta;
}

export interface ActiveEmployeeContractByTemplateFilter {
  employeeId: string;
  contractId: string;
}

export interface AssignEmployeeContractInput {
  employeeId: string;
  contractId?: string;
  contractNumber?: string;
  effectiveDate?: string;
  endDate?: string;
  jobTitle?: string;
  employmentType?: string;
  salary?: number;
}

export interface UpdateDraftEmployeeContractInput {
  contractId?: string;
  effectiveDate?: string;
  endDate?: string;
  jobTitle?: string;
  employmentType?: string;
  salary?: number;
}

export interface RenewEmployeeContractInput {
  effectiveDate: string;
  contractId?: string;
  jobTitle?: string;
  employmentType?: string;
  salary?: number;
}
