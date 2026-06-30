'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import {
  leavePolicyDefaultValues,
  LeavePolicyFormValues,
  type LeavePolicyFormInput,
} from '@/features/leave-policy/schemas/leave-policy.schema';
import { useLeavePolicy } from '@/features/leave-policy/hooks/useLeavePolicy';
import { useDocumentCategories } from '@/features/documents/hooks/useDocumentCategories';
import { useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';
import { collectDepartmentsUnderCompany } from '@/features/leave-policy/leave-policy-org.util';
import { mapDetailToFormValues } from '@/features/leave-policy/leave-policy.mappers';
import { LeavePolicyFormFields } from './LeavePolicyFormFields';

interface ViewLeavePolicySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyId: string | null;
  companyOuId?: string;
}

export function ViewLeavePolicySheet({
  open,
  onOpenChange,
  policyId,
  companyOuId,
}: ViewLeavePolicySheetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const isRTL = i18n.language === 'ar';
  const { data: policy, isLoading, isError } = useLeavePolicy(policyId ?? '');
  const { data: documentCategories = [] } = useDocumentCategories();
  const { data: hierarchy = [] } = useOrganizationHierarchy();
  const departmentOptions = useMemo(
    () => (companyOuId ? collectDepartmentsUnderCompany(hierarchy, companyOuId) : []),
    [hierarchy, companyOuId],
  );

  const form = useForm<LeavePolicyFormInput,any ,LeavePolicyFormValues >({ defaultValues: leavePolicyDefaultValues });

  useEffect(() => {
    if (!open) {
      form.reset(leavePolicyDefaultValues);
      return;
    }
    if (policy) {
      form.reset(mapDetailToFormValues(policy));
    }
  }, [policy, open, form]);

  const formKey = policy?.id ?? policyId ?? 'empty';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRTL ? 'left' : 'right'}
        showCloseButton={false}
        className="w-full sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {t('leavePolicies.actions.view')}
          </SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-foreground/80 h-9 w-11 flex justify-center items-center">
            <X className="h-5 w-5" />
          </SheetClose>
        </SheetHeader>
        <Separator />
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">{t('leavePolicies.loading', { defaultValue: 'Loading policy...' })}</span>
            </div>
          )}
          {isError && !isLoading && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              {t('leavePolicies.loadError', { defaultValue: 'Failed to load leave policy. Please try again.' })}
            </div>
          )}
          {!isLoading && !isError && policy && (
            <Form {...form}>
              <LeavePolicyFormFields
                key={formKey}
                control={form.control}
                t={t}
                isRTL={isRTL}
                documentCategories={documentCategories}
                departmentOptions={departmentOptions}
                readOnly
              />
            </Form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
