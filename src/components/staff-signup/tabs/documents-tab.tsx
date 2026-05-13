import { UseFormRegister, Control, FieldErrors, Controller } from 'react-hook-form';
import { Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/ui/FormField';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OnboardingFormValues } from '../staff-onboarding-form';

interface DocumentsTabProps {
    register: UseFormRegister<OnboardingFormValues>;
    control: Control<OnboardingFormValues>;
    errors: FieldErrors<OnboardingFormValues>;
    onNext: () => void;
}

export function DocumentsTab({ register, control, errors, onNext }: DocumentsTabProps) {
    const { t } = useTranslation(['staffSignup', 'onboarding', 'common']);

    return (
        <>
            {/* Documents */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Briefcase className="size-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        {t('onboarding.identityDocuments')}
                    </h3>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            id="passportNumber"
                            label={t('onboarding.passportNumber')}
                            name="passportNumber"
                            register={register}
                            error={errors.passportNumber}
                            placeholder={t('onboarding.placeholders.passport')}
                            t={(key) => t(`onboarding.${key}`)}
                        />
                        <Controller
                            name="passportExpiry"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium leading-5 text-foreground block">
                                        {t('onboarding.passportExpiry')}
                                    </Label>
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={t('onboarding.placeholders.expiry')}
                                        className={cn(
                                            errors.passportExpiry && 'border-destructive',
                                        )}
                                    />
                                    {errors.passportExpiry && (
                                        <p className="text-xs text-destructive">
                                            {String(errors.passportExpiry.message)}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            id="visaNumber"
                            label={t('onboarding.visaNumber')}
                            name="visaNumber"
                            register={register}
                            error={errors.visaNumber}
                            placeholder={t('onboarding.placeholders.visa')}
                            t={(key) => t(`onboarding.${key}`)}
                        />
                        <Controller
                            name="visaExpiry"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium leading-5 text-foreground block">
                                        {t('onboarding.visaExpiry')}
                                    </Label>
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={t('onboarding.placeholders.expiry')}
                                        className={cn(errors.visaExpiry && 'border-destructive')}
                                    />
                                    {errors.visaExpiry && (
                                        <p className="text-xs text-destructive">
                                            {String(errors.visaExpiry.message)}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            id="workPermitNumber"
                            label={t('onboarding.workPermitNumber')}
                            name="workPermitNumber"
                            register={register}
                            error={errors.workPermitNumber}
                            placeholder={t('onboarding.placeholders.workPermit')}
                            t={(key) => t(`onboarding.${key}`)}
                        />
                        <Controller
                            name="workPermitExpiry"
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium leading-5 text-foreground block">
                                        {t('onboarding.workPermitExpiry')}
                                    </Label>
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={t('onboarding.placeholders.expiry')}
                                        className={cn(
                                            errors.workPermitExpiry && 'border-destructive',
                                        )}
                                    />
                                    {errors.workPermitExpiry && (
                                        <p className="text-xs text-destructive">
                                            {String(errors.workPermitExpiry.message)}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            <Button
                type="button"
                onClick={onNext}
                className="h-9 w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-sm transition-all active:scale-[0.98]"
            >
                {t('onboarding.continueToBanking')}
            </Button>
        </>
    );
}
