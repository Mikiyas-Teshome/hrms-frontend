import {
  createOvertimePolicy,
  updateOvertimePolicy,
} from '@/features/payroll/overtime-policy/overtime-policy.actions';
import { OvertimeType } from '@/features/payroll/overtime-policy/overtime-policy.types';
import { SalaryStructureResponse } from './salary-structure.types';

export type SalaryStructureOvertimeRule = {
  rateValue: string;
  type: OvertimeType;
};

export type SalaryStructureOvertimeRules = {
  standard: SalaryStructureOvertimeRule;
  weekend: SalaryStructureOvertimeRule;
  publicHoliday: SalaryStructureOvertimeRule;
};

export const DEFAULT_SALARY_STRUCTURE_OVERTIME_RULES: SalaryStructureOvertimeRules = {
  standard: { rateValue: '1.5', type: OvertimeType.MULTIPLIER },
  weekend: { rateValue: '2.0', type: OvertimeType.FIXED_RATE },
  publicHoliday: { rateValue: '5.0', type: OvertimeType.FIXED_RATE },
};

export function mapStructureToOvertimeRules(
  structure?: SalaryStructureResponse | null,
): SalaryStructureOvertimeRules {
  return {
    standard: {
      rateValue: String(structure?.normalOvertimePolicy?.rateValue ?? 1.5),
      type: structure?.normalOvertimePolicy?.type ?? OvertimeType.MULTIPLIER,
    },
    weekend: {
      rateValue: String(structure?.weekendOvertimePolicy?.rateValue ?? 2),
      type: structure?.weekendOvertimePolicy?.type ?? OvertimeType.FIXED_RATE,
    },
    publicHoliday: {
      rateValue: String(structure?.holidayOvertimePolicy?.rateValue ?? 5),
      type: structure?.holidayOvertimePolicy?.type ?? OvertimeType.FIXED_RATE,
    },
  };
}

async function upsertOvertimePolicy(params: {
  companyId: string;
  name: string;
  policyId?: string | null;
  rule: SalaryStructureOvertimeRule;
}): Promise<string | undefined> {
  const rateValue = Number.parseFloat(params.rule.rateValue);
  if (!Number.isFinite(rateValue) || rateValue <= 0) {
    return params.policyId ?? undefined;
  }

  if (params.policyId) {
    const result = await updateOvertimePolicy(params.policyId, {
      name: params.name,
      rateValue,
      type: params.rule.type,
    });
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data?.id ?? params.policyId;
  }

  const result = await createOvertimePolicy({
    companyId: params.companyId,
    name: params.name,
    rateValue,
    type: params.rule.type,
  });
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data?.id;
}

function structureScopedPolicyName(structureName: string, policyLabel: string): string {
  const trimmedName = structureName.trim();
  if (!trimmedName) {
    return policyLabel;
  }
  return `${trimmedName} · ${policyLabel}`;
}

export async function syncSalaryStructureOvertimePolicies(
  companyId: string,
  rules: SalaryStructureOvertimeRules,
  existing?: SalaryStructureResponse | null,
  structureName?: string,
): Promise<{
  normalOvertimePolicyId?: string;
  weekendOvertimePolicyId?: string;
  holidayOvertimePolicyId?: string;
}> {
  const resolvedStructureName = structureName?.trim() || existing?.name?.trim() || '';

  const [normalOvertimePolicyId, weekendOvertimePolicyId, holidayOvertimePolicyId] =
    await Promise.all([
      upsertOvertimePolicy({
        companyId,
        name: structureScopedPolicyName(resolvedStructureName, 'Standard Overtime'),
        policyId: existing?.normalOvertimePolicy?.id,
        rule: rules.standard,
      }),
      upsertOvertimePolicy({
        companyId,
        name: structureScopedPolicyName(resolvedStructureName, 'Weekend Overtime'),
        policyId: existing?.weekendOvertimePolicy?.id,
        rule: rules.weekend,
      }),
      upsertOvertimePolicy({
        companyId,
        name: structureScopedPolicyName(resolvedStructureName, 'Public Holiday Overtime'),
        policyId: existing?.holidayOvertimePolicy?.id,
        rule: rules.publicHoliday,
      }),
    ]);

  return {
    normalOvertimePolicyId,
    weekendOvertimePolicyId,
    holidayOvertimePolicyId,
  };
}
