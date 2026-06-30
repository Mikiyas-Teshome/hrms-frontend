'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
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
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { SalaryStructureResponse } from '@/features/payroll/salary-structure/salary-structure.types';

const assignSalarySchema = zod.object({
  salaryStructureId: zod.string().min(1),
  baseSalary: zod.coerce.number().positive(),
});

export type AssignEmployeeSalaryFormValues = zod.infer<typeof assignSalarySchema>;

type CompanyOption = {
  label: string;
  value: string;
};

type AssignEmployeeSalarySheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName?: string;
  structures: SalaryStructureResponse[];
  isLoadingStructures?: boolean;
  companyOptions?: CompanyOption[];
  selectedCompanyId?: string;
  onCompanyChange?: (companyId: string) => void;
  isLoadingCompanies?: boolean;
  currencyCode: string;
  isSubmitting?: boolean;
  mode?: 'assign' | 'edit';
  initialValues?: AssignEmployeeSalaryFormValues;
  onSubmit: (values: AssignEmployeeSalaryFormValues) => void;
};

export function AssignEmployeeSalarySheet({
  isOpen,
  onOpenChange,
  employeeName,
  structures,
  isLoadingStructures = false,
  companyOptions = [],
  selectedCompanyId = '',
  onCompanyChange,
  isLoadingCompanies = false,
  currencyCode,
  isSubmitting = false,
  mode = 'assign',
  initialValues,
  onSubmit,
}: AssignEmployeeSalarySheetProps) {
  const { t } = useTranslation(['payroll', 'dashboard']);
  const isEditMode = mode === 'edit';

  const structureOptions = structures.map((structure) => ({
    label: structure.code ? `${structure.name} (${structure.code})` : structure.name,
    value: structure.id,
  }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AssignEmployeeSalaryFormValues>({
    resolver: zodResolver(assignSalarySchema) as never,
    defaultValues: {
      salaryStructureId: '',
      baseSalary: 0,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(
      initialValues ?? {
        salaryStructureId: '',
        baseSalary: 0,
      },
    );
  }, [isOpen, initialValues, reset]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-150 px-10 py-6 flex flex-col h-full border-l border-border/50 overflow-hidden bg-background"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-2xl font-bold text-foreground leading-tight">
            {isEditMode
              ? t('payrollData.detail.editSalary', 'Edit salary')
              : t('payrollData.detail.assignStructure', 'Assign salary')}
          </SheetTitle>
          {employeeName ? (
            <p className="text-sm text-muted-foreground mt-2">{employeeName}</p>
          ) : null}
          <div className="h-px bg-border mt-6" />
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-10 pt-2">
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="bg-muted/40 border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {t('payrollData.detail.compensation', 'Compensation')}
                </p>
              </div>
              <div className="p-6 flex flex-col gap-6">
                <p className="text-sm text-muted-foreground">
                  {t(
                    'payrollData.detail.noStructureDesc',
                    "Assign a salary structure template and base salary to manage this employee's compensation.",
                  )}
                </p>

                {companyOptions.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="assign-company"
                      className="text-sm font-medium leading-5 text-foreground block"
                    >
                      {t('setup.selectCompany', 'Company selection')}
                    </label>
                    <select
                      id="assign-company"
                      className="h-9 w-full rounded-lg px-4 py-2 bg-background border border-input text-sm"
                      value={selectedCompanyId}
                      disabled={isLoadingCompanies || companyOptions.length <= 1}
                      onChange={(event) => onCompanyChange?.(event.target.value)}
                    >
                      {isLoadingCompanies ? (
                        <option value="">{t('setup.loadingCompanies', 'Loading...')}</option>
                      ) : (
                        companyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                ) : null}

                <FormSelect
                  id="salaryStructureId"
                  label={t('payrollData.salaryStructures.title', 'Salary structure')}
                  placeholder={
                    isLoadingStructures
                      ? t('common.loading', 'Loading...')
                      : t('payrollData.salaryStructures.selectStructure', 'Select salary structure')
                  }
                  control={control}
                  name="salaryStructureId"
                  error={errors.salaryStructureId}
                  options={structureOptions}
                  t={t}
                  disabled={isLoadingStructures || structureOptions.length === 0}
                />

                {structureOptions.length === 0 && !isLoadingStructures ? (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 justify-start text-primary"
                    asChild
                  >
                    <Link href="/dashboard/payroll/salary-structures">
                      {t(
                        'payrollData.salaryStructures.createFirst',
                        'Create a salary structure first',
                      )}
                    </Link>
                  </Button>
                ) : null}

                <FormField
                  id="baseSalary"
                  label={t('payrollData.detail.basicSalaryWithCurrency', {
                    defaultValue: 'Basic salary ({{currency}})',
                    currency: currencyCode,
                  })}
                  name="baseSalary"
                  type="number"
                  register={register}
                  error={errors.baseSalary}
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
              disabled={isSubmitting || structureOptions.length === 0}
              className="h-11 px-10 rounded-xl text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.saving', 'Saving...')}
                </div>
              ) : isEditMode ? (
                t('payrollData.detail.saveSalary', 'Save salary')
              ) : (
                t('payrollData.detail.assignStructure', 'Assign salary')
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
