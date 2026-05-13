import { UseFormRegister, Control, FieldErrors, useFieldArray } from 'react-hook-form';
import { CreditCard, PlusCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/button';
import { OnboardingFormValues } from '../staff-onboarding-form';

interface BankingTabProps {
    register: UseFormRegister<OnboardingFormValues>;
    control: Control<OnboardingFormValues>;
    errors: FieldErrors<OnboardingFormValues>;
    isSubmitting: boolean;
    isPending: boolean;
}

export function BankingTab({
    register,
    control,
    errors,
    isSubmitting,
    isPending,
}: BankingTabProps) {
    const { t } = useTranslation(['staffSignup', 'onboarding', 'common']);
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'bankAccounts',
    });

    return (
        <>
            <div className="flex flex-col gap-4">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="bg-card border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden group/bank"
                    >
                        <div className="h-12.5 bg-secondary/50 flex items-center px-6 border-b border-border">
                            <div className="flex-1 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="size-4 text-primary" />
                                    <h3 className="font-semibold text-sm text-foreground leading-3.5">
                                        {t('onboarding.bankAccount', {
                                            index: index + 1,
                                        })}
                                    </h3>
                                </div>
                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-muted-foreground hover:text-destructive transition-colors text-xs font-medium"
                                    >
                                        {t('onboarding.actions.remove')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 p-6">
                            <FormField
                                id={`bankAccounts.${index}.bankName`}
                                label={t('onboarding.bankName')}
                                name={`bankAccounts.${index}.bankName`}
                                register={register}
                                error={errors.bankAccounts?.[index]?.bankName}
                                placeholder={t('onboarding.placeholders.bankName')}
                                t={(key) => t(`onboarding.${key}`)}
                            />
                            <FormField
                                id={`bankAccounts.${index}.branchName`}
                                label={t('onboarding.bankBranch')}
                                name={`bankAccounts.${index}.branchName`}
                                register={register}
                                error={errors.bankAccounts?.[index]?.branchName}
                                placeholder={t('onboarding.placeholders.bankBranch')}
                                t={(key) => t(`onboarding.${key}`)}
                            />
                            <FormField
                                id={`bankAccounts.${index}.accountName`}
                                label={t('onboarding.accountHoldersName')}
                                name={`bankAccounts.${index}.accountName`}
                                register={register}
                                error={errors.bankAccounts?.[index]?.accountName}
                                placeholder={t('onboarding.placeholders.accountName')}
                                t={(key) => t(`onboarding.${key}`)}
                            />
                            <FormField
                                id={`bankAccounts.${index}.accountNumber`}
                                label={t('onboarding.accountNumber')}
                                name={`bankAccounts.${index}.accountNumber`}
                                register={register}
                                error={errors.bankAccounts?.[index]?.accountNumber}
                                placeholder={t('onboarding.placeholders.accountNumber')}
                                t={(key) => t(`onboarding.${key}`)}
                            />
                            <FormField
                                id={`bankAccounts.${index}.swiftCode`}
                                label={t('onboarding.swiftCode')}
                                name={`bankAccounts.${index}.swiftCode`}
                                register={register}
                                error={errors.bankAccounts?.[index]?.swiftCode}
                                placeholder={t('onboarding.placeholders.swift')}
                                t={(key) => t(`onboarding.${key}`)}
                            />
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() =>
                        append({
                            bankName: '',
                            branchName: '',
                            accountName: '',
                            accountNumber: '',
                            iban: '',
                            swiftCode: '',
                        })
                    }
                    className="flex items-center justify-end gap-2 py-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors group"
                >
                    <PlusCircle className="size-4 text-primary" />
                    {t('onboarding.addAnotherBank')}
                </button>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting || isPending}
                className="h-9 w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-sm transition-all active:scale-[0.98]"
            >
                {isSubmitting || isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    t('onboarding.finishSetup')
                )}
            </Button>
        </>
    );
}
