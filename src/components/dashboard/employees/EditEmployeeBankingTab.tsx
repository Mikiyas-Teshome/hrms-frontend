'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { CreditCard, Loader2, PlusCircle } from 'lucide-react';
import { EDIT_EMPLOYEE_BANK_FORM_ID } from '@/components/dashboard/employees/edit-employee-banking.constants';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ibanValidation, swiftValidation } from '@/lib/validations';
import { BankAccount } from '@/features/bank-account/bank-account.types';
import {
  useBankAccounts,
  useMyBankAccounts,
  useCreateBankAccount,
  useCreateMyBankAccount,
  useUpdateBankAccount,
  useUpdateMyBankAccount,
} from '@/features/bank-account/hooks/useBankAccount';

interface EditEmployeeBankingTabProps {
  employeeId: string;
  useSelfService?: boolean;
}

type BankAccountFormItem = {
  id?: string;
  bankName: string;
  branchName?: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
  iban?: string;
};

type BankingFormValues = {
  accounts: BankAccountFormItem[];
};

const emptyAccount = (): BankAccountFormItem => ({
  bankName: '',
  branchName: '',
  accountName: '',
  accountNumber: '',
  swiftCode: '',
  iban: '',
});

const mapAccountToForm = (account: BankAccount): BankAccountFormItem => ({
  id: account.id,
  bankName: account.bankName ?? '',
  branchName: account.branchName ?? '',
  accountName: account.accountName ?? '',
  accountNumber: account.accountNumber ?? '',
  swiftCode: account.swiftCode ?? '',
  iban: account.iban ?? '',
});

const isAccountEmpty = (account: BankAccountFormItem) =>
  !account.bankName.trim() &&
  !account.accountName.trim() &&
  !account.accountNumber.trim();

function BankAccountFields({
  index,
  register,
  errors,
  onboardingT,
  t,
}: {
  index: number;
  register: UseFormRegister<BankingFormValues>;
  errors: FieldErrors<BankingFormValues>;
  onboardingT: (key: string) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const fieldErrors = errors.accounts?.[index];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <input type="hidden" {...register(`accounts.${index}.id`)} />
      <FormField
        id={`bank-${index}-bankName`}
        label={t('staffSignup:onboarding.bankName')}
        name={`accounts.${index}.bankName`}
        register={register}
        error={fieldErrors?.bankName}
        placeholder={t('staffSignup:onboarding.placeholders.bankName')}
        t={onboardingT}
      />
      <FormField
        id={`bank-${index}-branchName`}
        label={t('staffSignup:onboarding.bankBranch')}
        name={`accounts.${index}.branchName`}
        register={register}
        error={fieldErrors?.branchName}
        placeholder={t('staffSignup:onboarding.placeholders.bankBranch')}
        t={onboardingT}
      />
      <FormField
        id={`bank-${index}-accountName`}
        label={t('staffSignup:onboarding.accountHoldersName')}
        name={`accounts.${index}.accountName`}
        register={register}
        error={fieldErrors?.accountName}
        placeholder={t('staffSignup:onboarding.placeholders.accountName')}
        t={onboardingT}
      />
      <FormField
        id={`bank-${index}-accountNumber`}
        label={t('bankAccountNumber', { defaultValue: 'Bank account number' })}
        name={`accounts.${index}.accountNumber`}
        register={register}
        error={fieldErrors?.accountNumber}
        placeholder={t('staffSignup:onboarding.placeholders.accountNumber')}
        t={onboardingT}
      />
      <FormField
        id={`bank-${index}-swiftCode`}
        label={t('staffSignup:onboarding.swiftCode')}
        name={`accounts.${index}.swiftCode`}
        register={register}
        error={fieldErrors?.swiftCode}
        placeholder={t('staffSignup:onboarding.placeholders.swift')}
        t={onboardingT}
      />
      <FormField
        id={`bank-${index}-iban`}
        label={t('iban', { defaultValue: 'IBAN (optional)' })}
        name={`accounts.${index}.iban`}
        register={register}
        error={fieldErrors?.iban}
        t={(key) => t(key)}
      />
    </div>
  );
}

export function EditEmployeeBankingTab({
  employeeId,
  useSelfService = true,
}: EditEmployeeBankingTabProps) {
  const { t } = useTranslation(['employees', 'staffSignup', 'common']);
  const { toast } = useToast();
  const employeeBankQuery = useBankAccounts(employeeId, {
    enabled: !useSelfService && !!employeeId,
  });
  const myBankQuery = useMyBankAccounts({ enabled: useSelfService });
  const bankAccounts = useMemo(
    () => (useSelfService ? (myBankQuery.data ?? []) : (employeeBankQuery.data ?? [])),
    [useSelfService, myBankQuery.data, employeeBankQuery.data],
  );
  const isLoading = useSelfService ? myBankQuery.isLoading : employeeBankQuery.isLoading;
  const createMyBank = useCreateMyBankAccount();
  const createBankForEmployee = useCreateBankAccount();
  const updateMyBank = useUpdateMyBankAccount();
  const updateBankForEmployee = useUpdateBankAccount();

  const accountItemSchema = useMemo(
    () =>
      z
        .object({
          id: z.string().optional(),
          bankName: z.string(),
          branchName: z.string().optional(),
          accountName: z.string(),
          accountNumber: z.string(),
          iban: ibanValidation(
            t('staffSignup:onboarding.errors.ibanInvalid', { defaultValue: 'Invalid IBAN' }),
          ).optional(),
          swiftCode: swiftValidation(
            t('staffSignup:onboarding.errors.swiftInvalid', { defaultValue: 'Invalid SWIFT' }),
          ).optional(),
        })
        .superRefine((value, ctx) => {
          if (!value.id && isAccountEmpty(value)) {
            return;
          }
          if (!value.bankName.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['bankName'],
              message: t('staffSignup:onboarding.errors.bankNameRequired'),
            });
          }
          if (!value.accountName.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['accountName'],
              message: t('staffSignup:onboarding.errors.accountNameRequired'),
            });
          }
          if (!value.accountNumber.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['accountNumber'],
              message: t('staffSignup:onboarding.errors.accountNumberRequired'),
            });
          }
        }),
    [t],
  );

  const bankingSchema = useMemo(
    () =>
      z.object({
        accounts: z.array(accountItemSchema),
      }),
    [accountItemSchema],
  );

  const form = useForm<BankingFormValues>({
    resolver: zodResolver(bankingSchema),
    defaultValues: { accounts: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'accounts',
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }
    form.reset({
      accounts: bankAccounts.length > 0 ? bankAccounts.map(mapAccountToForm) : [],
    });
  }, [bankAccounts, isLoading, form]);

  const buildPayload = (account: BankAccountFormItem) => ({
    bankName: account.bankName.trim(),
    branchName: account.branchName?.trim() || undefined,
    accountName: account.accountName.trim(),
    accountNumber: account.accountNumber.trim(),
    swiftCode: account.swiftCode?.trim() || undefined,
    iban: account.iban?.trim() || undefined,
  });

  const handleSaveAll = async (data: BankingFormValues) => {
    const entries = data.accounts.filter((account) => account.id || !isAccountEmpty(account));
    if (entries.length === 0) {
      toast({
        title: t('common:error', { defaultValue: 'Error' }),
        description: t('bankingAtLeastOne', { defaultValue: 'Add at least one bank account' }),
        variant: 'destructive',
      });
      return;
    }

    try {
      let createdCount = 0;
      for (const account of entries) {
        const payload = buildPayload(account);
        if (account.id) {
          if (useSelfService) {
            await updateMyBank.mutateAsync({ id: account.id, input: payload });
          } else {
            await updateBankForEmployee.mutateAsync({ id: account.id, input: payload });
          }
        } else {
          const isPrimary = bankAccounts.length === 0 && createdCount === 0;
          if (useSelfService) {
            await createMyBank.mutateAsync({ ...payload, isPrimary });
          } else {
            await createBankForEmployee.mutateAsync({ ...payload, employeeId, isPrimary });
          }
          createdCount += 1;
        }
      }

      toast({
        title: t('bankDetailsSaved', { defaultValue: 'Bank details saved' }),
        variant: 'success',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('saveErrorDesc');
      toast({
        title: t('common:error', { defaultValue: 'Error' }),
        description: message,
        variant: 'destructive',
      });
    }
  };

  const isSaving =
    createMyBank.isPending ||
    createBankForEmployee.isPending ||
    updateMyBank.isPending ||
    updateBankForEmployee.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const onboardingT = (key: string) => t(`staffSignup:onboarding.${key}`);
  const watchedAccounts = form.watch('accounts');

  return (
    <form
      id={EDIT_EMPLOYEE_BANK_FORM_ID}
      onSubmit={form.handleSubmit(handleSaveAll)}
      className="space-y-6 animate-in fade-in duration-300"
    >
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t('bankingTabHint')}
      </p>

      <div className="flex flex-col gap-4">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('employees:profile.noBankAccounts', {
              defaultValue: 'No bank accounts on file yet. Click Add bank to get started.',
            })}
          </p>
        ) : (
          fields.map((field, index) => {
            const accountId = watchedAccounts?.[index]?.id;
            const savedAccount = accountId
              ? bankAccounts.find((account) => account.id === accountId)
              : undefined;

            return (
              <div
                key={field.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="h-12 bg-secondary/50 flex items-center justify-between px-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">
                      {t('staffSignup:onboarding.bankAccount', { index: index + 1 })}
                      {savedAccount?.isPrimary && (
                        <span className="ms-2 text-xs font-normal text-primary">
                          ({t('primaryAccount', { defaultValue: 'Primary' })})
                        </span>
                      )}
                    </h3>
                  </div>
                  {!accountId && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {t('staffSignup:onboarding.actions.remove', { defaultValue: 'Remove' })}
                    </button>
                  )}
                </div>
                <BankAccountFields
                  index={index}
                  register={form.register}
                  errors={form.formState.errors}
                  onboardingT={onboardingT}
                  t={t}
                />
              </div>
            );
          })
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full justify-end gap-2 text-primary hover:text-primary/80 font-medium"
        onClick={() => append(emptyAccount())}
      >
        <PlusCircle className="size-4" />
        {t('addAnotherBank', { defaultValue: 'Add bank' })}
      </Button>

      {isSaving && (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t('saving', { defaultValue: 'Saving...' })}
        </p>
      )}
    </form>
  );
}
