import type { EntitlementGrantMode, UsageLimitScope } from '@/features/leave-policy/leave-policy.types';

export interface LeavePolicy {
  id: string;
  policyName: string;
  code: string;
  maxDaysPerYear: number;
  entitlementGrantMode: EntitlementGrantMode;
  usageLimitScope: UsageLimitScope;
  carryForward: string;
  status: 'Active' | 'Inactive';
}
