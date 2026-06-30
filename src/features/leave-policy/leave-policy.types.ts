export type EntitlementGrantMode = 'monthly_accrual' | 'yearly_allocation' | 'manual';
export type UsageLimitScope = 'per_calendar_year' | 'once_per_lifetime';
export type LeavePolicyStatus = 'active' | 'inactive';
export type PayType = 'full' | 'partial' | 'unpaid';
export type AttachmentCondition = 'always' | 'when_duration_exceeds';

export interface LeavePolicyStats {
  total: number;
  active: number;
}

export interface LeavePolicyListItem {
  id: string;
  policyName: string;
  code: string;
  maxDaysPerYear: number;
  entitlementGrantMode: EntitlementGrantMode;
  usageLimitScope: UsageLimitScope;
  carryForward: string;
  status: LeavePolicyStatus;
}

export interface LeavePolicyConnection {
  items: LeavePolicyListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LeavePolicyDetail {
  id: string;
  companyOuId: string;
  code: string;
  name: string;
  description?: string | null;
  status: LeavePolicyStatus;
  maxBalance: number;
  entitlementGrantMode: EntitlementGrantMode;
  grantRatePerPeriod?: number | null;
  usageLimitScope: UsageLimitScope;
  probationRequired: boolean;
  carryForwardEnabled: boolean;
  maxCarryForwardDays?: number | null;
  carryForwardExpiryMonths?: number | null;
  minDaysPerRequest?: number | null;
  maxDaysPerRequest?: number | null;
  noticePeriodDays?: number | null;
  applyToAllDepartments: boolean;
  departmentIds: string[];
  requireAttachment: boolean;
  attachmentCondition?: AttachmentCondition | null;
  requiredDocumentCategoryId?: string | null;
  paidLeave: boolean;
  payType?: PayType | null;
  fullPayDays?: number | null;
  halfPayDays?: number | null;
  noPayAfterDays?: number | null;
  deductFromSalary?: boolean | null;
  compoundingEnabled: boolean;
  compoundingDays?: number | null;
  compoundingYears?: number | null;
  isCompOffPolicy: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeavePolicyFilterInput {
  search?: string;
  status?: LeavePolicyStatus;
  code?: string;
  isCompOffPolicy?: boolean;
}

export interface LeavePolicyPaginationInput {
  page?: number;
  pageSize?: number;
}

export interface LeavePolicyBalanceSeedResult {
  success: boolean;
  seededCount: number;
  message?: string | null;
}

export interface CreateLeavePolicyPayload {
  policy: LeavePolicyDetail;
  balanceSeed: LeavePolicyBalanceSeedResult;
}

export interface CreateLeavePolicyInput {
  companyOuId: string;
  code: string;
  name: string;
  description?: string;
  maxDaysPerYear: number;
  entitlementGrantMode: EntitlementGrantMode;
  grantRatePerPeriod?: number;
  usageLimitScope?: UsageLimitScope;
  carryForwardEnabled: boolean;
  maxCarryForwardDays?: number;
  carryForwardExpiryMonths?: number;
  minDaysPerRequest?: number;
  maxDaysPerRequest?: number;
  noticePeriodDays?: number;
  probationRequired?: boolean;
  applyToAllDepartments: boolean;
  departmentIds?: string[];
  requireAttachment: boolean;
  attachmentCondition?: AttachmentCondition;
  requiredDocumentCategoryId?: string;
  paidLeave: boolean;
  payType?: PayType;
  fullPayDays?: number;
  halfPayDays?: number;
  noPayAfterDays?: number;
  deductFromSalary?: boolean;
  compoundingEnabled: boolean;
  compoundingDays?: number;
  compoundingYears?: number;
  isCompOffPolicy: boolean;
}

export type UpdateLeavePolicyInput = Partial<Omit<CreateLeavePolicyInput, 'companyOuId'>>;

export const LEAVE_POLICY_CODE_OPTIONS = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'hajj', label: 'Hajj Leave' },
  { value: 'bereavement', label: 'Bereavement Leave' },
  { value: 'marriage', label: 'Marriage Leave' },
  { value: 'study', label: 'Study / Exam Leave' },
  { value: 'compassionate', label: 'Compassionate Leave' },
  { value: 'iddah', label: 'Iddah Leave' },
  { value: 'work_injury', label: 'Work Injury Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'comp_off', label: 'Compensatory Off' },
  { value: 'custom', label: 'Custom' },
] as const;

export const VALID_LEAVE_POLICY_CODES = LEAVE_POLICY_CODE_OPTIONS.map((o) => o.value);
