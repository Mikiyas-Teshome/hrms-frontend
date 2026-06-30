import {
  leavePolicyDefaultValues,
  leavePolicySchema,
  type LeavePolicyFormInput,
  type LeavePolicyFormValues,
} from '@/features/leave-policy/schemas/leave-policy.schema';
import type { LeavePolicy } from '@/types/leave-policies';
import type {
  AttachmentCondition,
  CreateLeavePolicyInput,
  EntitlementGrantMode,
  LeavePolicyDetail,
  LeavePolicyListItem,
  LeavePolicyStatus,
  PayType,
  UpdateLeavePolicyInput,
  UsageLimitScope,
} from './leave-policy.types';

const GRANT_MODE_UI_TO_API: Record<string, EntitlementGrantMode> = {
  'Yearly allocation': 'yearly_allocation',
  'Monthly accrual': 'monthly_accrual',
  Manual: 'manual',
};

const GRANT_MODE_API_TO_UI: Record<EntitlementGrantMode, string> = {
  yearly_allocation: 'Yearly allocation',
  monthly_accrual: 'Monthly accrual',
  manual: 'Manual',
};

const USAGE_SCOPE_UI_TO_API: Record<string, UsageLimitScope> = {
  'Per calendar year': 'per_calendar_year',
  'Once per lifetime': 'once_per_lifetime',
};

const USAGE_SCOPE_API_TO_UI: Record<UsageLimitScope, string> = {
  per_calendar_year: 'Per calendar year',
  once_per_lifetime: 'Once per lifetime',
};

const EXPIRY_UI_TO_MONTHS: Record<string, number> = {
  '3 months': 3,
  '6 months': 6,
  '12 months': 12,
};

const EXPIRY_MONTHS_TO_UI: Record<number, string> = {
  3: '3 months',
  6: '6 months',
  12: '12 months',
};

const ATTACHMENT_UI_TO_API: Record<string, AttachmentCondition> = {
  'Always require': 'always',
  'When duration > 3 days': 'when_duration_exceeds',
};

const ATTACHMENT_API_TO_UI: Record<AttachmentCondition, string> = {
  always: 'Always require',
  when_duration_exceeds: 'When duration > 3 days',
};

const PAY_TYPE_UI_TO_API: Record<string, PayType> = {
  'Full pay': 'full',
  'Partial pay': 'partial',
};

const PAY_TYPE_API_TO_UI: Record<PayType, string> = {
  full: 'Full pay',
  partial: 'Partial pay',
  unpaid: 'Full pay',
};

function toOptionalInt(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function mapGrantModeToApi(label: string): EntitlementGrantMode {
  return GRANT_MODE_UI_TO_API[label] ?? 'yearly_allocation';
}

export function mapUsageScopeToApi(label: string): UsageLimitScope {
  return USAGE_SCOPE_UI_TO_API[label] ?? 'per_calendar_year';
}

export function mapListItemToTableRow(item: LeavePolicyListItem): LeavePolicy {
  return {
    id: item.id,
    policyName: item.policyName,
    code: item.code,
    maxDaysPerYear: item.maxDaysPerYear,
    entitlementGrantMode: item.entitlementGrantMode,
    usageLimitScope: item.usageLimitScope,
    carryForward: item.carryForward,
    status: item.status === 'active' ? 'Active' : 'Inactive',
  };
}

export function mapFormToCreateInput(
  data: LeavePolicyFormValues,
  companyOuId: string,
): CreateLeavePolicyInput {
  const applyToAll = data.applyTo === 'All departments';
  const isCompOff = data.isCompOffPolicy;
  const grantMode = isCompOff ? 'manual' : mapGrantModeToApi(data.entitlementGrantMode);
  const input: CreateLeavePolicyInput = {
    companyOuId,
    code: data.code,
    name: data.policyName,
    description: data.description || undefined,
    maxDaysPerYear: isCompOff ? 0 : Number(data.maxDaysPerYear),
    entitlementGrantMode: grantMode,
    usageLimitScope: mapUsageScopeToApi(data.usageLimitScope),
    carryForwardEnabled: isCompOff ? false : data.carryForward,
    probationRequired: false,
    applyToAllDepartments: applyToAll,
    requireAttachment: data.requireAttachment,
    paidLeave: data.paidLeave,
    compoundingEnabled: isCompOff ? false : data.compoundingEnabled,
    isCompOffPolicy: isCompOff,
  };

  if (!isCompOff && grantMode === 'monthly_accrual') {
    const grantRatePerPeriod = toOptionalInt(data.grantRatePerPeriod);
    if (grantRatePerPeriod != null) {
      input.grantRatePerPeriod = grantRatePerPeriod;
    }
  }

  if (!isCompOff && data.compoundingEnabled) {
    const compoundingDays = toOptionalInt(data.compoundingDays);
    if (compoundingDays != null) {
      input.compoundingDays = compoundingDays;
    }

    const compoundingYears = toOptionalInt(data.compoundingYears);
    if (compoundingYears != null) {
      input.compoundingYears = compoundingYears;
    }
  }

  if (!isCompOff && data.carryForward) {
    const maxCarryForwardDays = toOptionalInt(data.maxCarryForwardDays);
    if (maxCarryForwardDays != null) {
      input.maxCarryForwardDays = maxCarryForwardDays;
    }
    if (data.expiryPeriod && EXPIRY_UI_TO_MONTHS[data.expiryPeriod]) {
      input.carryForwardExpiryMonths = EXPIRY_UI_TO_MONTHS[data.expiryPeriod];
    }
  }

  const minDaysPerRequest = toOptionalInt(data.minDaysPerRequest);
  if (minDaysPerRequest != null) {
    input.minDaysPerRequest = minDaysPerRequest;
  }

  const maxDaysPerRequest = toOptionalInt(data.maxDaysPerRequest);
  if (maxDaysPerRequest != null) {
    input.maxDaysPerRequest = maxDaysPerRequest;
  }

  const noticePeriodDays = toOptionalInt(data.noticePeriod);
  if (noticePeriodDays != null) {
    input.noticePeriodDays = noticePeriodDays;
  }

  if (!applyToAll && data.departmentIds?.length) {
    input.departmentIds = data.departmentIds;
  }

  if (data.requireAttachment) {
    if (data.attachmentCondition) {
      input.attachmentCondition = ATTACHMENT_UI_TO_API[data.attachmentCondition];
    }
    if (data.requiredDocumentCategoryId) {
      input.requiredDocumentCategoryId = data.requiredDocumentCategoryId;
    }
  }

  if (data.paidLeave) {
    if (data.payType) input.payType = PAY_TYPE_UI_TO_API[data.payType] ?? 'full';
    if (input.payType === 'partial') {
      const fullPayDays = toOptionalInt(data.fullPayDays);
      if (fullPayDays != null) input.fullPayDays = fullPayDays;

      const halfPayDays = toOptionalInt(data.halfPayDays);
      if (halfPayDays != null) input.halfPayDays = halfPayDays;

      const noPayAfterDays = toOptionalInt(data.noPayDays);
      if (noPayAfterDays != null) input.noPayAfterDays = noPayAfterDays;
    }
  } else if (data.deductFromSalary) {
    input.deductFromSalary = data.deductFromSalary === 'Deduct';
  }

  return input;
}

export function mapFormToUpdateInput(data: LeavePolicyFormValues): UpdateLeavePolicyInput {
  const create = mapFormToCreateInput(data, '');
  const rest: Partial<CreateLeavePolicyInput> = { ...create };
  delete rest.companyOuId;
  return rest as UpdateLeavePolicyInput;
}

export function mapDetailToFormValues(policy: LeavePolicyDetail): LeavePolicyFormInput {
  return {
    policyName: policy.name,
    code: policy.code,
    description: policy.description ?? '',
    maxDaysPerYear: policy.maxBalance,
    entitlementGrantMode: GRANT_MODE_API_TO_UI[policy.entitlementGrantMode] ?? 'Yearly allocation',
    grantRatePerPeriod: policy.grantRatePerPeriod ?? '',
    usageLimitScope: USAGE_SCOPE_API_TO_UI[policy.usageLimitScope] ?? 'Per calendar year',
    maxCarryForwardDays: policy.maxCarryForwardDays ?? '',
    expiryPeriod: policy.carryForwardExpiryMonths
      ? EXPIRY_MONTHS_TO_UI[policy.carryForwardExpiryMonths]
      : undefined,
    carryForward: policy.carryForwardEnabled,
    minDaysPerRequest: policy.minDaysPerRequest ?? '',
    maxDaysPerRequest: policy.maxDaysPerRequest ?? '',
    noticePeriod: policy.noticePeriodDays ?? '',
    applyTo: policy.applyToAllDepartments ? 'All departments' : 'Specific departments',
    departmentIds: policy.departmentIds ?? [],
    requireAttachment: policy.requireAttachment,
    attachmentCondition: policy.attachmentCondition
      ? ATTACHMENT_API_TO_UI[policy.attachmentCondition]
      : undefined,
    requiredDocumentCategoryId: policy.requiredDocumentCategoryId ?? undefined,
    paidLeave: policy.paidLeave,
    payType: policy.payType ? PAY_TYPE_API_TO_UI[policy.payType] : 'Full pay',
    fullPayDays: policy.fullPayDays ?? '',
    halfPayDays: policy.halfPayDays ?? '',
    noPayDays: policy.noPayAfterDays != null ? String(policy.noPayAfterDays) : '',
    deductFromSalary: policy.deductFromSalary ? 'Deduct' : 'No deduction',
    compoundingEnabled: policy.compoundingEnabled,
    compoundingDays: policy.compoundingDays ?? '',
    compoundingYears: policy.compoundingYears ?? '',
    isCompOffPolicy: policy.isCompOffPolicy,
  };
}

export function mapStatusFilterToApi(status: string): LeavePolicyStatus | undefined {
  if (status === 'Active') return 'active';
  if (status === 'Inactive') return 'inactive';
  return undefined;
}

export function formatEntitlementGrantMode(mode: EntitlementGrantMode): string {
  return GRANT_MODE_API_TO_UI[mode] ?? mode;
}

export function formatUsageLimitScope(scope: UsageLimitScope): string {
  return USAGE_SCOPE_API_TO_UI[scope] ?? scope;
}

export type OnboardingLeavePolicyItem = {
  id: string;
  enabled: boolean;
  formSnapshot?: LeavePolicyFormInput;
  name?: string;
  code?: string;
  maxDaysPerYear?: number;
  description?: string;
  entitlementGrantMode?: EntitlementGrantMode;
  paidLeave?: boolean;
  carryForwardEnabled?: boolean;
};

type LegacyOnboardingLeavePolicy = OnboardingLeavePolicyItem & {
  days?: number;
  condition?: 'paid' | 'unpaid';
  carryForwardAllowed?: boolean;
};

export function mapOnboardingPolicyToFormValues(
  policy: LegacyOnboardingLeavePolicy,
  fallbackName?: string,
  fallbackDescription?: string,
): LeavePolicyFormInput {
  if (policy.formSnapshot) {
    return { ...policy.formSnapshot };
  }

  const maxDays = policy.maxDaysPerYear ?? policy.days ?? 0;
  const grantMode = policy.entitlementGrantMode
    ? GRANT_MODE_API_TO_UI[policy.entitlementGrantMode]
    : 'Yearly allocation';
  const paidLeave =
    policy.paidLeave ?? (policy.condition ? policy.condition === 'paid' : true);

  return {
    ...leavePolicyDefaultValues,
    policyName: policy.name ?? fallbackName ?? '',
    code: policy.code ?? policy.id ?? '',
    description: policy.description ?? fallbackDescription ?? '',
    maxDaysPerYear: maxDays,
    entitlementGrantMode: grantMode,
    carryForward: policy.carryForwardEnabled ?? policy.carryForwardAllowed ?? false,
    paidLeave,
    isCompOffPolicy: policy.code === 'comp_off',
  };
}

export function mapFormValuesToOnboardingPolicy(
  data: LeavePolicyFormValues,
  existing?: { id?: string; enabled?: boolean },
): OnboardingLeavePolicyItem {
  const grantMode = mapGrantModeToApi(data.entitlementGrantMode);
  const formSnapshot: LeavePolicyFormInput = { ...data };

  return {
    id:
      existing?.id ??
      (data.code || data.policyName.toLowerCase().replace(/\s+/g, '-')),
    enabled: existing?.enabled ?? true,
    formSnapshot,
    name: data.policyName,
    code: data.code,
    maxDaysPerYear: data.isCompOffPolicy ? 0 : Number(data.maxDaysPerYear),
    description: data.description,
    entitlementGrantMode: grantMode,
    paidLeave: data.paidLeave,
    carryForwardEnabled: data.carryForward,
  };
}

export function createOnboardingLeavePolicyPreset(
  id: string,
  name: string,
  code: string,
  maxDaysPerYear: number,
  description: string,
  carryForwardEnabled = false,
): OnboardingLeavePolicyItem {
  const formSnapshot: LeavePolicyFormInput = {
    ...leavePolicyDefaultValues,
    policyName: name,
    code,
    description,
    maxDaysPerYear,
    carryForward: carryForwardEnabled,
    paidLeave: true,
  };

  return {
    id,
    enabled: true,
    formSnapshot,
    name,
    code,
    maxDaysPerYear,
    description,
    entitlementGrantMode: 'yearly_allocation',
    paidLeave: true,
    carryForwardEnabled,
  };
}

export function resolveOnboardingPolicyFormValues(
  policy: LegacyOnboardingLeavePolicy,
  fallbackName?: string,
  fallbackDescription?: string,
): LeavePolicyFormValues {
  if (policy.formSnapshot) {
    return leavePolicySchema.parse(policy.formSnapshot);
  }
  return leavePolicySchema.parse(
    mapOnboardingPolicyToFormValues(policy, fallbackName, fallbackDescription),
  );
}
