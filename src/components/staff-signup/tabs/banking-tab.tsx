import { UseFormRegister, Control, FieldErrors, useFieldArray } from 'react-hook-form';
import { CreditCard, PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/ui/FormField';
import { OnboardingFormValues } from '../staff-onboarding-form';

interface BankingTabProps {
    register: UseFormRegister<OnboardingFormValues>;
    control: Control<OnboardingFormValues>;
    errors: FieldErrors<OnboardingFormValues>;
}

export function BankingTab({ register, control, errors }: BankingTabProps) {
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
                        <div className="flex h-12.5 items-center border-b border-border bg-secondary/50 px-4 sm:px-6">
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

                        <div className="flex flex-col gap-4 p-4 sm:p-6">
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

        </>
    );
}
