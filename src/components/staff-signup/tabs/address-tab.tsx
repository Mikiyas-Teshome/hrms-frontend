import { UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/ui/FormField';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Button } from '@/components/ui/button';
import { OnboardingFormValues } from '../staff-onboarding-form';

interface AddressTabProps {
    register: UseFormRegister<OnboardingFormValues>;
    control: Control<OnboardingFormValues>;
    errors: FieldErrors<OnboardingFormValues>;
    onNext: () => void;
}

export function AddressTab({ register, control, errors, onNext }: AddressTabProps) {
    const { t } = useTranslation(['staffSignup', 'onboarding', 'common']);

    return (
        <>
            {/* Current Address */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <MapPin className="size-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        {t('onboarding.currentResidence')}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                    <div className="md:col-span-2">
                        <FormField
                            id="address"
                            label={t('onboarding.streetAddress')}
                            name="address"
                            register={register}
                            error={errors.address}
                            placeholder={t('onboarding.placeholders.address')}
                            t={(key) => t(`onboarding.${key}`)}
                        />
                    </div>
                    <FormField
                        id="city"
                        label={t('onboarding.city')}
                        name="city"
                        register={register}
                        error={errors.city}
                        placeholder={t('onboarding.placeholders.city')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="state"
                        label={t('onboarding.state')}
                        name="state"
                        register={register}
                        error={errors.state}
                        placeholder={t('onboarding.placeholders.state')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <CountrySelect
                        id="country"
                        label={t('onboarding.country')}
                        name="country"
                        control={control}
                        placeholder={t('onboarding.placeholders.country')}
                        error={errors.country}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="postalCode"
                        label={t('onboarding.postalCode')}
                        name="postalCode"
                        type="text"
                        inputMode="numeric"
                        register={register}
                        error={errors.postalCode}
                        placeholder={t('onboarding.placeholders.zip')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                </div>
            </div>

            {/* Home Address */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <MapPin className="size-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        {t('onboarding.homeAddressPermanent')}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
                    <div className="md:col-span-2">
                        <FormField
                            id="homeAddress"
                            label={t('onboarding.streetAddress')}
                            name="homeAddress"
                            register={register}
                            error={errors.homeAddress}
                            placeholder={t('onboarding.placeholders.address')}
                            t={(key) => t(`onboarding.${key}`)}
                        />
                    </div>
                    <FormField
                        id="homeCity"
                        label={t('onboarding.city')}
                        name="homeCity"
                        register={register}
                        error={errors.homeCity}
                        placeholder={t('onboarding.placeholders.city')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="homeState"
                        label={t('onboarding.state')}
                        name="homeState"
                        register={register}
                        error={errors.homeState}
                        placeholder={t('onboarding.placeholders.state')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <CountrySelect
                        id="homeCountry"
                        label={t('onboarding.country')}
                        name="homeCountry"
                        control={control}
                        placeholder={t('onboarding.placeholders.country')}
                        error={errors.homeCountry}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="homePostalCode"
                        label={t('onboarding.postalCode')}
                        name="homePostalCode"
                        type="text"
                        inputMode="numeric"
                        register={register}
                        error={errors.homePostalCode}
                        placeholder={t('onboarding.placeholders.zip')}
                        t={(key) => t(`onboarding.${key}`)}
                    />
                    <FormField
                        id="homePhone"
                        label={t('onboarding.phoneNumber')}
                        name="homePhone"
                        inputMode="tel"
                        register={register}
                        error={errors.homePhone}
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
