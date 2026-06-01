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
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { BenefitEntitlement } from '@/features/entitlements/entitlements.types';
import { useTranslation } from 'react-i18next';

interface EntitlementDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entitlement: BenefitEntitlement | null;
}

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const EntitlementDetailSheet = ({
  open,
  onOpenChange,
  entitlement,
}: EntitlementDetailSheetProps) => {
  const { t } = useTranslation(['entitlement', 'dashboard']);

  if (!entitlement) return null;

  const formatAmount = () => {
    const definition = entitlement.valueDefinition?.toUpperCase();
    if (definition === 'PERCENTAGE' && entitlement.amount !== undefined) {
      return `${entitlement.amount}%`;
    }
    if (entitlement.amount !== undefined && entitlement.amount !== null) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: entitlement.currency || 'USD',
        maximumFractionDigits: 0,
      }).format(entitlement.amount);
    }
    return formatLabel(entitlement.valueDefinition || '');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="sm:max-w-180 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-foreground">{entitlement.name}</SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg cursor-pointer">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t('cancel', { defaultValue: 'Close' })}</span>
          </SheetClose>
        </SheetHeader>
        <Separator />

        <div className="flex-1 overflow-y-auto no-scrollbar -mx-10 px-10 py-6 bg-slate-50/50 dark:bg-zinc-950/30 space-y-6">
          {/* Basic Info Card */}
          <div className="border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/20 shadow-sm shadow-slate-100/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/60 dark:border-zinc-800 px-6 py-3.5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                {t('common.basicInfo', { defaultValue: 'Basic info' })}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-950/40">
              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('name', { defaultValue: 'Entitlement name' })}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                  {entitlement.name}
                </div>
              </div>

              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('type', { defaultValue: 'Type' })}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                  {formatLabel(entitlement.type)}
                </div>
              </div>

              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('table.status', { defaultValue: 'Status' })}
                </div>
                <div className="mt-1.5 flex items-center">
                  <Badge
                    variant="outline"
                    className={
                      entitlement.status.toLowerCase() === 'active'
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }
                  >
                    <div className={entitlement.status.toLowerCase() === 'active' ? "w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" : "w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"} />
                    {formatLabel(entitlement.status)}
                  </Badge>
                </div>
              </div>
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
              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('table.value', { defaultValue: 'Value' })}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                  {formatAmount()}
                </div>
              </div>

              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('valueDefinition', { defaultValue: 'Value definition' })}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                  {formatLabel(entitlement.valueDefinition)}
                </div>
              </div>

              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('frequency', { defaultValue: 'Frequency' })}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                  {formatLabel(entitlement.frequency)}
                </div>
              </div>

              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('accessBasedOn', { defaultValue: 'Access based on' })}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                  {formatLabel(entitlement.accessBasedOn)}
                </div>
              </div>

              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('assignment', { defaultValue: 'Assignment' })}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                  {formatLabel(entitlement.assignment)}
                </div>
              </div>

              <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-200 dark:hover:border-zinc-800 transition-all duration-200">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {t('currency', { defaultValue: 'Currency' })}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-1">
                  {entitlement.currency}
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

export default EntitlementDetailSheet;
