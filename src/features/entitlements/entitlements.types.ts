export {
  EntitlementType,
  EntitlementValueDefinition,
  EntitlementAccessBasis,
  InsuranceRenewalType,
  InsuranceAssignment,
} from '@/features/insurance/insurance.types';

export interface BenefitEntitlement {
  id: string;
  employeeId?: string;
  companyOuId?: string;
  name: string;
  type: string;
  valueDefinition: string;
  frequency: string;
  accessBasedOn: string;
  assignment: string;
  amount?: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBenefitEntitlementInput {
  employeeId?: string;
  companyOuId?: string;
  name: string;
  type?: string;
  valueDefinition?: string;
  frequency?: string;
  accessBasedOn?: string;
  assignment?: string;
  amount?: number;
  currency?: string;
  status?: string;
}

export interface UpdateBenefitEntitlementInput {
  employeeId?: string;
  companyOuId?: string;
  name?: string;
  type?: string;
  valueDefinition?: string;
  frequency?: string;
  accessBasedOn?: string;
  assignment?: string;
  amount?: number;
  currency?: string;
  status?: string;
}

export interface UpdateBenefitEntitlementStatusInput {
  status: string;
}

export interface BenefitEntitlementFilterInput {
  employeeId?: string;
  companyOuId?: string;
  status?: string;
  type?: string;
  assignment?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'type' | 'assignment' | 'frequency' | 'status' | 'amount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface BenefitEntitlementPaginationMeta {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface PaginatedBenefitEntitlementResponse {
  data: BenefitEntitlement[];
  pagination: BenefitEntitlementPaginationMeta;
}

export interface BenefitEntitlementStats {
  totalEntitlements: number;
  activeEntitlements: number;
  assignedToAll: number;
  monthlySpending: number;
}
