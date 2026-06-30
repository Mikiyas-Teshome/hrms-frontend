'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import {
  getLeaveBalanceSchema,
  type LeaveBalanceFormValues,
} from '@/features/leave-balance/schemas/leave-balance.schema';
import { LeaveBalanceListItem } from '@/features/leave-balance/leave-balance.types';
import { useUpdateLeaveBalance } from '@/features/leave-balance/hooks/useLeaveBalance';
import { mapLeaveBalanceErrorMessage } from '@/features/leave-balance/leave-balance.errors';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  handleNonNegativeNumberChange,
  nonNegativeNumberInputProps,
} from '@/lib/non-negative-number-input';

interface EditLeaveBalanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance?: LeaveBalanceListItem | null;
}

const SectionCard = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'bg-card border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl pb-6 overflow-hidden',
      className,
    )}
  >
    <div className="bg-card-header-background h-12.5 px-6 flex items-center mb-6 border-b border-border">
      <h3 className="font-semibold text-sm text-foreground leading-3.5">{title}</h3>
    </div>
    <div className="px-6 space-y-6">{children}</div>
  </div>
);

const EditLeaveBalanceSheet: React.FC<EditLeaveBalanceSheetProps> = ({
  open,
  onOpenChange,
  balance,
}) => {
  const { t, i18n } = useTranslation('dashboard');
  const { toast } = useToast();
  const isRTL = i18n.language === 'ar';
  const updateMutation = useUpdateLeaveBalance();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LeaveBalanceFormValues>({
    resolver: zodResolver(getLeaveBalanceSchema(t)) as any,
    defaultValues: {
      allocatedDays: 0,
      usedDays: 0,
      carryForwardDays: 0,
      reason: '',
    },
  });

  const allocatedDays = useWatch({ control: form.control, name: 'allocatedDays' });
  const usedDays = useWatch({ control: form.control, name: 'usedDays' });
  const carryForwardDays = useWatch({ control: form.control, name: 'carryForwardDays' });

  const computedRemaining = useMemo(() => {
    const allocated = Number(allocatedDays) || 0;
    const used = Number(usedDays) || 0;
    const carried = Number(carryForwardDays) || 0;
    return Math.max(0, allocated + carried - used);
  }, [allocatedDays, usedDays, carryForwardDays]);

  useEffect(() => {
    if (balance) {
      form.reset({
        allocatedDays: balance.allocated,
        usedDays: balance.used,
        carryForwardDays: balance.carriedForward,
        reason: '',
      });
    }
  }, [balance, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: LeaveBalanceFormValues) => {
    if (!balance) return;
    setSubmitError(null);

    try {
      const result = await updateMutation.mutateAsync({
        id: balance.id,
        input: {
          allocatedDays: Number(values.allocatedDays),
          usedDays: Number(values.usedDays),
          carriedForwardDays: Number(values.carryForwardDays),
          reason: values.reason,
        },
      });

      if (result && !result.success) {
        const message = mapLeaveBalanceErrorMessage(result.error, t);
        setSubmitError(message);
        toast({
          title: t('leaveBalances.edit.error', 'Failed to update leave balance'),
          description: message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('leaveBalances.edit.success', 'Leave balance updated successfully'),
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      const message = mapLeaveBalanceErrorMessage(
        error instanceof Error ? error.message : undefined,
        t,
      );
      setSubmitError(message);
      toast({
        title: t('leaveBalances.edit.error', 'Failed to update leave balance'),
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (!balance) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isRTL ? 'left' : 'right'}
        showCloseButton={false}
        className="w-full sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-2xl font-bold text-foreground leading-8">
            {t('leaveBalances.edit.title', 'Edit leave balance')}
          </SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-foreground/80 h-9 w-11 flex justify-center items-center">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t('leaveRequests.review.close', 'Close')}</span>
          </SheetClose>
        </SheetHeader>
        <Separator className="bg-border" />

        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {submitError && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {submitError}
            </div>
          )}
          <Form {...form}>
            <form
              id="edit-leave-balance-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <SectionCard title={t('leaveBalances.edit.balanceInfo', 'Balance info')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      {t('leaveBalances.edit.employee', 'Employee')}
                    </p>
                    <Input
                      value={balance.name}
                      readOnly
                      className="h-9 border-border bg-muted/30 shadow-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      {t('leaveBalances.edit.leavePolicy')}
                    </p>
                    <Input
                      value={balance.leavePolicy}
                      readOnly
                      className="h-9 border-border bg-muted/30 shadow-sm"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title={t('leaveBalances.edit.balanceDetails', 'Balance details')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      {t('leaveBalances.edit.year', 'Year')}
                    </p>
                    <Input
                      value={balance.year}
                      readOnly
                      className="h-9 border-border bg-muted/30 shadow-sm"
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="allocatedDays"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {t('leaveBalances.edit.allocatedDays', 'Allocated days')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...nonNegativeNumberInputProps}
                            {...field}
                            onChange={(e) => handleNonNegativeNumberChange(field.onChange, e)}
                            className="h-9 border-border focus:border-brand-600 shadow-sm bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="usedDays"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {t('leaveBalances.edit.usedDays', 'Used days')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...nonNegativeNumberInputProps}
                            {...field}
                            onChange={(e) => handleNonNegativeNumberChange(field.onChange, e)}
                            className="h-9 border-border focus:border-brand-600 shadow-sm bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      {t('leaveBalances.edit.remainingDays', 'Remaining days')}
                    </p>
                    <Input
                      value={computedRemaining}
                      readOnly
                      className="h-9 border-border bg-muted/30 shadow-sm"
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="carryForwardDays"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {t('leaveBalances.edit.carryForwardDays', 'Carry forward days')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...nonNegativeNumberInputProps}
                            {...field}
                            onChange={(e) => handleNonNegativeNumberChange(field.onChange, e)}
                            className="h-9 border-border focus:border-brand-600 shadow-sm bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-foreground">
                        {t('leaveBalances.edit.reason', 'Reason for edit')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('leaveBalances.edit.placeholderReason', 'Add reason')}
                          {...field}
                          className="min-h-27.5 resize-none border-border shadow-sm bg-background focus-visible:ring-0 focus:border-brand-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SectionCard>

              <div className="flex flex-row items-center justify-end gap-6 pt-4 pb-10 w-full">
                <SheetClose asChild>
                  <Button variant="outline" className="h-9 min-w-25">
                    {t('attendance.cancel', 'Cancel')}
                  </Button>
                </SheetClose>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || updateMutation.isPending}
                  className="h-9 min-w-36 px-4 font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  {(form.formState.isSubmitting || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('leaveBalances.edit.saveButton', 'Save changes')}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditLeaveBalanceSheet;