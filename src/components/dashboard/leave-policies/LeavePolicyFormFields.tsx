'use client';

import React, { useEffect, useMemo } from 'react';
import { Control, useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/FormSelect';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSection } from '@/components/ui/form-section';
import { cn } from '@/lib/utils';
import {
  bindOptionalNumberInput,
  bindPositiveOptionalNumberInput,
  handleNonNegativeNumberChange,
  nonNegativeNumberInputProps,
} from '@/lib/non-negative-number-input';
import type { LeavePolicyFormInput, LeavePolicyFormValues } from '@/features/leave-policy/schemas/leave-policy.schema';
import { LEAVE_POLICY_CODE_OPTIONS } from '@/features/leave-policy/leave-policy.types';
import type { TFunction } from 'i18next';

interface DocumentCategoryOption {
  id: string;
  name: string;
}

const PRIMARY_SWITCH_CLASS =
  'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted';

interface LeavePolicyFormFieldsProps {
  control: Control<LeavePolicyFormInput, any, LeavePolicyFormValues>;
  t: TFunction<'dashboard', undefined>;
  isRTL: boolean;
  departmentOptions: { id: string; name: string }[];
  documentCategories: DocumentCategoryOption[];
  readOnly?: boolean;
  compOffPolicyBlocked?: boolean;
  isEditingCompOff?: boolean;
}

export function LeavePolicyFormFields({
  control,
  t,
  isRTL,
  departmentOptions,
  documentCategories,
  readOnly = false,
  compOffPolicyBlocked = false,
  isEditingCompOff = false,
}: LeavePolicyFormFieldsProps) {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<LeavePolicyFormInput, any, LeavePolicyFormValues>();
  const paidLeave = useWatch({ control, name: 'paidLeave' });
  const payType = useWatch({ control, name: 'payType' });
  const carryForward = useWatch({ control, name: 'carryForward' });
  const applyTo = useWatch({ control, name: 'applyTo' });
  const requireAttachment = useWatch({ control, name: 'requireAttachment' });
  const compoundingEnabled = useWatch({ control, name: 'compoundingEnabled' });
  const entitlementGrantMode = useWatch({ control, name: 'entitlementGrantMode' });
  const isCompOffPolicy = useWatch({ control, name: 'isCompOffPolicy' });
  const compOffToggleDisabled =
    readOnly || compOffPolicyBlocked || isEditingCompOff;

  useEffect(() => {
    if (!isCompOffPolicy) return;
    setValue('maxDaysPerYear', 0);
    setValue('entitlementGrantMode', 'Manual');
    setValue('grantRatePerPeriod', '');
    setValue('carryForward', false);
    setValue('compoundingEnabled', false);
    setValue('compoundingDays', '');
    setValue('compoundingYears', '');
  }, [isCompOffPolicy, setValue]);

  const codeOptions = useMemo(
    () =>
      LEAVE_POLICY_CODE_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [],
  );

  const grantModeOptions = useMemo(() => {
    const options = [{ label: t('addLeavePolicy.options.manual'), value: 'Manual' }];
    if (!isCompOffPolicy) {
      options.unshift(
        { label: t('addLeavePolicy.options.monthlyAccrual'), value: 'Monthly accrual' },
        { label: t('addLeavePolicy.options.yearlyAllocation'), value: 'Yearly allocation' },
      );
    }
    return options;
  }, [isCompOffPolicy, t]);

  const usageLimitScopeOptions = useMemo(
    () => [
      { label: t('addLeavePolicy.options.perCalendarYear'), value: 'Per calendar year' },
      { label: t('addLeavePolicy.options.oncePerLifetime'), value: 'Once per lifetime' },
    ],
    [t],
  );

  const carryForwardDaysOptions = useMemo(
    () => [
      { label: t('addLeavePolicy.options.days5'), value: '5' },
      { label: t('addLeavePolicy.options.days10'), value: '10' },
      { label: t('addLeavePolicy.options.days15'), value: '15' },
    ],
    [t],
  );

  const expiryPeriodOptions = useMemo(
    () => [
      { label: t('addLeavePolicy.options.months3'), value: '3 months' },
      { label: t('addLeavePolicy.options.months6'), value: '6 months' },
      { label: t('addLeavePolicy.options.months12'), value: '12 months' },
    ],
    [t],
  );

  const applyToOptions = useMemo(
    () => [
      { label: t('addLeavePolicy.options.allDepartments'), value: 'All departments' },
      { label: t('addLeavePolicy.options.specificDepartments'), value: 'Specific departments' },
    ],
    [t],
  );

  const attachmentConditionOptions = useMemo(
    () => [
      { label: t('addLeavePolicy.options.alwaysRequire'), value: 'Always require' },
      { label: t('addLeavePolicy.options.whenDurationGt3'), value: 'When duration > 3 days' },
    ],
    [t],
  );

  const documentCategoryOptions = useMemo(
    () =>
      documentCategories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [documentCategories],
  );

  const payTypeOptions = useMemo(
    () => [
      { label: t('addLeavePolicy.options.fullPay'), value: 'Full pay' },
      { label: t('addLeavePolicy.options.partialPay'), value: 'Partial pay' },
    ],
    [t],
  );

  const deductFromSalaryOptions = useMemo(
    () => [
      { label: t('addLeavePolicy.options.deduct'), value: 'Deduct' },
      { label: t('addLeavePolicy.options.noDeduction'), value: 'No deduction' },
    ],
    [t],
  );

  return (
    <div className="space-y-8">
      <FormSection title={t('addLeavePolicy.sections.policyInfo')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormField
            control={control}
            name="policyName"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('addLeavePolicy.fields.policyName')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('addLeavePolicy.placeholders.policyName')}
                    disabled={readOnly}
                    {...field}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect<LeavePolicyFormInput>
            id="leave-policy-code"
            label={t('addLeavePolicy.fields.code')}
            placeholder={t('addLeavePolicy.fields.code')}
            control={control}
            name="code"
            error={errors.code}
            options={codeOptions}
            disabled={readOnly}
            t={t}
          />
        </div>
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('addLeavePolicy.fields.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('addLeavePolicy.placeholders.description')}
                  disabled={readOnly}
                  {...field}
                  className="min-h-[110px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="isCompOffPolicy"
          render={({ field }) => (
            <FormItem className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-row items-center justify-between">
                <FormLabel>{t('addLeavePolicy.fields.isCompOffPolicy')}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={compOffToggleDisabled}
                    className={PRIMARY_SWITCH_CLASS}
                  />
                </FormControl>
              </div>
              {isCompOffPolicy && (
                <p className="text-sm text-muted-foreground">
                  {t('addLeavePolicy.fields.compOffPolicyHint')}
                </p>
              )}
              {compOffPolicyBlocked && !isEditingCompOff && (
                <p className="text-sm text-muted-foreground">
                  {t('addLeavePolicy.fields.compOffPolicyExists')}
                </p>
              )}
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection title={t('addLeavePolicy.sections.entitlementRules')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormField
            control={control}
            name="maxDaysPerYear"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('addLeavePolicy.fields.maxDays')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={readOnly || isCompOffPolicy}
                    {...nonNegativeNumberInputProps}
                    {...field}
                    value={isCompOffPolicy ? 0 : field.value}
                    onChange={(e) => handleNonNegativeNumberChange(field.onChange, e, 0)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect<LeavePolicyFormInput>
            id="leave-policy-grant-mode"
            label={t('addLeavePolicy.fields.entitlementGrantMode')}
            placeholder={t('addLeavePolicy.fields.entitlementGrantMode')}
            control={control}
            name="entitlementGrantMode"
            error={errors.entitlementGrantMode}
            options={grantModeOptions}
            disabled={readOnly || isCompOffPolicy}
            t={t}
          />
        </div>
        {!isCompOffPolicy && entitlementGrantMode === 'Monthly accrual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <FormField
              control={control}
              name="grantRatePerPeriod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('addLeavePolicy.fields.grantRatePerPeriod')}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={readOnly}
                      {...bindOptionalNumberInput(field, 0.01)}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormSelect<LeavePolicyFormInput>
            id="leave-policy-usage-limit-scope"
            label={t('addLeavePolicy.fields.usageLimitScope')}
            placeholder={t('addLeavePolicy.fields.usageLimitScope')}
            control={control}
            name="usageLimitScope"
            error={errors.usageLimitScope}
            options={usageLimitScopeOptions}
            disabled={readOnly}
            t={t}
          />
        </div>
        {!isCompOffPolicy && (
        <FormField
          control={control}
          name="compoundingEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <FormLabel>{t('addLeavePolicy.fields.compoundingEnabled')}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={readOnly}
                  className={PRIMARY_SWITCH_CLASS}
                />
              </FormControl>
            </FormItem>
          )}
        />
        )}
        {!isCompOffPolicy && compoundingEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <FormField
              control={control}
              name="compoundingDays"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('addLeavePolicy.fields.compoundingDays')}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={readOnly}
                      {...bindPositiveOptionalNumberInput(field)}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="compoundingYears"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('addLeavePolicy.fields.compoundingYears')}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={readOnly}
                      {...bindPositiveOptionalNumberInput(field)}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {!isCompOffPolicy && carryForward && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <FormField
              control={control}
              name="maxCarryForwardDays"
              render={({ field, fieldState }) => (
                <FormSelect
                  id="leave-policy-max-carry-forward"
                  label={t('addLeavePolicy.fields.maxCarryForward')}
                  placeholder={t('addLeavePolicy.fields.maxCarryForward')}
                  value={field.value?.toString()}
                  onChange={(value) => field.onChange(Number(value))}
                  error={fieldState.error}
                  options={carryForwardDaysOptions}
                  disabled={readOnly}
                  t={t}
                />
              )}
            />
            <FormSelect<LeavePolicyFormInput>
              id="leave-policy-expiry-period"
              label={t('addLeavePolicy.fields.expiryPeriod')}
              placeholder={t('addLeavePolicy.fields.expiryPeriod')}
              control={control}
              name="expiryPeriod"
              error={errors.expiryPeriod}
              options={expiryPeriodOptions}
              disabled={readOnly}
              t={t}
            />
          </div>
        )}
        {!isCompOffPolicy && (
        <FormField
          control={control}
          name="carryForward"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={readOnly}
                  className={PRIMARY_SWITCH_CLASS}
                />
              </FormControl>
              <FormLabel className="cursor-pointer">{t('addLeavePolicy.fields.carryForward')}</FormLabel>
            </FormItem>
          )}
        />
        )}
      </FormSection>

      <FormSection title={t('addLeavePolicy.sections.requestRules')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormField
            control={control}
            name="minDaysPerRequest"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('addLeavePolicy.fields.minDayPerRequest')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={readOnly}
                    {...bindOptionalNumberInput(field)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="maxDaysPerRequest"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('addLeavePolicy.fields.maxDaysPerRequest')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={readOnly}
                    {...bindOptionalNumberInput(field)}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormField
            control={control}
            name="noticePeriod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('addLeavePolicy.fields.noticePeriod')}</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      disabled={readOnly}
                      {...bindOptionalNumberInput(field)}
                      className={cn('h-9', isRTL ? 'pl-20 pr-3' : 'pr-20 pl-3')}
                    />
                  </FormControl>
                  <div
                    className={cn(
                      'absolute inset-y-0 flex items-center px-4 pointer-events-none text-xs text-muted-foreground bg-border border-y border-border',
                      isRTL ? 'left-0 rounded-l-lg border-l' : 'right-0 rounded-r-lg border-r',
                    )}
                  >
                    {t('addLeavePolicy.placeholders.noticePeriod')}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect<LeavePolicyFormInput>
            id="leave-policy-apply-to"
            label={t('addLeavePolicy.fields.applyTo')}
            placeholder={t('addLeavePolicy.fields.applyTo')}
            control={control}
            name="applyTo"
            error={errors.applyTo}
            options={applyToOptions}
            disabled={readOnly}
            t={t}
          />
        </div>
        {applyTo === 'Specific departments' && (
          <FormField
            control={control}
            name="departmentIds"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('addLeavePolicy.fields.departments', 'Departments')}</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {departmentOptions.map((dept) => {
                    const checked = (field.value ?? []).includes(dept.id);
                    return (
                      <label
                        key={dept.id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={checked}
                          disabled={readOnly}
                          onCheckedChange={(v) => {
                            const next = new Set(field.value ?? []);
                            if (v) next.add(dept.id);
                            else next.delete(dept.id);
                            field.onChange(Array.from(next));
                          }}
                        />
                        <span>{dept.name}</span>
                      </label>
                    );
                  })}
                  {departmentOptions.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-2">
                      {t('addLeavePolicy.options.noDepartments', 'No departments found')}
                    </p>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </FormSection>

      <FormSection title={t('addLeavePolicy.sections.documentation')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <FormField
            control={control}
            name="requireAttachment"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 h-9">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={readOnly}
                    className={PRIMARY_SWITCH_CLASS}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">
                  {t('addLeavePolicy.fields.requireAttachment')}
                </FormLabel>
              </FormItem>
            )}
          />
          {requireAttachment && (
            <>
              <FormSelect<LeavePolicyFormInput>
                id="leave-policy-attachment-condition"
                label={t('addLeavePolicy.fields.condition')}
                placeholder={t('addLeavePolicy.fields.condition')}
                control={control}
                name="attachmentCondition"
                error={errors.attachmentCondition}
                options={attachmentConditionOptions}
                disabled={readOnly}
                t={t}
              />
              <FormSelect<LeavePolicyFormInput>
                id="leave-policy-document-category"
                label={t('addLeavePolicy.fields.documentCategory')}
                placeholder={t('addLeavePolicy.placeholders.documentCategory')}
                control={control}
                name="requiredDocumentCategoryId"
                error={errors.requiredDocumentCategoryId}
                options={documentCategoryOptions}
                disabled={readOnly || documentCategoryOptions.length === 0}
                containerClassName="md:col-span-2"
                t={t}
              />
            </>
          )}
        </div>
      </FormSection>

      <FormSection title={t('addLeavePolicy.sections.payrollImpact')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <FormField
            control={control}
            name="paidLeave"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0 h-9">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={readOnly}
                    className={PRIMARY_SWITCH_CLASS}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">{t('addLeavePolicy.fields.paidLeave')}</FormLabel>
              </FormItem>
            )}
          />
          {paidLeave ? (
            <FormSelect<LeavePolicyFormInput>
              id="leave-policy-pay-type"
              label={t('addLeavePolicy.fields.payType')}
              placeholder={t('addLeavePolicy.fields.payType')}
              control={control}
              name="payType"
              error={errors.payType}
              options={payTypeOptions}
              disabled={readOnly}
              t={t}
            />
          ) : (
            <FormSelect<LeavePolicyFormInput>
              id="leave-policy-deduct-from-salary"
              label={t('addLeavePolicy.fields.deductFromSalary')}
              placeholder={t('addLeavePolicy.fields.deductFromSalary')}
              control={control}
              name="deductFromSalary"
              error={errors.deductFromSalary}
              options={deductFromSalaryOptions}
              disabled={readOnly}
              t={t}
            />
          )}
        </div>
        {paidLeave && payType === 'Partial pay' && (
          <div className="border border-border rounded-lg p-3 space-y-4">
            <h4 className="text-sm font-semibold text-foreground/80">
              {t('addLeavePolicy.fields.setTierRules')}
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
              {(['fullPayDays', 'halfPayDays', 'noPayDays'] as const).map((name) => (
                <FormField
                  key={name}
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-3">
                      <FormLabel>
                        {t(
                          `addLeavePolicy.fields.${name === 'noPayDays' ? 'noPay' : name === 'fullPayDays' ? 'fullPay' : 'halfPay'}`,
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={readOnly}
                          {...bindOptionalNumberInput(field)}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </FormSection>
    </div>
  );
}
