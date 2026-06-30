'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { TimezoneSelect } from '@/components/ui/TimezoneSelect';
import { PhoneCodeSelect } from '@/components/ui/PhoneCodeSelect';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';
import { SectionLayout } from '../SectionLayout';
import { GeneralSectionSkeleton } from '../SettingsSectionSkeleton';
import { useSettingsCompany } from '@/features/settings/hooks/useSettingsCompany';
import { useProfile, useUpdateTenantProfile } from '@/features/auth/hooks/useAuth';
import { buildGeneralFormValues, combinePhoneNumber, emailsEqual } from '@/features/settings/settings.utils';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';
import type { UpdateCompanyInput } from '@/features/auth/auth.types';

const schema = z.object({
    orgName: z.string().min(1, 'required'),
    description: z.string().max(500).optional(),
    phoneCode: z.string().default('US'),
    phone: z.string().optional(),
    email: z.string().email('invalid_email').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
});

type GeneralValues = z.infer<typeof schema>;

export function GeneralSection() {
    const { t, i18n } = useTranslation('settings');
    const { t: tLanguage } = useTranslation('languageSwitcher');
    const { toast } = useToast();
    const {
        companyId,
        company,
        isLoading,
        currencyFallback,
        timezoneFallback,
    } = useSettingsCompany();
    const { data: profile } = useProfile();
    const updateTenantMutation = useUpdateTenantProfile();

    const language = i18n.language?.startsWith('ar') ? 'ar' : 'en';
    const languageOptions = [
        { label: tLanguage('languages.english'), value: 'en' },
        { label: tLanguage('languages.arabic'), value: 'ar' },
    ];

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<GeneralValues>({
        resolver: zodResolver(schema) as never,
        defaultValues: {
            orgName: '',
            description: '',
            phoneCode: 'US',
            phone: '',
            email: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            currency: '',
            timezone: '',
        },
    });

    const orgEmailValue = useWatch({ control, name: 'email' });
    const showSameAsAccountWarning = emailsEqual(orgEmailValue, profile?.email);

    useEffect(() => {
        if (!company) {
            return;
        }

        reset(
            buildGeneralFormValues(company, {
                currencyFallback,
                timezoneFallback,
            }),
        );
    }, [company, currencyFallback, timezoneFallback, reset]);

    const onSubmit = async (data: GeneralValues) => {
        if (!companyId) {
            return;
        }

        try {
            const phoneNumber = combinePhoneNumber(data.phoneCode, data.phone ?? '');

            const input: UpdateCompanyInput = {
                name: data.orgName.trim(),
                description: data.description?.trim() || null,
                email: data.email?.trim() || null,
                ...(phoneNumber && { phoneNumber }),
                address: data.address?.trim() || null,
                city: data.city?.trim() || null,
                state: data.state?.trim() || null,
                postalCode: data.postalCode?.trim() || null,
                ...(data.country && { country: data.country }),
                ...(data.currency && { currency: data.currency }),
                ...(data.timezone && { timezone: data.timezone }),
            };

            await updateTenantMutation.mutateAsync({ id: companyId, input });

            toast({
                title: t('success.title'),
                description: t('success.generalSaved'),
            });
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: getUserFacingErrorMessage(error, t('errors.saveFailed')),
            });
        }
    };

    if (isLoading) {
        return (
            <SectionLayout
                title={t('general.title')}
                description={t('general.description')}
            >
                <GeneralSectionSkeleton />
            </SectionLayout>
        );
    }

    return (
        <SectionLayout
            title={t('general.title')}
            description={t('general.description')}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                    <h3 className="text-sm font-semibold text-foreground">
                        {t('general.organization')}
                    </h3>

                    <div className="max-w-xl">
                        <FormField
                            id="orgName"
                            label={t('general.orgName')}
                            register={register}
                            name="orgName"
                            error={errors.orgName}
                            t={t}
                        />
                    </div>

                    <div className="max-w-xl">
                        <Label htmlFor="description" className="text-sm font-medium text-foreground">
                            {t('general.descriptionLabel')}
                        </Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            rows={3}
                            className="mt-3 min-h-20 resize-none rounded-[8px] border border-input bg-background px-4 py-2 focus:border-primary focus:ring-primary/20"
                            placeholder={t('general.descriptionPlaceholder')}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label className="text-sm font-medium text-foreground">
                            {t('general.phone')}
                        </Label>
                        <div className="flex gap-2 max-w-xl items-start">
                            <PhoneCodeSelect
                                id="phoneCode"
                                control={control}
                                name="phoneCode"
                                placeholder="+1"
                                error={errors.phoneCode}
                                t={t}
                                containerClassName="w-32 space-y-0"
                            />
                            <div className="flex-1">
                                <Input
                                    {...register('phone')}
                                    className="h-9 rounded-[8px] px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20"
                                    placeholder="555-234543"
                                />
                                {errors.phone && (
                                    <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-xl">
                        <FormField
                            id="email"
                            label={t('general.orgEmail')}
                            register={register}
                            name="email"
                            type="email"
                            error={errors.email}
                            placeholder={t('general.orgEmailPlaceholder')}
                            t={t}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('general.orgEmailHint')}
                        </p>
                        {showSameAsAccountWarning && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                {t('general.orgEmailSameAsAccountWarning')}
                            </p>
                        )}
                    </div>

                    <div className="max-w-xl">
                        <CountrySelect
                            control={control}
                            name="country"
                            label={t('general.country')}
                            placeholder={t('general.country')}
                            error={errors.country}
                            t={t}
                            id="country"
                        />
                    </div>

                    <div className="max-w-xl">
                        <FormField
                            id="address"
                            label={t('general.address')}
                            register={register}
                            name="address"
                            error={errors.address}
                            placeholder={t('general.address')}
                            t={t}
                        />
                    </div>

                    <div className="grid max-w-xl grid-cols-1 gap-5 sm:grid-cols-2">
                        <FormField
                            id="city"
                            label={t('general.city')}
                            register={register}
                            name="city"
                            error={errors.city}
                            t={t}
                        />
                        <FormField
                            id="state"
                            label={t('general.state')}
                            register={register}
                            name="state"
                            error={errors.state}
                            t={t}
                        />
                    </div>

                    <div className="max-w-xl sm:max-w-[calc(50%-0.625rem)]">
                        <FormField
                            id="postalCode"
                            label={t('general.postalCode')}
                            register={register}
                            name="postalCode"
                            error={errors.postalCode}
                            t={t}
                        />
                    </div>
                </div>

                <div className="border-t border-border" />

                <div className="flex flex-col gap-5">
                    <h3 className="text-sm font-semibold text-foreground">
                        {t('general.regional')}
                    </h3>

                    <div className="max-w-xl">
                        <CurrencySelect
                            control={control}
                            name="currency"
                            label={t('general.currency')}
                            placeholder={t('general.currency')}
                            error={errors.currency}
                            t={t}
                        />
                    </div>

                    <div className="max-w-xl">
                        <TimezoneSelect
                            control={control}
                            name="timezone"
                            label={t('general.timezone')}
                            placeholder={t('general.timezone')}
                            error={errors.timezone}
                            t={t}
                        />
                    </div>

                    <div className="max-w-xl">
                        <FormSelect
                            id="language"
                            label={t('general.language')}
                            value={language}
                            options={languageOptions}
                            t={t}
                            onChange={(value) => {
                                changeLanguage(value as 'en' | 'ar');
                            }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('general.languageHint')}
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={updateTenantMutation.isPending || !companyId}
                        className="bg-primary hover:bg-primary/90 text-white h-9 px-5 rounded-lg"
                    >
                        {updateTenantMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t('saveChange')}
                    </Button>
                </div>
            </form>
        </SectionLayout>
    );
}
