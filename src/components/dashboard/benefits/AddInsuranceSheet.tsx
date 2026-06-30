'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useCreateInsurance, useUpdateInsurance } from '@/features/insurance/hooks/useInsurance';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { Insurance } from '@/features/insurance/insurance.types';
import { useTranslation } from 'react-i18next';
import {
  insuranceFormSchema,
  defaultInsuranceFormValues,
  InsuranceFormValues,
} from './insurance-form.schema';
import { InsuranceFormFields } from './InsuranceFormFields';
import { formatInsuranceFormPayload, mapInsuranceToFormValues } from './insurance-form.utils';

interface AddInsuranceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insurance?: Insurance | null;
}

const AddInsuranceSheet = ({ open, onOpenChange, insurance }: AddInsuranceSheetProps) => {
  const { t } = useTranslation(['insurance']);
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
  const createMutation = useCreateInsurance();
  const updateMutation = useUpdateInsurance();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceFormSchema) as never,
    defaultValues: defaultInsuranceFormValues,
  });

  const formCompanyOuId = watch('ouId');

  useEffect(() => {
    if (!open) return;
    if (insurance) {
      reset(mapInsuranceToFormValues(insurance));
    } else {
      reset({
        ...defaultInsuranceFormValues,
        ouId: companiesData?.[0]?.id ?? '',
      });
    }
  }, [open, insurance, companiesData, reset]);

  useEffect(() => {
    if (!open || !companiesData?.length) return;
    if (insurance) {
      const savedId = insurance.ouId || '';
      setValue('ouId', savedId, { shouldValidate: true });
    } else if (!formCompanyOuId) {
      setValue('ouId', companiesData[0].id, { shouldValidate: true });
    }
  }, [companiesData, formCompanyOuId, insurance, open, setValue]);

  const onSubmit = async (data: InsuranceFormValues) => {
    try {
      const result = insurance
        ? await updateMutation.mutateAsync({
            id: insurance.id,
            input: formatInsuranceFormPayload(data),
          })
        : await createMutation.mutateAsync(formatInsuranceFormPayload(data));

      if (result && !result.success) {
        toast({
          title: 'Error',
          description: result.error || (insurance ? 'Failed to update insurance' : 'Failed to create insurance'),
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Success',
        description: insurance ? 'Insurance updated successfully' : 'Insurance created successfully',
      });
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="sm:max-w-180 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {insurance
              ? t('editTitle', { defaultValue: 'Edit insurance coverage' })
              : t('addTitle', { defaultValue: 'Add an insurance coverage' })}
          </SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg cursor-pointer">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t('cancel', { defaultValue: 'Cancel' })}</span>
          </SheetClose>
        </SheetHeader>
        <Separator />

        <div className="flex-1 overflow-y-auto no-scrollbar -mx-10 px-10 py-6 bg-slate-50/50 dark:bg-zinc-950/30">
          <form id="add-insurance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <InsuranceFormFields
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              companies={companiesData}
              isLoadingCompanies={isLoadingCompanies}
            />
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
            form="add-insurance-form"
            disabled={isPending}
            className="h-9 min-w-37.5 px-4 font-medium rounded-lg bg-primary hover:bg-primary/80 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {insurance
              ? t('updateBtn', { defaultValue: 'Save changes' })
              : t('saveBtn', { defaultValue: 'Save insurance' })}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddInsuranceSheet;
