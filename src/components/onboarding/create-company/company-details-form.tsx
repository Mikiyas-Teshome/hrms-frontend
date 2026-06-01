'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
    companySchema,
    type CompanyFormValues,
} from '@/components/onboarding/schemas/company-schema';

export function CompanyDetailsForm() {
    const { t } = useTranslation('company');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: '',
            legalName: '',
            size: '',
            industry: '',
            country: 'uae',
        },
    });

    const onSubmit = () => {
        router.push('/create-company-success');
    };

    return (
        <div className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center p-4">
            <Card className="w-full max-w-lg overflow-hidden border-border bg-card shadow-sm ring-1 ring-border sm:rounded-xl">
                <CardHeader className="space-y-1 pb-8 pt-10 text-center sm:px-8 sm:text-start rtl:sm:text-end">
                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                        {t('title')}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {t('subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-6 pb-12 sm:px-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2.5">
                            <Label
                                htmlFor="name"
                                className="text-sm font-semibold text-foreground rtl:text-end block"
                            >
                                {t('name')}
                            </Label>
                            <Input
                                id="name"
                                {...register('name')}
                                className={cn(
                                    'rtl:text-end',
                                    errors.name
                                        ? 'border-destructive focus-visible:ring-destructive'
                                        : '',
                                )}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive rtl:text-end">
                                    {t(`errors.${errors.name.message}`)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <Label
                                htmlFor="legalName"
                                className="text-sm font-semibold text-foreground rtl:text-end block"
                            >
                                {t('legalName')}
                            </Label>
                            <Input
                                id="legalName"
                                {...register('legalName')}
                                className={cn(
                                    'rtl:text-end',
                                    errors.legalName
                                        ? 'border-destructive focus-visible:ring-destructive'
                                        : '',
                                )}
                            />
                            {errors.legalName && (
                                <p className="text-xs text-destructive rtl:text-end">
                                    {t(`errors.${errors.legalName.message}`)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <Label
                                htmlFor="size"
                                className="text-sm font-semibold text-foreground rtl:text-end block"
                            >
                                {t('size')}
                            </Label>
                            <Select onValueChange={(val) => setValue('size', val)}>
                                <SelectTrigger
                                    className={cn(
                                        errors.size
                                            ? 'border-destructive focus:ring-destructive'
                                            : '',
                                    )}
                                >
                                    <SelectValue placeholder={t('sizes.1-10')} />
                                </SelectTrigger>
                                <SelectContent className="rtl:text-end">
                                    <SelectItem value="1-10" className="rtl:flex-row-reverse">
                                        {t('sizes.1-10')}
                                    </SelectItem>
                                    <SelectItem value="11-50" className="rtl:flex-row-reverse">
                                        {t('sizes.11-50')}
                                    </SelectItem>
                                    <SelectItem value="51-200" className="rtl:flex-row-reverse">
                                        {t('sizes.51-200')}
                                    </SelectItem>
                                    <SelectItem value="201+" className="rtl:flex-row-reverse">
                                        {t('sizes.201+')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.size && (
                                <p className="text-xs text-destructive rtl:text-end">
                                    {t(`errors.${errors.size.message}`)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <Label
                                htmlFor="industry"
                                className="text-sm font-semibold text-foreground rtl:text-end block"
                            >
                                {t('industry')}
                            </Label>
                            <Select onValueChange={(val) => setValue('industry', val)}>
                                <SelectTrigger
                                    className={cn(
                                        errors.industry
                                            ? 'border-destructive focus:ring-destructive'
                                            : '',
                                    )}
                                >
                                    <SelectValue placeholder={t('industries.it')} />
                                </SelectTrigger>
                                <SelectContent className="rtl:text-end">
                                    <SelectItem value="it" className="rtl:flex-row-reverse">
                                        {t('industries.it')}
                                    </SelectItem>
                                    <SelectItem value="finance" className="rtl:flex-row-reverse">
                                        {t('industries.finance')}
                                    </SelectItem>
                                    <SelectItem value="healthcare" className="rtl:flex-row-reverse">
                                        {t('industries.healthcare')}
                                    </SelectItem>
                                    <SelectItem value="education" className="rtl:flex-row-reverse">
                                        {t('industries.education')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.industry && (
                                <p className="text-xs text-destructive rtl:text-end">
                                    {t(`errors.${errors.industry.message}`)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <Label
                                htmlFor="country"
                                className="text-sm font-semibold text-foreground rtl:text-end block"
                            >
                                {t('country')}
                            </Label>
                            <Select
                                defaultValue="uae"
                                onValueChange={(val) => setValue('country', val)}
                            >
                                <SelectTrigger
                                    className={cn(
                                        errors.country
                                            ? 'border-destructive focus:ring-destructive'
                                            : '',
                                    )}
                                >
                                    <SelectValue placeholder="UAE" />
                                </SelectTrigger>
                                <SelectContent className="rtl:text-end">
                                    <SelectItem value="uae" className="rtl:flex-row-reverse">
                                        UAE
                                    </SelectItem>
                                    <SelectItem value="sa" className="rtl:flex-row-reverse">
                                        Saudi Arabia
                                    </SelectItem>
                                    <SelectItem value="eg" className="rtl:flex-row-reverse">
                                        Egypt
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.country && (
                                <p className="text-xs text-destructive rtl:text-end">
                                    {t(`errors.${errors.country.message}`)}
                                </p>
                            )}
                        </div>

                        <Button type="submit" size="lg" className="w-full">
                            {t('submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
