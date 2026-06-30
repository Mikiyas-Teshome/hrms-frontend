'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function BillingForm() {
    const { t } = useTranslation(['billing', 'pricing']);
    const router = useRouter();
    const [employees, setEmployees] = useState(5);
    const [paymentMethod, setPaymentMethod] = useState('card');

    const planFee = 6.0;
    const tax = 5.0;
    const total = planFee * employees + tax;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-20">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
                <div className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="mb-6 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rtl:flex-row-reverse"
                    >
                        <ChevronLeft className="size-4 rtl:rotate-180" />
                        {t('billing:back')}
                    </button>

                    <div className="flex flex-col flex-wrap items-center justify-between gap-6 sm:flex-row sm:items-end">
                        <div className="text-center sm:text-start rtl:sm:text-end">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">
                                {t('billing:title')}
                            </h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                {t('billing:subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-2 sm:items-end">
                            <div className="relative">
                                <div className="flex rounded-lg bg-muted p-1 [direction:ltr]">
                                    <button className="rounded-md px-8 py-1.5 text-sm font-medium text-foreground bg-background shadow-sm">
                                        {t('pricing:yearly')}
                                    </button>
                                    <button className="rounded-md px-8 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                        {t('pricing:monthly')}
                                    </button>
                                </div>
                                <p className="absolute inset-is-1 top-full mt-1 w-1/2 text-center text-xs font-medium text-muted-foreground whitespace-nowrap">
                                    {t('pricing:saveNote')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <RadioGroup
                            value={paymentMethod}
                            onValueChange={setPaymentMethod}
                            className="grid grid-cols-1 gap-4"
                        >
                            {[
                                {
                                    id: 'card',
                                    label: t('billing:methods.card'),
                                    icon: CreditCard,
                                    cards: true,
                                },
                                { id: 'paypal', label: t('billing:methods.paypal') },
                                { id: 'apple', label: t('billing:methods.apple') },
                                { id: 'google', label: t('billing:methods.google') },
                            ].map((method) => (
                                <Label
                                    key={method.id}
                                    className={cn(
                                        'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all h-16 duration-200',
                                        'rtl:flex-row-reverse',
                                        paymentMethod === method.id
                                            ? 'border-primary bg-background ring-1 ring-primary shadow-sm'
                                            : 'border-border bg-background hover:border-primary/20',
                                    )}
                                >
                                    <div className="flex items-center gap-4 rtl:flex-row-reverse">
                                        <RadioGroupItem
                                            value={method.id}
                                            className="border-muted text-primary focus:ring-primary"
                                        />
                                        <span className="text-base font-semibold text-foreground">
                                            {method.label}
                                        </span>
                                    </div>
                                    {method.cards && (
                                        <div className="flex gap-2 opacity-80 rtl:flex-row-reverse">
                                            <Image
                                                src="/assets/cards.png"
                                                alt="Payment Cards"
                                                width={100}
                                                height={24}
                                                className="object-contain"
                                                style={{ height: '24px', width: 'auto' }}
                                            />
                                        </div>
                                    )}
                                </Label>
                            ))}
                        </RadioGroup>

                        <div className="mt-12 space-y-10">
                            <div>
                                <h2 className="text-xl font-bold text-foreground rtl:text-end">
                                    {t('billing:detailsTitle')}
                                </h2>
                                <div className="mt-8 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-sm font-semibold text-foreground rtl:text-end block">
                                            {t('billing:paymentInfo')}
                                        </Label>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider rtl:text-end">
                                                    {t('billing:cardNumber')}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="1234 1234 1234 1234"
                                                        className="pe-10 rtl:text-end"
                                                    />
                                                    <CreditCard className="absolute inset-ie-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider rtl:text-end">
                                                        {t('billing:expiry')}
                                                    </Label>
                                                    <Input
                                                        placeholder="MM / YY"
                                                        className="rtl:text-end"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider rtl:text-end">
                                                        {t('billing:cvc')}
                                                    </Label>
                                                    <Input
                                                        placeholder="CVC"
                                                        className="rtl:text-end"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-border">
                                        <h3 className="text-sm font-semibold text-foreground rtl:text-end">
                                            {t('billing:addressTitle')}
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider rtl:text-end">
                                                    {t('billing:email')}
                                                </Label>
                                                <Input
                                                    placeholder="email@example.com"
                                                    className="rtl:text-end"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider rtl:text-end">
                                                        {t('billing:country')}
                                                    </Label>
                                                    <Select defaultValue="uae">
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select country" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rtl:text-end">
                                                            <SelectItem
                                                                value="uae"
                                                                className="rtl:flex-row-reverse"
                                                            >
                                                                UAE
                                                            </SelectItem>
                                                            <SelectItem
                                                                value="sa"
                                                                className="rtl:flex-row-reverse"
                                                            >
                                                                Saudi Arabia
                                                            </SelectItem>
                                                            <SelectItem
                                                                value="eg"
                                                                className="rtl:flex-row-reverse"
                                                            >
                                                                Egypt
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider rtl:text-end">
                                                        {t('billing:zip')}
                                                    </Label>
                                                    <Input
                                                        placeholder="12345"
                                                        className="rtl:text-end"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 rtl:lg:order-first">
                        <Card className="sticky top-8 border-none bg-muted/30 shadow-none ring-1 ring-border">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-foreground rtl:text-end">
                                    {t('billing:summary.title')}
                                </h2>

                                <div className="mt-8 space-y-6">
                                    <div className="flex items-start justify-between rtl:flex-row-reverse">
                                        <div className="rtl:text-end">
                                            <p className="text-sm font-bold text-foreground">
                                                {t('billing:summary.planLabel')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {t('billing:summary.planName')}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground rtl:text-end">
                                            {t('billing:summary.planPrice')}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-foreground rtl:text-end block">
                                            {t('billing:summary.employeesLabel')}
                                        </Label>
                                        <div className="flex h-12 items-center justify-between rounded-lg border border-border bg-background rtl:flex-row-reverse overflow-hidden">
                                            <div className="ps-3 font-bold text-foreground">
                                                {employees}
                                            </div>
                                            <div className="flex flex-col h-full border-is border-border">
                                                <button
                                                    onClick={() => setEmployees(employees + 1)}
                                                    className="flex grow items-center justify-center px-4 hover:bg-muted/50 transition-colors"
                                                >
                                                    <ChevronRight className="size-3 -rotate-90 text-muted-foreground" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setEmployees(Math.max(5, employees - 1))
                                                    }
                                                    className="flex grow items-center justify-center px-4 border-t border-muted hover:bg-muted/50 transition-colors"
                                                >
                                                    <ChevronRight className="size-3 rotate-90 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-medium text-muted-foreground rtl:text-end">
                                            {t('billing:summary.employeesHint')}
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-border/50">
                                        <div className="flex justify-between text-sm text-muted-foreground rtl:flex-row-reverse">
                                            <span>{t('billing:summary.planFee')}</span>
                                            <span className="font-medium text-foreground">
                                                {t('billing:summary.planPrice')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground rtl:flex-row-reverse">
                                            <span>{t('billing:summary.noOfEmployees')}</span>
                                            <span className="font-medium text-foreground">
                                                {employees}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground rtl:flex-row-reverse">
                                            <span>{t('billing:summary.tax')}</span>
                                            <span className="font-medium text-foreground">
                                                $5.00
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2 rtl:flex-row-reverse">
                                            <span className="font-bold text-foreground">
                                                {t('billing:summary.total')}
                                            </span>
                                            <span className="font-bold text-foreground rtl:flex-row-reverse flex gap-1">
                                                <span>${total.toFixed(2)}</span>
                                                <span className="text-muted-foreground font-normal">
                                                    {t('billing:summary.perMonth')}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-6">
                                        <div className="flex justify-between text-sm text-muted-foreground rtl:flex-row-reverse">
                                            <span className="font-bold text-foreground">
                                                {t('billing:summary.dueNow')}
                                            </span>
                                            <span className="font-bold text-foreground rtl:flex-row-reverse gap-1 flex">
                                                <span>$0.0</span>
                                                <span className="text-muted-foreground font-normal">
                                                    {t('billing:summary.perMonth')}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <Button
                                            onClick={() => router.push('/create-company')}
                                            size="lg"
                                            className="w-full"
                                        >
                                            {t('billing:summary.cta')}
                                        </Button>
                                        <p className="text-center text-[10px] font-medium text-muted-foreground leading-relaxed px-4">
                                            {t('billing:summary.footerNote', {
                                                amount: total.toFixed(1),
                                                date: 'Mar 24, 2026',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
