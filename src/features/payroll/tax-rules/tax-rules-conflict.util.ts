import { CreateTaxRuleInput, TaxRuleResponse, TaxRuleStatus } from './tax-rules.types';

function toUtcDateOnly(value: string): Date {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDateLabel(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTaxRulePeriod(effectiveFrom: string, effectiveTo?: string | null): string {
  const from = formatDateLabel(toUtcDateOnly(effectiveFrom));
  if (!effectiveTo) {
    return `${from} – ongoing`;
  }
  return `${from} – ${formatDateLabel(toUtcDateOnly(effectiveTo))}`;
}

export function findScheduleConflictRule(
  rules: TaxRuleResponse[],
  input: Pick<CreateTaxRuleInput, 'status' | 'effectiveFrom' | 'effectiveTo'>,
  excludeId?: string,
): TaxRuleResponse | null {
  if ((input.status ?? TaxRuleStatus.inactive) !== TaxRuleStatus.active) {
    return null;
  }

  const effectiveFrom = toUtcDateOnly(input.effectiveFrom);
  const effectiveTo = input.effectiveTo ? toUtcDateOnly(input.effectiveTo) : null;
  const newEnd = effectiveTo ?? new Date(Date.UTC(9999, 11, 31));

  const overlapping = rules.filter((rule) => {
    if (rule.status !== TaxRuleStatus.active || rule.id === excludeId) {
      return false;
    }
    const ruleFrom = toUtcDateOnly(rule.effectiveFrom);
    const ruleEnd = rule.effectiveTo ? toUtcDateOnly(rule.effectiveTo) : new Date(Date.UTC(9999, 11, 31));
    return ruleFrom.getTime() <= newEnd.getTime() && effectiveFrom.getTime() <= ruleEnd.getTime();
  });

  const unclosable = overlapping.filter(
    (rule) => toUtcDateOnly(rule.effectiveFrom).getTime() >= effectiveFrom.getTime(),
  );

  if (!unclosable.length) {
    return null;
  }

  return unclosable.sort(
    (a, b) => toUtcDateOnly(a.effectiveFrom).getTime() - toUtcDateOnly(b.effectiveFrom).getTime(),
  )[0];
}

export function isTaxRuleScheduleConflictError(message?: string): boolean {
  if (!message) {
    return false;
  }
  return (
    message.includes('TAX_RULE_SCHEDULE_CONFLICT') ||
    message.includes('already covers this period') ||
    message.includes('تغطي هذه الفترة')
  );
}
