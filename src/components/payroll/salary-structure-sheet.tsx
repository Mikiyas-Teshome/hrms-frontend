'use client';

import { useEffect, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { Textarea } from '@/components/ui/textarea';
import {
  usePayrollAllowances,
  usePayrollDeductions,
} from '@/features/payroll/hooks/usePayroll';
import { OvertimeType } from '@/features/payroll/overtime-policy/overtime-policy.types';
import { PayrollComponentResponse } from '@/features/payroll/payroll.types';
import { SalaryStructureResponse } from '@/features/payroll/salary-structure/salary-structure.types';
import {
  DEFAULT_SALARY_STRUCTURE_OVERTIME_RULES,
  mapStructureToOvertimeRules,
} from '@/features/payroll/salary-structure/salary-structure-overtime.util';
import { SalaryStructureOvertimeRules } from '@/components/payroll/salary-structure-overtime-rules';

const salaryStructureSchema = zod.object({
  companyId: zod.string().min(1),
  name: zod.string().min(1),
  code: zod.string().optional(),
  description: zod.string().optional(),
  overtimeRules: zod.object({
    standard: zod.object({
      rateValue: zod.string().min(1),
      type: zod.nativeEnum(OvertimeType),
    }),
    weekend: zod.object({
      rateValue: zod.string().min(1),
      type: zod.nativeEnum(OvertimeType),
    }),
    publicHoliday: zod.object({
      rateValue: zod.string().min(1),
      type: zod.nativeEnum(OvertimeType),
    }),
  }),
  allowanceIds: zod.array(zod.string()),
  deductionIds: zod.array(zod.string()),
});

export type SalaryStructureFormValues = zod.infer<typeof salaryStructureSchema>;

type CompanyOption = {
  label: string;
  value: string;
};

type SalaryStructureSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  defaultValues?: Partial<SalaryStructureFormValues>;
  defaultCompanyId?: string;
  companyOptions?: CompanyOption[];
  isLoadingCompanies?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: SalaryStructureFormValues) => void;
};

function buildFormValues(
  defaultValues: Partial<SalaryStructureFormValues> | undefined,
  defaultCompanyId?: string,
): SalaryStructureFormValues {
  return {
    companyId: defaultValues?.companyId ?? defaultCompanyId ?? '',
    name: defaultValues?.name ?? '',
    code: defaultValues?.code ?? '',
    description: defaultValues?.description ?? '',
    overtimeRules: defaultValues?.overtimeRules ?? DEFAULT_SALARY_STRUCTURE_OVERTIME_RULES,
    allowanceIds: defaultValues?.allowanceIds ?? [],
    deductionIds: defaultValues?.deductionIds ?? [],
  };
}

function mapStructureToFormValues(structure: SalaryStructureResponse): Partial<SalaryStructureFormValues> {
  return {
    companyId: structure.ouId ?? structure.companyId,
    name: structure.name,
    code: structure.code ?? '',
    description: structure.description ?? '',
    overtimeRules: mapStructureToOvertimeRules(structure),
    allowanceIds: structure.allowances.map((item) => item.id),
    deductionIds: structure.deductions.map((item) => item.id),
  };
}

type ComponentCheckboxListProps = {
  items: PayrollComponentResponse[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  emptyMessage: string;
  idPrefix: string;
};

function ComponentCheckboxList({
  items,
  selectedIds,
  onChange,
  emptyMessage,
  idPrefix,
}: ComponentCheckboxListProps) {
  const toggle = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, id]);
      return;
    }
    onChange(selectedIds.filter((itemId) => itemId !== id));
  };

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Checkbox
            id={`${idPrefix}-${item.id}`}
            checked={selectedIds.includes(item.id)}
            onCheckedChange={(checked) => toggle(item.id, !!checked)}
          />
          <Label
            htmlFor={`${idPrefix}-${item.id}`}
            className="text-sm font-medium cursor-pointer text-foreground"
          >
            {item.name}
          </Label>
        </div>
      ))}
    </div>
  );
}

export function SalaryStructureSheet({
  isOpen,
  onOpenChange,
  title,
  defaultValues,
  defaultCompanyId,
  companyOptions = [],
  isLoadingCompanies = false,
  isSubmitting = false,
  onSubmit,
}: SalaryStructureSheetProps) {
  const { t } = useTranslation(['payroll', 'dashboard']);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SalaryStructureFormValues>({
    resolver: zodResolver(salaryStructureSchema) as never,
    defaultValues: buildFormValues(defaultValues, defaultCompanyId),
  });

  const selectedOuId =
    useWatch({ control, name: 'companyId' }) || defaultCompanyId || '';

  const { data: allowanceOptions = [], isLoading: isLoadingAllowances } =
    usePayrollAllowances(selectedOuId);
  const { data: deductionOptions = [], isLoading: isLoadingDeductions } =
    usePayrollDeductions(selectedOuId);

  const wasOpenRef = useRef(false);
  const isEditing = Boolean(defaultValues?.name);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset(buildFormValues(defaultValues, defaultCompanyId));
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, defaultValues, defaultCompanyId, reset]);

  const handleFormSubmit = (values: SalaryStructureFormValues) => {
    onSubmit(values);
  };

  const componentsDisabled = !selectedOuId;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-150 px-10 py-6 flex flex-col h-full border-l border-border/50 overflow-hidden bg-background"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-2xl font-bold text-foreground leading-tight">
            {title ||
              (isEditing
                ? t('payrollData.salaryStructures.editTitle', 'Edit salary structure')
                : t('payrollData.salaryStructures.createTitle', 'Create salary structure'))}
          </SheetTitle>
          <div className="h-px bg-border mt-6" />
        </SheetHeader>

        <form
          id="salary-structure-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-10 pt-2">
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="bg-muted/40 border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {t('payrollData.salaryStructures.structureInfo', 'Structure info')}
                </p>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <FormSelect
                  id="companyId"
                  label={t('setup.selectCompany', 'Company selection')}
                  placeholder={
                    isLoadingCompanies
                      ? t('setup.loadingCompanies', 'Loading...')
                      : t('setup.selectCompanyPlaceholder', 'Select company')
                  }
                  control={control}
                  name="companyId"
                  error={errors.companyId}
                  options={companyOptions}
                  t={t}
                  disabled={isEditing || companyOptions.length <= 1}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <FormField
                    id="name"
                    label={t('payrollData.salaryStructures.name', 'Name')}
                    name="name"
                    register={register}
                    error={errors.name}
                    t={t}
                  />
                  <FormField
                    id="code"
                    label={t('payrollData.salaryStructures.code', 'Code')}
                    name="code"
                    register={register}
                    error={errors.code}
                    t={t}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-foreground">
                    {t('payrollData.salaryStructures.description', 'Description')}
                  </Label>
                  <Textarea
                    {...register('description')}
                    placeholder={t('payrollData.modals.descriptionPlaceholder', 'Add description')}
                    className="min-h-32 resize-none rounded-lg border-border bg-background focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="bg-muted/40 border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {t('payrollData.salaryStructures.payrollComponents', 'Payroll components')}
                </p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">
                    {t('payrollData.allowances.title', 'Allowances')}
                  </Label>
                  {componentsDisabled ? (
                    <p className="text-sm text-muted-foreground">
                      {t(
                        'payrollData.salaryStructures.selectCompanyForComponents',
                        'Select a company to load allowances.',
                      )}
                    </p>
                  ) : (
                    <Controller
                      control={control}
                      name="allowanceIds"
                      render={({ field }) => (
                        <ComponentCheckboxList
                          idPrefix="allowance"
                          items={allowanceOptions}
                          selectedIds={field.value}
                          onChange={field.onChange}
                          emptyMessage={
                            isLoadingAllowances
                              ? t('common.loading', 'Loading...')
                              : t(
                                  'payrollData.salaryStructures.noAllowances',
                                  'No allowances found for this company.',
                                )
                          }
                        />
                      )}
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">
                    {t('payrollData.deductions.title', 'Deductions')}
                  </Label>
                  {componentsDisabled ? (
                    <p className="text-sm text-muted-foreground">
                      {t(
                        'payrollData.salaryStructures.selectCompanyForComponents',
                        'Select a company to load deductions.',
                      )}
                    </p>
                  ) : (
                    <Controller
                      control={control}
                      name="deductionIds"
                      render={({ field }) => (
                        <ComponentCheckboxList
                          idPrefix="deduction"
                          items={deductionOptions}
                          selectedIds={field.value}
                          onChange={field.onChange}
                          emptyMessage={
                            isLoadingDeductions
                              ? t('common.loading', 'Loading...')
                              : t(
                                  'payrollData.salaryStructures.noDeductions',
                                  'No deductions found for this company.',
                                )
                          }
                        />
                      )}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="p-6">
                <SalaryStructureOvertimeRules
                  register={register}
                  control={control}
                  errors={errors}
                  t={t}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-auto pt-6 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 transition-all font-semibold"
              onClick={() => onOpenChange(false)}
            >
              {t('payrollData.modals.cancelBtn', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-10 rounded-xl text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.saving', 'Saving...')}
                </div>
              ) : (
                t('payrollData.salaryStructures.saveBtn', 'Save structure')
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { mapStructureToFormValues };
