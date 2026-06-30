'use client';

import { useEffect, useMemo } from 'react';
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
  Control,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSelect } from '@/components/ui/FormSelect';
import { useTranslation } from 'react-i18next';
import { InsuranceFormValues, MIN_TENURE_MONTH_OPTIONS } from './insurance-form.schema';
import {
  InsuranceCoverageType,
  InsuranceRenewalType,
  InsuranceIncludedService,
  DependentRelationship,
  EmploymentType,
} from '@/features/insurance/insurance.types';
import {
  coverageTypeSupportsIncludedServices,
  getIncludedServiceOptionsForCoverageType,
  pruneIncludedServicesForCoverageType,
} from '@/features/insurance/insurance-included-services.util';

const formatEnumLabel = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

interface CompanyOption {
  id: string;
  name: string;
}

interface InsuranceFormFieldsProps {
  control: Control<InsuranceFormValues>;
  register: UseFormRegister<InsuranceFormValues>;
  watch: UseFormWatch<InsuranceFormValues>;
  setValue: UseFormSetValue<InsuranceFormValues>;
  errors: FieldErrors<InsuranceFormValues>;
  companies?: CompanyOption[];
  isLoadingCompanies?: boolean;
}

export function InsuranceFormFields({
  control,
  register,
  watch,
  setValue,
  errors,
  companies,
  isLoadingCompanies,
}: InsuranceFormFieldsProps) {
  const { t } = useTranslation(['insurance']);
  const coverageType = watch('coverageType');
  const hasDependentsCoverage = watch('hasDependentsCoverage');
  const allowedDependents = watch('allowedDependents');
  const includedServices = watch('includedServices') || [];

  const includedServiceOptions = useMemo(
    () => getIncludedServiceOptionsForCoverageType(coverageType),
    [coverageType],
  );

  useEffect(() => {
    const current = watch('includedServices') || [];
    const pruned = pruneIncludedServicesForCoverageType(coverageType, current);
    if (pruned.length !== current.length) {
      setValue('includedServices', pruned, { shouldValidate: true, shouldDirty: true });
    }
  }, [coverageType, setValue, watch]);

  const handleCheckboxChange = (
    field: 'allowedDependents' | 'includedServices',
    value: DependentRelationship | InsuranceIncludedService,
    checked: boolean,
  ) => {
    const currentValues = watch(field) || [];
    if (checked) {
      setValue(field, [...currentValues, value] as InsuranceFormValues[typeof field], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue(
        field,
        currentValues.filter((v) => v !== value) as InsuranceFormValues[typeof field],
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      );
    }
  };

  const companyOptions = companies?.map((c) => ({ label: c.name, value: c.id })) || [];
  const coverageTypeOptions = Object.values(InsuranceCoverageType).map((type) => ({
    label: formatEnumLabel(type),
    value: type,
  }));
  const renewalTypeOptions = Object.values(InsuranceRenewalType).map((val) => ({
    label: formatEnumLabel(val),
    value: val,
  }));
  const employmentTypeOptions = Object.values(EmploymentType).map((type) => ({
    label: formatEnumLabel(type),
    value: type,
  }));
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Insurance info</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
          <div className="col-span-1 md:col-span-2">
            <FormSelect
              id="ouId"
              label="Company"
              placeholder={isLoadingCompanies ? 'Loading companies...' : 'Select company'}
              control={control}
              name="ouId"
              error={errors.ouId}
              options={companyOptions}
              t={t}
              disabled={isLoadingCompanies}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="insuranceName" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Insurance name
            </Label>
            <Input
              {...register('insuranceName')}
              placeholder="Enter insurance name"
              className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
            />
            {errors.insuranceName && (
              <span className="text-xs text-destructive">{errors.insuranceName.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="providerName" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Insurance provider
            </Label>
            <Input
              {...register('providerName')}
              placeholder="Enter provider name"
              className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
            />
            {errors.providerName && (
              <span className="text-xs text-destructive">{errors.providerName.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="policyNumber" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Policy number
            </Label>
            <Input
              {...register('policyNumber')}
              placeholder="Enter policy number"
              className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
            />
            {errors.policyNumber && (
              <span className="text-xs text-destructive">{errors.policyNumber.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cardId" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Card ID (optional)
            </Label>
            <Input
              {...register('cardId')}
              placeholder="Enter card ID"
              className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
            />
          </div>
        </div>
      </div>

      <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Coverage details</h3>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-950/40 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              id="coverageType"
              label="Coverage type"
              placeholder="Select type"
              control={control}
              name="coverageType"
              error={errors.coverageType}
              options={coverageTypeOptions}
              t={t}
            />

            <div className="flex flex-col gap-2">
              <Label htmlFor="coverageAmount" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                Coverage amount
              </Label>
              <Input
                type="number"
                {...register('coverageAmount', { valueAsNumber: true })}
                placeholder="Enter amount"
                className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
              />
            </div>

            <FormSelect
              id="renewalType"
              label="Renewal Type"
              placeholder="Select renewal"
              control={control}
              name="renewalType"
              error={errors.renewalType}
              options={renewalTypeOptions}
              t={t}
            />
          </div>

          <div className="flex items-center gap-2 py-2 border-t border-slate-100 dark:border-zinc-900 pt-4">
            <Switch
              id="hasDependentsCoverage"
              checked={hasDependentsCoverage}
              onCheckedChange={(checked) => {
                setValue('hasDependentsCoverage', checked, { shouldDirty: true });
                if (checked && !watch('maxDependents')) {
                  setValue('maxDependents', 4, { shouldDirty: true });
                }
              }}
            />
            <Label htmlFor="hasDependentsCoverage" className="font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">
              Dependents Coverage
            </Label>
          </div>

          {hasDependentsCoverage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 border-t border-slate-100 dark:border-zinc-900 pt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="maxDependents" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  Max dependents
                </Label>
                <Input
                  type="number"
                  {...register('maxDependents', { valueAsNumber: true })}
                  placeholder="2"
                  className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-6">
                {Object.values(DependentRelationship).map((rel) => (
                  <div key={rel} className="flex items-center gap-2">
                    <Checkbox
                      id={`rel-${rel}`}
                      checked={allowedDependents.includes(rel)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('allowedDependents', rel, !!checked)
                      }
                    />
                    <Label htmlFor={`rel-${rel}`} className="text-sm font-normal capitalize text-slate-600 dark:text-zinc-400 cursor-pointer">
                      {rel.toLowerCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {coverageTypeSupportsIncludedServices(coverageType) ? (
            <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-zinc-900 pt-4">
              <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                Included services
              </Label>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {includedServiceOptions.map((service) => (
                  <div key={service.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`service-${service.value}`}
                      checked={includedServices.includes(service.value)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('includedServices', service.value, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`service-${service.value}`}
                      className="text-sm font-normal text-slate-600 dark:text-zinc-400 cursor-pointer"
                    >
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Eligibility Rules</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
          <FormSelect
            id="employmentType"
            label="Employment type"
            placeholder="Select employment type"
            control={control}
            name="employmentType"
            error={errors.employmentType}
            options={employmentTypeOptions}
            t={t}
          />

          <FormSelect
            id="minTenureMonths"
            label="Minimum tenure"
            placeholder="Select minimum tenure"
            control={control}
            name="minTenureMonths"
            error={errors.minTenureMonths}
            options={[...MIN_TENURE_MONTH_OPTIONS]}
            t={t}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="employerContribution" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Employer Contribution
            </Label>
            <div className="relative flex items-center">
              <Input
                id="employerContribution"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                {...register('employerContribution', {
                  onChange: (e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    const val = cleaned ? Math.min(100, Number(cleaned)) : 0;
                    e.target.value = val.toString();
                    setValue('employerContribution', val, { shouldValidate: true, shouldDirty: true });
                    setValue('employeeContribution', 100 - val, { shouldValidate: true, shouldDirty: true });
                  },
                })}
                placeholder="100"
                className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9 pr-10"
              />
              <span className="absolute right-3 text-sm font-semibold text-muted-foreground select-none">%</span>
            </div>
            {errors.employerContribution && (
              <span className="text-xs text-destructive">{errors.employerContribution.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="employeeContribution" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Employee Contribution
            </Label>
            <div className="relative flex items-center">
              <Input
                id="employeeContribution"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                {...register('employeeContribution', {
                  onChange: (e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    const val = cleaned ? Math.min(100, Number(cleaned)) : 0;
                    e.target.value = val.toString();
                    setValue('employeeContribution', val, { shouldValidate: true, shouldDirty: true });
                    setValue('employerContribution', 100 - val, { shouldValidate: true, shouldDirty: true });
                  },
                })}
                placeholder="0"
                className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9 pr-10"
              />
              <span className="absolute right-3 text-sm font-semibold text-muted-foreground select-none">%</span>
            </div>
            {errors.employeeContribution && (
              <span className="text-xs text-destructive">{errors.employeeContribution.message}</span>
            )}
          </div>
        </div>
      </div>

      <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Policy period</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
          <div className="flex flex-col gap-2">
            <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Start date
            </Label>
            <Input
              type="date"
              {...register('startDate')}
              className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
            />
            {errors.startDate && (
              <span className="text-xs text-destructive">{errors.startDate.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              End date
            </Label>
            <Input
              type="date"
              {...register('endDate')}
              className="bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 h-9"
            />
            {errors.endDate && (
              <span className="text-xs text-destructive">{errors.endDate.message}</span>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <FormSelect
              id="status"
              label="Status"
              placeholder="Select status"
              control={control}
              name="status"
              error={errors.status}
              options={statusOptions}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
