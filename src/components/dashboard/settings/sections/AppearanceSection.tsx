'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadBox } from '@/components/onboarding/shared/upload-box';
import { useBrandColor } from '@/components/providers/brand-color-provider';
import { ORGANIZATION_THEME_COLORS, type ThemeColorId } from '@/constants/colors';
import { cn } from '@/lib/utils';
import { SectionLayout } from '../SectionLayout';
import { AppearanceSectionSkeleton } from '../SettingsSectionSkeleton';
import { useSettingsCompany } from '@/features/settings/hooks/useSettingsCompany';
import { useUpdateTenantProfile } from '@/features/auth/hooks/useAuth';
import { buildAppearanceFormValues, normalizeWebsiteUrl } from '@/features/settings/settings.utils';
import { uploadLogo } from '@/features/documents/documents.actions';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';
import type { UpdateCompanyInput } from '@/features/auth/auth.types';

const appearanceSchema = z.object({
    website: z.string().optional(),
    themeColor: z.string().min(1),
});

type AppearanceValues = z.infer<typeof appearanceSchema>;

const THEME_MODES = [
    { labelKey: 'appearance.light', value: 'light' },
    { labelKey: 'appearance.dark', value: 'dark' },
    { labelKey: 'appearance.system', value: 'system' },
] as const;

type LogoMutation = 'unchanged' | 'updated' | 'cleared';

function AppearanceLogoField({
    initialLogoUrl,
    logoMutation,
    onLogoChange,
    onFileSelect,
    onUploadError,
    isUploading,
    label,
}: {
    initialLogoUrl: string | null;
    logoMutation: LogoMutation;
    onLogoChange: (mutation: LogoMutation) => void;
    onFileSelect: (file: File) => void;
    onUploadError: (error: string) => void;
    isUploading: boolean;
    label: string;
}) {
    const displayUrl = logoMutation === 'cleared' ? null : initialLogoUrl;

    return (
        <div className="max-w-xs">
            <Label className="text-sm font-medium text-foreground mb-2 block">{label}</Label>
            <UploadBox
                deferUpload
                initialUrl={displayUrl}
                isUploading={isUploading}
                onFileSelect={(file) => {
                    onFileSelect(file);
                    onLogoChange('updated');
                }}
                onClear={() => onLogoChange('cleared')}
                onUploadError={onUploadError}
            />
        </div>
    );
}

function ThemeModePreview({ mode }: { mode: 'light' | 'dark' | 'system' }) {
    if (mode === 'light') {
        return (
            <div className="w-full h-full rounded-md bg-gray-100 flex flex-col gap-1 p-2">
                <div className="h-1.5 w-3/4 bg-gray-300 rounded" />
                <div className="h-1.5 w-1/2 bg-gray-300 rounded" />
                <div className="mt-1 flex gap-1">
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                    <div className="h-1.5 w-full bg-gray-200 rounded mt-0.5" />
                </div>
            </div>
        );
    }

    if (mode === 'dark') {
        return (
            <div className="w-full h-full rounded-md bg-zinc-800 flex flex-col gap-1 p-2">
                <div className="h-1.5 w-3/4 bg-zinc-600 rounded" />
                <div className="h-1.5 w-1/2 bg-zinc-600 rounded" />
                <div className="mt-1 flex gap-1">
                    <div className="h-3 w-3 rounded-full bg-zinc-600" />
                    <div className="h-1.5 w-full bg-zinc-700 rounded mt-0.5" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-md bg-linear-to-br from-gray-100 to-zinc-800 flex flex-col gap-1 p-2">
            <div className="h-1.5 w-3/4 bg-gray-400 rounded" />
            <div className="h-1.5 w-1/2 bg-gray-400 rounded" />
            <div className="mt-1 flex gap-1">
                <div className="h-3 w-3 rounded-full bg-gray-400" />
                <div className="h-1.5 w-full bg-gray-300 rounded mt-0.5" />
            </div>
        </div>
    );
}

export function AppearanceSection() {
    const { t } = useTranslation('settings');
    const { t: tOrg } = useTranslation('organizationProfile');
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const { updateBrandColor } = useBrandColor();
    const {
        companyId,
        company,
        isLoading,
        themeColorFallback,
    } = useSettingsCompany();
    const updateTenantMutation = useUpdateTenantProfile();
    const [logoMutation, setLogoMutation] = useState<LogoMutation>('unchanged');
    const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
    const [isLogoUploading, setIsLogoUploading] = useState(false);

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } =
        useForm<AppearanceValues>({
            resolver: zodResolver(appearanceSchema) as never,
            defaultValues: {
                website: '',
                themeColor: 'blue',
            },
        });

    const selectedColor = useWatch({ control, name: 'themeColor' });

    useEffect(() => {
        if (!company) {
            return;
        }

        const values = buildAppearanceFormValues(company, { themeColorFallback });
        reset({
            website: values.website,
            themeColor: values.themeColor,
        });
    }, [company, themeColorFallback, reset]);

    useEffect(() => {
        if (selectedColor) {
            updateBrandColor(selectedColor as ThemeColorId);
        }
    }, [selectedColor, updateBrandColor]);

    const themeColors = ORGANIZATION_THEME_COLORS.map((color) => ({
        ...color,
        label: tOrg(`fields.colors.${color.id}`),
    }));

    const onSubmit = async (data: AppearanceValues) => {
        if (!companyId) {
            return;
        }

        try {
            let resolvedLogoUrl: string | null | undefined;

            if (logoMutation === 'cleared') {
                resolvedLogoUrl = null;
            } else if (pendingLogoFile) {
                setIsLogoUploading(true);
                const body = new FormData();
                body.append('file', pendingLogoFile);
                const uploadResult = await uploadLogo(body);
                if (uploadResult.error || !uploadResult.url) {
                    throw new Error(uploadResult.error ?? t('errors.saveFailed'));
                }
                resolvedLogoUrl = uploadResult.url;
            }

            const input: UpdateCompanyInput = {
                themeColor: data.themeColor,
                ...(data.website?.trim() && { website: normalizeWebsiteUrl(data.website) }),
                ...(resolvedLogoUrl !== undefined && { logoUrl: resolvedLogoUrl }),
            };

            await updateTenantMutation.mutateAsync({ id: companyId, input });

            updateBrandColor(data.themeColor as ThemeColorId);
            setLogoMutation('unchanged');
            setPendingLogoFile(null);

            toast({
                title: t('success.title'),
                description: t('success.appearanceSaved'),
            });
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: getUserFacingErrorMessage(error, t('errors.saveFailed')),
            });
        } finally {
            setIsLogoUploading(false);
        }
    };

    if (isLoading) {
        return (
            <SectionLayout
                title={t('appearance.title')}
                description={t('appearance.description')}
            >
                <AppearanceSectionSkeleton />
            </SectionLayout>
        );
    }

    return (
        <SectionLayout
            title={t('appearance.title')}
            description={t('appearance.description')}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                    <h3 className="text-sm font-semibold text-foreground">
                        {t('appearance.branding')}
                    </h3>

                    <AppearanceLogoField
                        key={`${company?.id ?? 'company'}-${company?.updatedAt ?? ''}`}
                        initialLogoUrl={company?.logo ?? null}
                        logoMutation={logoMutation}
                        isUploading={isLogoUploading}
                        onFileSelect={(file) => setPendingLogoFile(file)}
                        onLogoChange={(mutation) => {
                            setLogoMutation(mutation);
                            if (mutation === 'cleared') {
                                setPendingLogoFile(null);
                            }
                        }}
                        onUploadError={(err) =>
                            toast({
                                variant: 'destructive',
                                title: t('errors.title'),
                                description: err,
                            })
                        }
                        label={t('appearance.logo')}
                    />

                    <div className="max-w-xl flex flex-col gap-1.5">
                        <Label className="text-sm font-medium text-foreground">
                            {t('appearance.websiteOptional')}
                        </Label>
                        <Input
                            {...register('website')}
                            className="h-9 rounded-[8px] px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20"
                            placeholder="yourcompany.com"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-foreground">
                            {t('appearance.themeColor')}
                        </Label>
                        <p className="text-xs text-muted-foreground -mt-1">
                            {t('appearance.themeColorDesc')}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {themeColors.map((color) => {
                                const isSelected = selectedColor === color.id;
                                return (
                                    <button
                                        key={color.id}
                                        type="button"
                                        onClick={() =>
                                            setValue('themeColor', color.id, { shouldValidate: true })
                                        }
                                        className="flex flex-col items-center gap-1.5 group outline-none"
                                    >
                                        <div
                                            className={cn(
                                                'w-[111.67px] h-10.75 rounded-[9px] flex items-center justify-center transition-all p-px',
                                                isSelected ? 'border-2' : 'border-2 border-transparent',
                                            )}
                                            style={isSelected ? { borderColor: color.value } : undefined}
                                        >
                                            <div
                                                className="w-full h-full rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-white/10"
                                                style={{ backgroundColor: color.value }}
                                            />
                                        </div>
                                        <span
                                            className={cn(
                                                'text-[12px] leading-5 transition-colors',
                                                isSelected
                                                    ? 'text-foreground font-semibold'
                                                    : 'text-muted-foreground font-normal',
                                            )}
                                        >
                                            {color.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.themeColor && (
                            <p className="text-xs text-destructive">{errors.themeColor.message}</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-border" />

                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                        {t('appearance.display')}
                    </h3>
                    <Label className="text-sm font-medium text-foreground">
                        {t('appearance.themeMode')}
                    </Label>
                    <div className="flex gap-4 flex-wrap">
                        {THEME_MODES.map((mode) => (
                            <button
                                key={mode.value}
                                type="button"
                                onClick={() => setTheme(mode.value)}
                                className="flex flex-col items-center gap-2"
                            >
                                <div
                                    className={cn(
                                        'w-24 h-16 rounded-xl overflow-hidden border-2 transition-all',
                                        theme === mode.value ? 'border-primary' : 'border-border',
                                    )}
                                >
                                    <ThemeModePreview mode={mode.value} />
                                </div>
                                <span
                                    className={cn(
                                        'text-xs',
                                        theme === mode.value
                                            ? 'font-semibold text-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {t(mode.labelKey)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={updateTenantMutation.isPending || isLogoUploading || !companyId}
                        className="bg-primary hover:bg-primary/90 text-white h-9 px-5 rounded-lg"
                    >
                        {(updateTenantMutation.isPending || isLogoUploading) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t('saveChange')}
                    </Button>
                </div>
            </form>
        </SectionLayout>
    );
}
