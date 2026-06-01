'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, X } from 'lucide-react';
import { FormSelect } from '@/components/ui/FormSelect';
import {
  BenefitEntitlement,
  EntitlementType,
  EntitlementValueDefinition,
  EntitlementAccessBasis,
  InsuranceRenewalType,
  InsuranceAssignment,
} from '@/features/entitlements/entitlements.types';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import {
  useCreateBenefitEntitlement,
  useUpdateBenefitEntitlement,
} from '@/features/entitlements/hooks/useEntitlements';
import { useToast } from '@/hooks/use-toast';

interface EntitlementFormValues {
  companyOuId: string;
  name: string;
  type: EntitlementType;
  valueDefinition: EntitlementValueDefinition;
  frequency: InsuranceRenewalType;
  accessBasedOn: EntitlementAccessBasis;
  assignment: InsuranceAssignment;
  amount?: number;
  currency: string;
}

interface AddEntitlementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entitlement?: BenefitEntitlement | null;
}

const defaultValues: EntitlementFormValues = {
  companyOuId: '',
  name: '',
  type: EntitlementType.ALLOWANCE,
  valueDefinition: EntitlementValueDefinition.FIXED_AMOUNT,
  frequency: InsuranceRenewalType.YEARLY,
  accessBasedOn: EntitlementAccessBasis.ROLE,
  assignment: InsuranceAssignment.ALL_EMPLOYEES,
  amount: undefined,
  currency: 'USD',
};

const mapEntitlementToForm = (entitlement: BenefitEntitlement): EntitlementFormValues => ({
  companyOuId: entitlement.companyOuId || '',
  name: entitlement.name,
  type: entitlement.type as EntitlementType,
  valueDefinition: entitlement.valueDefinition as EntitlementValueDefinition,
  frequency: entitlement.frequency as InsuranceRenewalType,
  accessBasedOn: entitlement.accessBasedOn as EntitlementAccessBasis,
  assignment: entitlement.assignment as InsuranceAssignment,
  amount: entitlement.amount,
  currency: entitlement.currency,
});

const AddEntitlementSheet = ({ open, onOpenChange, entitlement }: AddEntitlementSheetProps) => {
  const { t } = useTranslation(['entitlement', 'dashboard']);
  const { toast } = useToast();
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
  const createMutation = useCreateBenefitEntitlement();
  const updateMutation = useUpdateBenefitEntitlement();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EntitlementFormValues>({
    defaultValues,
  });

  const formCompanyOuId = watch('companyOuId');
  const formValueDefinition = watch('valueDefinition');

  useEffect(() => {
    if (!open) return;
    if (entitlement) {
      reset(mapEntitlementToForm(entitlement));
    } else {
      reset({
        ...defaultValues,
        companyOuId: companiesData?.[0]?.id ?? '',
      });
    }
  }, [open, reset, companiesData, entitlement]);

  useEffect(() => {
    if (companiesData?.length && !formCompanyOuId && open && !entitlement) {
      setValue('companyOuId', companiesData[0].id);
    }
  }, [companiesData, formCompanyOuId, setValue, open, entitlement]);

  const onSubmit = async (data: EntitlementFormValues) => {
    const payload = {
      companyOuId: data.companyOuId,
      name: data.name,
      type: data.type,
      valueDefinition: data.valueDefinition,
      frequency: data.frequency,
      accessBasedOn: data.accessBasedOn,
      assignment: data.assignment,
      amount: data.amount,
      currency: data.currency,
      status: entitlement?.status || 'active',
    };

    try {
      const result = entitlement
        ? await updateMutation.mutateAsync({ id: entitlement.id, input: payload })
        : await createMutation.mutateAsync(payload);

      if (result && !result.success) {
        toast({
          title: t('saveError', { defaultValue: 'Failed to save entitlement' }),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('saveSuccess', { defaultValue: 'Entitlement saved successfully' }),
      });
      onOpenChange(false);
    } catch {
      toast({
        title: t('saveError', { defaultValue: 'Failed to save entitlement' }),
        variant: 'destructive',
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const companyOptions = companiesData?.map((c) => ({ label: c.name, value: c.id })) || [];

  const typeOptions = [
    { label: t('typeBonus', { defaultValue: 'Bonus' }), value: EntitlementType.BONUS },
    { label: t('typeAllowance', { defaultValue: 'Allowance' }), value: EntitlementType.ALLOWANCE },
    { label: t('typeStipend', { defaultValue: 'Stipend' }), value: EntitlementType.STIPEND },
    { label: t('typeEquity', { defaultValue: 'Equity' }), value: EntitlementType.EQUITY },
  ];

  const valueDefinitionOptions = [
    { label: t('valFixed', { defaultValue: 'Fixed amount' }), value: EntitlementValueDefinition.FIXED_AMOUNT },
    { label: t('valPercentage', { defaultValue: 'Percentage' }), value: EntitlementValueDefinition.PERCENTAGE },
    { label: t('valFormula', { defaultValue: 'Formula' }), value: EntitlementValueDefinition.FORMULA },
  ];

  const frequencyOptions = [
    { label: t('freqYearly', { defaultValue: 'Yearly' }), value: InsuranceRenewalType.YEARLY },
    { label: t('freqMonthly', { defaultValue: 'Monthly' }), value: InsuranceRenewalType.MONTHLY },
    { label: t('freqQuarterly', { defaultValue: 'Quarterly' }), value: InsuranceRenewalType.QUARTERLY },
  ];

  const accessOptions = [
    { label: t('accessRole', { defaultValue: 'Role' }), value: EntitlementAccessBasis.ROLE },
    { label: t('accessLevel', { defaultValue: 'Level' }), value: EntitlementAccessBasis.LEVEL },
    { label: t('accessTenure', { defaultValue: 'Tenure' }), value: EntitlementAccessBasis.TENURE },
    { label: t('accessPerformance', { defaultValue: 'Performance' }), value: EntitlementAccessBasis.PERFORMANCE },
  ];

  const assignmentOptions = [
    { label: t('assignAll', { defaultValue: 'All employees' }), value: InsuranceAssignment.ALL_EMPLOYEES },
    { label: t('assignIndividual', { defaultValue: 'Specific segment' }), value: InsuranceAssignment.INDIVIDUAL },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="sm:max-w-180 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {entitlement
              ? t('editEntitlement', { defaultValue: 'Edit entitlement' })
              : t('addEntitlement', { defaultValue: 'Add entitlement' })}
          </SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg cursor-pointer">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t('cancel', { defaultValue: 'Cancel' })}</span>
          </SheetClose>
        </SheetHeader>
        <Separator />

        <div className="flex-1 overflow-y-auto no-scrollbar -mx-10 px-10 py-6 bg-slate-50/50 dark:bg-zinc-950/30">
          <form id="add-entitlement-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Card */}
            <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  {t('common.basicInfo', { defaultValue: 'Basic info' })}
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
                <div className="col-span-1 md:col-span-2">
                  <FormSelect
                    id="companyOuId"
                    label={t('setup.selectCompany', { defaultValue: 'Company' })}
                    placeholder={isLoadingCompanies ? t('setup.loadingCompanies', { defaultValue: 'Loading companies...' }) : t('setup.selectCompanyPlaceholder', { defaultValue: 'Select company' })}
                    control={control}
                    name="companyOuId"
                    options={companyOptions}
                    t={t}
                    disabled={isLoadingCompanies}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    {t('name', { defaultValue: 'Entitlement name' })}
                  </Label>
                  <Input
                    id="name"
                    {...register('name', { required: true })}
                    placeholder={t('namePlaceholder', { defaultValue: 'Enter entitlement name' })}
                    className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
                  />
                </div>

                <FormSelect
                  id="type"
                  label={t('type', { defaultValue: 'Type' })}
                  placeholder={t('typePlaceholder', { defaultValue: 'Select type' })}
                  control={control}
                  name="type"
                  options={typeOptions}
                  t={t}
                />
              </div>
            </div>

            {/* Entitlement Details Card */}
            <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  {t('details', { defaultValue: 'Entitlement details' })}
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
                <FormSelect
                  id="valueDefinition"
                  label={t('valueDefinition', { defaultValue: 'Value definition' })}
                  placeholder={t('valDefinitionPlaceholder', { defaultValue: 'Select definition' })}
                  control={control}
                  name="valueDefinition"
                  options={valueDefinitionOptions}
                  t={t}
                />

                <FormSelect
                  id="frequency"
                  label={t('frequency', { defaultValue: 'Frequency' })}
                  placeholder={t('frequencyPlaceholder', { defaultValue: 'Select frequency' })}
                  control={control}
                  name="frequency"
                  options={frequencyOptions}
                  t={t}
                />

                <FormSelect
                  id="accessBasedOn"
                  label={t('accessBasedOn', { defaultValue: 'Access based on' })}
                  placeholder={t('accessPlaceholder', { defaultValue: 'Select basis' })}
                  control={control}
                  name="accessBasedOn"
                  options={accessOptions}
                  t={t}
                />

                <FormSelect
                  id="assignment"
                  label={t('assignment', { defaultValue: 'Assignment' })}
                  placeholder={t('assignmentPlaceholder', { defaultValue: 'Select assignment' })}
                  control={control}
                  name="assignment"
                  options={assignmentOptions}
                  t={t}
                />

                <div className="flex flex-col gap-2">
                  <Label htmlFor="amount" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    {t('amount', { defaultValue: 'Amount' })}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step="0.01"
                    {...register('amount', {
                      valueAsNumber: true,
                      validate: (val) => {
                        if (
                          formValueDefinition === EntitlementValueDefinition.PERCENTAGE &&
                          val !== undefined &&
                          val > 100
                        ) {
                          return t('errors.percentageMax', { defaultValue: 'Percentage cannot exceed 100%' });
                        }
                        return true;
                      },
                    })}
                    placeholder={t('amountPlaceholder', { defaultValue: 'Enter amount' })}
                    className={`bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9 ${
                      errors.amount ? 'border-destructive focus-visible:ring-destructive' : ''
                    }`}
                  />
                  {errors.amount && (
                    <span className="text-xs font-medium text-destructive mt-0.5">
                      {errors.amount.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="currency" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    {t('currency', { defaultValue: 'Currency' })}
                  </Label>
                  <Input
                    id="currency"
                    {...register('currency')}
                    placeholder={t('currencyPlaceholder', { defaultValue: 'e.g. USD' })}
                    className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="border-t border-border pt-4 mt-auto shrink-0 flex flex-row justify-end gap-3 bg-transparent">
          <SheetClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 min-w-25 px-4 font-medium rounded-lg border-muted-foreground/20 text-foreground/80 hover:bg-muted"
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="add-entitlement-form"
            disabled={isPending}
            className="h-9 min-w-37.5 px-4 font-medium rounded-lg bg-primary hover:bg-primary/80 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {entitlement
              ? t('saveChanges', { defaultValue: 'Save changes' })
              : t('save', { defaultValue: 'Save entitlement' })}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddEntitlementSheet;
