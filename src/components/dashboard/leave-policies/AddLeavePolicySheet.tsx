'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import {
  leavePolicySchema,
  leavePolicyDefaultValues,
  type LeavePolicyFormInput,
  type LeavePolicyFormValues,
} from '@/features/leave-policy/schemas/leave-policy.schema';
import {
  useCreateLeavePolicy,
  useLeavePoliciesPaginated,
  useUpdateLeavePolicy,
} from '@/features/leave-policy/hooks/useLeavePolicy';
import { useDocumentCategories } from '@/features/documents/hooks/useDocumentCategories';
import { useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';
import { collectDepartmentsUnderCompany } from '@/features/leave-policy/leave-policy-org.util';
import {
  mapDetailToFormValues,
  mapFormToCreateInput,
  mapFormToUpdateInput,
} from '@/features/leave-policy/leave-policy.mappers';
import type { LeavePolicyDetail } from '@/features/leave-policy/leave-policy.types';
import { useToast } from '@/hooks/use-toast';
import { LeavePolicyFormFields } from './LeavePolicyFormFields';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { FormSelect } from '@/components/ui/FormSelect';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';

interface AddLeavePolicySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyOuId?: string;
  policy?: LeavePolicyDetail | null;
  draftMode?: boolean;
  draftInitialValues?: LeavePolicyFormInput | null;
  onDraftSubmit?: (data: LeavePolicyFormValues) => void;
  existingDraftPolicyCodes?: string[];
}

const AddLeavePolicySheet: React.FC<AddLeavePolicySheetProps> = ({
  open,
  onOpenChange,
  companyOuId,
  policy,
  draftMode = false,
  draftInitialValues,
  onDraftSubmit,
  existingDraftPolicyCodes = [],
}) => {
  const { t, i18n } = useTranslation('dashboard');
  const isRTL = i18n.language === 'ar';
  const isEdit = !!policy?.id;
  const { toast } = useToast();
  const { canSelectCompany, derivedCompanyOuId } = useLeaveCompanyOuId();
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

  const companyForm = useForm({
    defaultValues: {
      companyId: companyOuId ?? derivedCompanyOuId ?? '',
    },
  });
  const sheetCompanyId = useWatch({
    control: companyForm.control,
    name: 'companyId',
  });

  const effectiveCompanyOuId = isEdit
    ? companyOuId
    : sheetCompanyId || companyOuId || derivedCompanyOuId || '';

  useEffect(() => {
    if (!open || isEdit) return;
    if (companyOuId) {
      companyForm.setValue('companyId', companyOuId);
    } else if (companiesData?.length) {
      companyForm.setValue('companyId', derivedCompanyOuId || companiesData[0].id);
    } else if (derivedCompanyOuId) {
      companyForm.setValue('companyId', derivedCompanyOuId);
    }
  }, [open, isEdit, companyOuId, companiesData, derivedCompanyOuId, companyForm]);

  const form = useForm<LeavePolicyFormInput, any, LeavePolicyFormValues>({
    resolver: zodResolver(leavePolicySchema),
    defaultValues: leavePolicyDefaultValues,
  });

  const { data: documentCategories = [] } = useDocumentCategories();
  const { data: hierarchy = [] } = useOrganizationHierarchy();
  const departmentOptions = useMemo(
    () =>
      effectiveCompanyOuId
        ? collectDepartmentsUnderCompany(hierarchy, effectiveCompanyOuId)
        : [],
    [hierarchy, effectiveCompanyOuId],
  );

  const { mutateAsync: createPolicy, isPending: isCreating } =
    useCreateLeavePolicy(effectiveCompanyOuId);
  const { mutateAsync: updatePolicy, isPending: isUpdating } = useUpdateLeavePolicy(companyOuId);
  const isPending = !draftMode && (isCreating || isUpdating);

  const { data: compOffPolicyData } = useLeavePoliciesPaginated(
    draftMode ? undefined : effectiveCompanyOuId,
    { isCompOffPolicy: true },
    { page: 1, pageSize: 1 },
  );
  const compOffPolicyBlocked = useMemo(() => {
    if (draftMode) {
      const editingCompOff =
        draftInitialValues?.isCompOffPolicy ?? draftInitialValues?.code === 'comp_off';
      const hasCompOff = existingDraftPolicyCodes.includes('comp_off');
      if (editingCompOff) return false;
      return hasCompOff;
    }
    if (!compOffPolicyData) return false;
    if (isEdit && policy?.isCompOffPolicy) {
      return compOffPolicyData.totalCount > 1;
    }
    return compOffPolicyData.totalCount > 0;
  }, [
    compOffPolicyData,
    draftInitialValues,
    draftMode,
    existingDraftPolicyCodes,
    isEdit,
    policy?.isCompOffPolicy,
  ]);

  useEffect(() => {
    if (!open) return;
    if (draftMode && draftInitialValues) {
      form.reset(draftInitialValues);
      return;
    }
    if (policy) {
      form.reset(mapDetailToFormValues(policy));
    } else {
      form.reset(leavePolicyDefaultValues);
    }
  }, [open, policy, draftInitialValues, draftMode, form]);

  const onSubmit = async (data: LeavePolicyFormValues) => {
    if (draftMode && onDraftSubmit) {
      onDraftSubmit(data);
      onOpenChange(false);
      form.reset(leavePolicyDefaultValues);
      return;
    }

    if (!effectiveCompanyOuId) {
      toast({
        title: t('addLeavePolicy.createError'),
        description: t('setup.selectCompanyPlaceholder'),
        variant: 'destructive',
      });
      return;
    }
    try {
      if (isEdit && policy) {
        await updatePolicy({ id: policy.id, input: mapFormToUpdateInput(data) });
        toast({
          title: t('addLeavePolicy.updatedSuccessTitle', { defaultValue: 'Policy updated' }),
          description: t('addLeavePolicy.updatedSuccessMsg', {
            defaultValue: 'Leave policy saved successfully.',
          }),
        });
      } else {
        const payload = await createPolicy(mapFormToCreateInput(data, effectiveCompanyOuId));
        toast({
          title: t('addLeavePolicy.createdSuccessTitle'),
          description: t('addLeavePolicy.createdSuccessMsg'),
        });
        const { balanceSeed } = payload;
        if (!data.isCompOffPolicy && balanceSeed.success && balanceSeed.seededCount > 0) {
          toast({
            title: t('addLeavePolicy.balanceSeedSuccessTitle'),
            description: t('addLeavePolicy.balanceSeedSuccessMsg', {
              count: balanceSeed.seededCount,
            }),
          });
        } else if (!data.isCompOffPolicy && balanceSeed.success && balanceSeed.seededCount === 0) {
          toast({
            title: t('addLeavePolicy.balanceSeedNoEmployeesTitle'),
            description: t('addLeavePolicy.balanceSeedNoEmployeesMsg'),
            variant: 'destructive',
          });
        } else if (!data.isCompOffPolicy && !balanceSeed.success) {
          toast({
            title: t('addLeavePolicy.balanceSeedFailedTitle'),
            description:
              balanceSeed.message ?? t('addLeavePolicy.balanceSeedFailedMsg'),
            variant: 'destructive',
          });
        }
      }
      onOpenChange(false);
      form.reset(leavePolicyDefaultValues);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: isEdit
          ? t('addLeavePolicy.updateError', { defaultValue: 'Update failed' })
          : t('addLeavePolicy.createError'),
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRTL ? 'left' : 'right'}
        showCloseButton={false}
        className="w-full sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {draftMode
              ? draftInitialValues
                ? t('addLeavePolicy.editTitle', 'Edit leave policy')
                : t('addLeavePolicy.title')
              : isEdit
                ? t('addLeavePolicy.editTitle', 'Edit leave policy')
                : t('addLeavePolicy.title')}
          </SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-foreground/80 h-9 w-11 flex justify-center items-center">
            <X className="h-5 w-5" strokeWidth={1.33} />
          </SheetClose>
        </SheetHeader>
        <Separator />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Form {...form}>
            <form id="leave-policy-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {!draftMode && !isEdit && canSelectCompany && (
                <FormSelect<{ companyId: string }>
                  id="policy-company-selector"
                  label={t('setup.selectCompanyPlaceholder', 'Company')}
                  placeholder={
                    isLoadingCompanies
                      ? t('setup.loadingCompanies')
                      : t('setup.selectCompanyPlaceholder')
                  }
                  control={companyForm.control}
                  name="companyId"
                  t={t}
                  options={
                    companiesData?.map((c) => ({
                      label: c.name,
                      value: c.id,
                    })) ?? []
                  }
                />
              )}
              <LeavePolicyFormFields
                key={draftMode ? draftInitialValues?.code ?? 'draft-create' : policy?.id ?? 'create'}
                control={form.control}
                t={t}
                isRTL={isRTL}
                documentCategories={documentCategories}
                departmentOptions={departmentOptions}
                compOffPolicyBlocked={compOffPolicyBlocked}
                isEditingCompOff={
                  draftMode
                    ? !!draftInitialValues?.isCompOffPolicy
                    : !!policy?.isCompOffPolicy
                }
              />
            </form>
          </Form>
        </div>

        <SheetFooter className="flex flex-row justify-end gap-4 pt-4 border-t">
          <SheetClose asChild>
            <Button variant="outline" className="h-9 min-w-25">
              {t('common.cancel', 'Cancel')}
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="leave-policy-form"
            disabled={isPending || (!draftMode && !effectiveCompanyOuId)}
            className="h-9 min-w-36 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('addLeavePolicy.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddLeavePolicySheet;
