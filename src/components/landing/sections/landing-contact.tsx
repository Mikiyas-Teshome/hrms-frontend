'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Calendar, Clock, Mail, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LANDING_CONTACT_EMAIL, landingContactHighlights } from '@/data/landing';
import {
    landingContactInquiryTypes,
    landingContactSchema,
    type LandingContactFormValues,
} from '@/features/landing/schemas/contact.schema';
import { cn } from '@/lib/utils';

const highlightIconMap = {
    calendar: Calendar,
    building: Building2,
    clock: Clock,
} as const;

function buildMailtoLink(values: LandingContactFormValues, inquiryLabel: string) {
    const subject = `[HRMS] ${inquiryLabel} — ${values.companyName}`;
    const body = [
        `Name: ${values.fullName}`,
        `Email: ${values.workEmail}`,
        `Company: ${values.companyName}`,
        `Inquiry type: ${inquiryLabel}`,
        '',
        values.message,
    ].join('\n');

    return `mailto:${LANDING_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function LandingContact() {
    const { t } = useTranslation('landing');
    const { toast } = useToast();
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<LandingContactFormValues>({
        resolver: zodResolver(landingContactSchema),
        defaultValues: {
            inquiryType: 'sales',
            fullName: '',
            workEmail: '',
            companyName: '',
            message: '',
        },
    });

    const inquiryOptions = landingContactInquiryTypes.map((type) => ({
        value: type,
        label: t(`contact.inquiryTypes.${type}.label`),
    }));

    const onSubmit = (values: LandingContactFormValues) => {
        const inquiryLabel = t(`contact.inquiryTypes.${values.inquiryType}.label`);
        const mailtoLink = buildMailtoLink(values, inquiryLabel);
        const anchor = document.createElement('a');
        anchor.href = mailtoLink;
        anchor.rel = 'noopener noreferrer';
        anchor.click();
        setSubmitted(true);
        toast({
            title: t('contact.toast.title'),
            description: t('contact.toast.description'),
        });
    };

    return (
        <section id="contact" className="bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
                            {t('contact.badge')}
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {t('contact.title')}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">{t('contact.subtitle')}</p>

                        <ul className="mt-8 space-y-5">
                            {landingContactHighlights.map((item) => {
                                const Icon = highlightIconMap[item.icon];
                                return (
                                    <li key={item.id} className="flex gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                            <Icon className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {t(`contact.highlights.${item.id}.title`)}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {t(`contact.highlights.${item.id}.description`)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
                            <p className="text-sm font-medium text-foreground">
                                {t('contact.directEmail')}
                            </p>
                            <a
                                href={`mailto:${LANDING_CONTACT_EMAIL}`}
                                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                            >
                                <Mail className="size-4" />
                                {LANDING_CONTACT_EMAIL}
                            </a>
                            <p className="mt-4 text-sm text-muted-foreground">{t('contact.selfServe')}</p>
                            <Link
                                href="/company-signup"
                                className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
                            >
                                {t('contact.selfServeLink')}
                            </Link>
                        </div>
                    </div>

                    <Card className="border-border/60 shadow-lg shadow-primary/5">
                        <CardContent className="p-6 sm:p-8">
                            {submitted ? (
                                <div className="flex flex-col items-center py-10 text-center">
                                    <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                                        <Send className="size-6 text-primary" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-foreground">
                                        {t('contact.success.title')}
                                    </h3>
                                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                        {t('contact.success.description')}
                                    </p>
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        {t('contact.success.fallback')}{' '}
                                        <a
                                            href={`mailto:${LANDING_CONTACT_EMAIL}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {LANDING_CONTACT_EMAIL}
                                        </a>
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-8"
                                        onClick={() => setSubmitted(false)}
                                    >
                                        {t('contact.success.sendAnother')}
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <FormSelect
                                        id="inquiryType"
                                        label={t('contact.form.inquiryType')}
                                        name="inquiryType"
                                        control={control}
                                        options={inquiryOptions}
                                        error={errors.inquiryType}
                                        t={t}
                                    />

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <FormField
                                            id="fullName"
                                            name="fullName"
                                            label={t('contact.form.fullName')}
                                            placeholder={t('contact.form.fullNamePlaceholder')}
                                            register={register}
                                            error={errors.fullName}
                                            t={t}
                                        />
                                        <FormField
                                            id="workEmail"
                                            name="workEmail"
                                            type="email"
                                            inputMode="email"
                                            label={t('contact.form.workEmail')}
                                            placeholder={t('contact.form.workEmailPlaceholder')}
                                            register={register}
                                            error={errors.workEmail}
                                            t={t}
                                        />
                                    </div>

                                    <FormField
                                        id="companyName"
                                        name="companyName"
                                        label={t('contact.form.companyName')}
                                        placeholder={t('contact.form.companyNamePlaceholder')}
                                        register={register}
                                        error={errors.companyName}
                                        t={t}
                                    />

                                    <div className="space-y-3">
                                        <Label htmlFor="message">{t('contact.form.message')}</Label>
                                        <Textarea
                                            id="message"
                                            rows={4}
                                            placeholder={t('contact.form.messagePlaceholder')}
                                            className={cn(errors.message && 'border-destructive')}
                                            {...register('message')}
                                        />
                                        {errors.message ? (
                                            <p className="text-sm text-destructive">
                                                {t(`errors.${errors.message.message}`)}
                                            </p>
                                        ) : null}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full"
                                        disabled={isSubmitting}
                                    >
                                        {t('contact.form.submit')}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
