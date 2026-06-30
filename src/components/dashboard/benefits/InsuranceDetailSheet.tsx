'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Insurance } from '@/features/insurance/insurance.types';
import { useTranslation } from 'react-i18next';

interface InsuranceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insurance: Insurance | null;
}

const InsuranceDetailSheet = ({
  open,
  onOpenChange,
  insurance,
}: InsuranceDetailSheetProps) => {
  const { t } = useTranslation(['insurance']);

  if (!insurance) return null;

  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="sm:max-w-180 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {insurance.insuranceName}
          </SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg cursor-pointer">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        <Separator />

        <div className="flex-1 overflow-y-auto no-scrollbar -mx-10 px-10 py-6 bg-slate-50/50 dark:bg-zinc-950/30 space-y-6">
            <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  {t('detail.info', { defaultValue: 'Insurance info' })}
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.name', { defaultValue: 'Insurance name' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                    {insurance.insuranceName}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.provider', { defaultValue: 'Insurance provider' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                    {insurance.providerName}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  {t('detail.coverage', { defaultValue: 'Coverage details' })}
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.coverageType', { defaultValue: 'Coverage type' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1 capitalize">
                    {t(`detail.coverageTypes.${insurance.coverageType.toLowerCase()}`, {
                      defaultValue: insurance.coverageType.toLowerCase().replace('_', ' '),
                    })}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.coverageAmount', { defaultValue: 'Coverage amount' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                    {formatAmount(insurance.coverageAmount)}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.assignedTo', { defaultValue: 'Assigned to' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1 capitalize">
                    {t(`detail.assignments.${insurance.assignment.toLowerCase()}`, {
                      defaultValue: insurance.assignment.toLowerCase().replace('_', ' '),
                    })}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.renewalType', { defaultValue: 'Renewal type' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1 capitalize">
                    {t(`detail.renewals.${insurance.renewalType.toLowerCase()}`, {
                      defaultValue: insurance.renewalType.toLowerCase().replace('_', ' '),
                    })}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.maxDependents', { defaultValue: 'Max dependents' })}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                      {insurance.maxDependents ?? 0}
                    </span>
                    {insurance.allowedDependents?.map((dep) => (
                      <Badge
                        key={dep}
                        variant="outline"
                        className="bg-slate-100/80 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-semibold px-2.5 py-0.5 rounded border-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      >
                        {t(`detail.dependents.${dep.toLowerCase()}`, {
                          defaultValue: dep.toLowerCase().replace('_', ' '),
                        })}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.includedServices', { defaultValue: 'Included services' })}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {insurance.includedServices?.map((service) => (
                      <Badge
                        key={service}
                        variant="outline"
                        className="bg-slate-100/80 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-semibold px-2.5 py-0.5 rounded border-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      >
                        {t(`detail.services.${service.toLowerCase()}`, {
                          defaultValue: service.toLowerCase().replace('_', ' '),
                        })}
                      </Badge>
                    ))}
                    {(!insurance.includedServices || insurance.includedServices.length === 0) && (
                      <span className="text-sm text-slate-400 dark:text-zinc-600">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  {t('detail.eligibility', { defaultValue: 'Eligibility Rules' })}
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.employmentType', { defaultValue: 'Employment type' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1 capitalize">
                    {insurance.employmentType
                      ? t(`detail.employmentTypes.${insurance.employmentType.toLowerCase()}`, {
                          defaultValue: insurance.employmentType.toLowerCase().replace('_', ' '),
                        })
                      : '-'}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.minTenure', { defaultValue: 'Minimum tenure' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                    {insurance.minTenureMonths
                      ? `${insurance.minTenureMonths} ${t('detail.months', { defaultValue: 'months' })}`
                      : '-'}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.employerContribution', { defaultValue: 'Employer Contribution' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                    {insurance.employerContribution !== undefined ? `${insurance.employerContribution}%` : '-'}
                  </div>
                </div>

                <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {t('detail.labels.employeeContribution', { defaultValue: 'Employee Contribution' })}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                    {insurance.employeeContribution !== undefined ? `${insurance.employeeContribution}%` : '-'}
                  </div>
                </div>
              </div>
            </div>
        </div>

        <SheetFooter className="border-t border-border pt-4 mt-auto shrink-0 flex flex-row justify-end gap-3 bg-transparent">
          <SheetClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 min-w-25 px-4 font-medium rounded-lg border-muted-foreground/20 text-foreground/80 hover:bg-muted"
            >
              {t('cancel', { defaultValue: 'Close' })}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default InsuranceDetailSheet;
