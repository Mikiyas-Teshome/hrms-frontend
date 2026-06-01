'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { SectionLayout } from '../SectionLayout';
import { OrgPreferencesSectionSkeleton } from '../SettingsSectionSkeleton';
import { useSettingsCompany } from '@/features/settings/hooks/useSettingsCompany';
import { useUpdateTenantProfile } from '@/features/auth/hooks/useAuth';
import { buildOrgPreferencesFormValues } from '@/features/settings/settings.utils';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';
import type { UpdateCompanyInput } from '@/features/auth/auth.types';

const schema = z.object({
    multiDept: z.boolean(),
    crossDivision: z.boolean(),
    requireDept: z.boolean(),
});

type OrgPrefsValues = z.infer<typeof schema>;

export function OrgPreferencesSection() {
    const { t } = useTranslation('settings');
    const { toast } = useToast();
    const { companyId, company, isLoading } = useSettingsCompany();
    const updateTenantMutation = useUpdateTenantProfile();

    const { watch, setValue, handleSubmit, reset } = useForm<OrgPrefsValues>({
        resolver: zodResolver(schema) as never,
        defaultValues: {
            multiDept: true,
            crossDivision: true,
            requireDept: true,
        },
    });

    const values = watch();

    useEffect(() => {
        if (!company) {
            return;
        }

        reset(buildOrgPreferencesFormValues(company));
    }, [company, reset]);

    const toggle = (key: 'multiDept' | 'crossDivision' | 'requireDept') =>
        setValue(key, !values[key], { shouldDirty: true });

    const onSubmit = async (data: OrgPrefsValues) => {
        if (!companyId) {
            return;
        }

        try {
            const input: UpdateCompanyInput = {
                multiDept: data.multiDept,
                crossDivision: data.crossDivision,
                requireDept: data.requireDept,
            };

            await updateTenantMutation.mutateAsync({ id: companyId, input });

            toast({
                title: t('success.title'),
                description: t('success.orgPreferencesSaved'),
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
                title={t('orgPreferences.title')}
                description={t('orgPreferences.description')}
            >
                <OrgPreferencesSectionSkeleton />
            </SectionLayout>
        );
    }

    return (
        <SectionLayout
            title={t('orgPreferences.title')}
            description={t('orgPreferences.description')}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {[
                    {
                        key: 'multiDept' as const,
                        label: t('orgPreferences.multiDept'),
                        desc: t('orgPreferences.multiDeptDesc'),
                    },
                    {
                        key: 'crossDivision' as const,
                        label: t('orgPreferences.crossDivision'),
                        desc: t('orgPreferences.crossDivisionDesc'),
                    },
                    {
                        key: 'requireDept' as const,
                        label: t('orgPreferences.requireDept'),
                        desc: undefined,
                    },
                ].map((item) => (
                    <div key={item.key} className="flex items-start justify-between gap-8">
                        <div>
                            <p className="text-sm font-semibold text-foreground">{item.label}</p>
                            {item.desc && (
                                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                            )}
                        </div>
                        <Switch
                            checked={values[item.key]}
                            onCheckedChange={() => toggle(item.key)}
                            className="shrink-0 mt-0.5"
                        />
                    </div>
                ))}

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
