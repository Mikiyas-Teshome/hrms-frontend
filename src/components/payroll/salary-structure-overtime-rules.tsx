'use client';

import { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/FormSelect';
import { cn } from '@/lib/utils';
import { OvertimeType } from '@/features/payroll/overtime-policy/overtime-policy.types';
import { SalaryStructureFormValues } from '@/components/payroll/salary-structure-sheet';

type SalaryStructureOvertimeRulesProps = {
  register: UseFormRegister<SalaryStructureFormValues>;
  control: Control<SalaryStructureFormValues>;
  errors: FieldErrors<SalaryStructureFormValues>;
  t: TFunction;
};

const RULES = [
  {
    id: 'standard' as const,
    labelKey: 'overtime.standard',
    subKey: 'overtime.standardSub',
    defaultLabel: 'Standard Overtime',
    defaultSub: 'Weekdays & Regular hours',
  },
  {
    id: 'weekend' as const,
    labelKey: 'overtime.weekend',
    subKey: 'overtime.weekendSub',
    defaultLabel: 'Weekend Overtime',
    defaultSub: 'Saturdays and Sundays',
  },
  {
    id: 'publicHoliday' as const,
    labelKey: 'overtime.public holiday',
    subKey: 'overtime.publicHolidaySub',
    defaultLabel: 'Public Holiday',
    defaultSub: 'Gazetted holidays',
  },
];

export function SalaryStructureOvertimeRules({
  register,
  control,
  errors,
  t,
}: SalaryStructureOvertimeRulesProps) {
  const { t: tStructure } = useTranslation('payrollStructure');

  const typeOptions = [
    { label: t('payrollData.overtime.rateMultiplier', 'Rate (multiplier)'), value: OvertimeType.MULTIPLIER },
    { label: t('payrollData.overtime.flatRate', 'Flat rate'), value: OvertimeType.FIXED_RATE },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground rtl:text-end">
        {t('payrollData.salaryStructures.overtimeRules', 'Overtime rules')}
      </h3>
      <div className="space-y-2">
        {RULES.map((rule) => {
          const rateError = errors.overtimeRules?.[rule.id]?.rateValue;
          const typeError = errors.overtimeRules?.[rule.id]?.type;

          return (
            <div
              key={rule.id}
              className="space-y-2 rounded-xl border border-border bg-muted/20 p-3"
            >
              <div>
                <Label className="block text-sm font-semibold text-foreground rtl:text-end">
                  {tStructure(rule.labelKey, rule.defaultLabel)}
                </Label>
                <p className="text-[12px] font-normal text-muted-foreground rtl:text-end">
                  {tStructure(rule.subKey, rule.defaultSub)}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`overtimeRules.${rule.id}.rateValue`}
                  className="text-sm font-medium leading-5 text-foreground block rtl:text-end"
                >
                  {t('payrollData.overtime.rateValue', 'Rate')}
                </Label>
                <div className="flex items-start gap-2">
                  <Input
                    id={`overtimeRules.${rule.id}.rateValue`}
                    {...register(`overtimeRules.${rule.id}.rateValue`)}
                    inputMode="decimal"
                    className={cn(
                      'h-9 w-24 shrink-0 rounded-[8px] border border-input bg-background px-4 py-2 text-sm font-medium',
                      rateError ? 'border-destructive' : '',
                    )}
                  />
                  <FormSelect
                    id={`overtimeRules.${rule.id}.type`}
                    control={control}
                    name={`overtimeRules.${rule.id}.type`}
                    error={typeError}
                    options={typeOptions}
                    t={t}
                    containerClassName="min-w-0 flex-1"
                    className="h-9"
                  />
                </div>
                {(rateError || typeError) && (
                  <p className="text-xs text-destructive rtl:text-end">
                    {rateError?.message || typeError?.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
