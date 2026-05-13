import { UseFormRegister, Control, FieldErrors, Controller } from 'react-hook-form';
import { User, Info, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { DatePicker } from '@/components/ui/date-picker';
import { NationalitySelect } from '@/components/ui/NationalitySelect';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OnboardingFormValues } from '../staff-onboarding-form';

interface PersonalInfoTabProps {
    register: UseFormRegister<OnboardingFormValues>;
    control: Control<OnboardingFormValues>;
    errors: FieldErrors<OnboardingFormValues>;
    onNext: () => void;
}

export function PersonalInfoTab({ register, control, errors, onNext }: PersonalInfoTabProps) {
    const { t } = useTranslation(['staffSignup', 'onboarding', 'common']);

    return (
        <>
            {/* Names and Identity */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <User className="size-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        {t('onboarding.personalDetails')}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                    <FormField
                        id="firstName"
                        label={t('onboarding.firstName')}
                        name="firstName"
                        register={register}
                        error={errors.firstName}
                        placeholder={t('onboarding.placeholders.firstName')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="lastName"
                        label={t('onboarding.lastName')}
                        name="lastName"
                        register={register}
                        error={errors.lastName}
                        placeholder={t('onboarding.placeholders.lastName')}
                        t={(key) => t(`onboarding.${key}`)}
                    />

                    <FormField
                        id="middleName"
                        label={t('onboarding.middleName')}
                        name="middleName"
                        register={register}
                        error={errors.middleName}
                        placeholder={t('onboarding.placeholders.middleName')}
                        t={(key) => t(`onboarding.${key}`)}
                    />

                    <FormSelect
                        id="gender"
                        label={t('onboarding.gender')}
                        name="gender"
                        control={control}
                        options={[
                            {
                                label: t('onboarding.genders.male'),
                                value: 'male',
                            },
                            {
                                label: t('onboarding.genders.female'),
                                value: 'female',
                            },
                            {
                                label: t('onboarding.genders.other'),
                                value: 'other',
                            },
                            {
                                label: t('onboarding.genders.prefer_not_to_say'),
                                value: 'prefer_not_to_say',
                            },
                        ]}
                        placeholder={t('onboarding.placeholders.select')}
                        error={errors.gender}
                        t={(key) => t(`onboarding.${key}`)}
                    />

                    <FormField
                        id="jobTitle"
                        label={t('onboarding.jobTitle')}
                        name="jobTitle"
                        register={register}
                        error={errors.jobTitle}
                        placeholder={t('onboarding.placeholders.jobTitle')}
                        t={(key) => t(`onboarding.${key}`)}
                    />

                    <Controller
                        name="dateOfBirth"
                        control={control}
                        render={({ field }) => (
                            <div className="space-y-3">
                                <Label
                                    htmlFor="dateOfBirth"
                                    className="text-sm font-medium leading-5 text-foreground block"
                                >
                                    {t('onboarding.dateOfBirth')}
                                </Label>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder={t('onboarding.placeholders.select')}
                                    className={cn(errors.dateOfBirth && 'border-destructive')}
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-xs text-destructive">
                                        {String(errors.dateOfBirth.message)}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <NationalitySelect
                        id="nationality"
                        label={t('onboarding.nationality')}
                        name="nationality"
                        control={control}
                        placeholder={t('onboarding.placeholders.nationality')}
                        error={errors.nationality}
                        t={(key) => t(`onboarding.${key}`)}
                    />

                    <FormField
                        id="nationalId"
                        label={t('onboarding.nationalId')}
                        name="nationalId"
                        register={register}
                        error={errors.nationalId}
                        placeholder={t('onboarding.placeholders.nationalId')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                </div>
            </div>

            {/* Reach Out */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Info className="size-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        {t('onboarding.contactInfo')}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                    <FormField
                        id="personalEmail"
                        label={t('onboarding.personalEmail')}
                        name="personalEmail"
                        type="email"
                        register={register}
                        error={errors.personalEmail}
                        placeholder={t('onboarding.placeholders.personalEmail')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="phoneNumber"
                        label={t('onboarding.phoneNumber')}
                        name="phoneNumber"
                        inputMode="tel"
                        register={register}
                        error={errors.phoneNumber}
                        placeholder={t('onboarding.placeholders.phoneNumber')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck className="size-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        {t('onboarding.emergencyContact')}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                    <FormField
                        id="emergencyContactName"
                        label={t('onboarding.contactName')}
                        name="emergencyContactName"
                        register={register}
                        error={errors.emergencyContactName}
                        placeholder={t('onboarding.placeholders.name')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="emergencyContactRelationship"
                        label={t('onboarding.relationship')}
                        name="emergencyContactRelationship"
                        register={register}
                        error={errors.emergencyContactRelationship}
                        placeholder={t('onboarding.placeholders.relationship')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="emergencyContactPhone"
                        label={t('onboarding.phoneNumber')}
                        name="emergencyContactPhone"
                        inputMode="tel"
                        register={register}
                        error={errors.emergencyContactPhone}
                        placeholder={t('onboarding.placeholders.phone')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                </div>
            </div>

            <Button
                type="button"
                onClick={onNext}
                className="h-9 w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-sm transition-all active:scale-[0.98]"
            >
                {t('onboarding.continue')}
            </Button>
        </>
    );
}
