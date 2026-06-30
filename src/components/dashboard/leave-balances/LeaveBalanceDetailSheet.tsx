'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { LeaveBalanceListItem } from '@/features/leave-balance/leave-balance.types';
import { useTranslation } from 'react-i18next';

interface LeaveBalanceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: LeaveBalanceListItem | null;
}

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80">
    <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
      {label}
    </div>
    <div className="text-sm font-medium text-foreground mt-1">{value}</div>
  </div>
);

const LeaveBalanceDetailSheet = ({
  open,
  onOpenChange,
  balance,
}: LeaveBalanceDetailSheetProps) => {
  const { t } = useTranslation('dashboard');

  if (!balance) return null;

  const daysLabel = t('common.table.days', 'days');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="sm:max-w-180 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {t('leaveBalances.actions.view', 'View')}
          </SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg cursor-pointer">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t('leaveRequests.review.close', 'Close')}</span>
          </SheetClose>
        </SheetHeader>
        <Separator />

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          <div className="flex items-center gap-3">
            <Avatar size="default">
              <AvatarImage src={balance.avatar ?? undefined} alt={balance.name} />
              <AvatarFallback className="bg-muted text-xs">
                {balance.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{balance.name}</p>
              <p className="text-sm text-muted-foreground">{balance.leavePolicy}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label={t('leaveBalances.table.year', 'Year')} value={balance.year} />
            <DetailField
              label={t('leaveBalances.table.allocated', 'Allocated')}
              value={`${balance.allocated} ${daysLabel}`}
            />
            <DetailField
              label={t('leaveBalances.table.used', 'Used')}
              value={`${balance.used} ${daysLabel}`}
            />
            <DetailField
              label={t('leaveBalances.table.remaining', 'Remaining')}
              value={`${balance.remaining} ${daysLabel}`}
            />
            <DetailField
              label={t('leaveBalances.table.carriedForward', 'Carried forward')}
              value={`${balance.carriedForward} ${daysLabel}`}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeaveBalanceDetailSheet;
