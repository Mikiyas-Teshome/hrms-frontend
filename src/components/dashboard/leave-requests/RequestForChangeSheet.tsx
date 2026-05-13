'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ArrowLeft, ArrowRight, CalendarDays, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { requestForChangeSchema, type RequestForChangeFormValues } from '../schemas/request-for-change.schema';
import { cn } from '@/lib/utils';

interface RequestForChangeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBack?: () => void;
}

const RequestForChangeSheet: React.FC<RequestForChangeSheetProps> = ({ open, onOpenChange, onBack }) => {
    const { t, i18n } = useTranslation('dashboard');
    const isRTL = i18n.language === 'ar';

    const form = useForm<RequestForChangeFormValues>({
        resolver: zodResolver(requestForChangeSchema),
        defaultValues: {
            acceptedFrom: '',
            acceptedTo: '',
            comment: '',
        },
    });

    const onSubmit = (data: RequestForChangeFormValues) => {
        onOpenChange(false);
        form.reset();
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            onOpenChange(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRTL ? 'left' : 'right'}
                showCloseButton={false}
                className="w-full sm:max-w-200 p-0 flex flex-col h-full border-0 shadow-2xl bg-background focus:outline-none"
            >
                {/* Header matching Frame 122 & 209 */}
                <SheetHeader className="px-10 py-6">
                    <div className="flex flex-row items-center justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground/80"
                        >
                            {isRTL ? (
                                <ArrowRight className="h-4 w-4" />
                            ) : (
                                <ArrowLeft className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                                {t('requestForChange.back', 'Back')}
                            </span>
                        </button>
                        <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-foreground/80 h-9 w-11 flex justify-center items-center">
                            <X className="h-5 w-5" strokeWidth={1.33} />
                        </SheetClose>
                    </div>
                    <div className="mt-6">
                        <SheetTitle className="text-2xl font-bold text-foreground leading-8">
                            {t('requestForChange.title', 'Request for change')}
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <Separator className="bg-border" />

                <div className="flex-1 overflow-y-auto no-scrollbar px-10 py-6">
                    <Form {...form}>
                        <form
                            id="request-change-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            {/* Card Wrapper matching Frame 56 */}
                            <div className="bg-card border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden pb-4">
                                {/* Title matching Frame 59 */}
                                <div className="bg-card-header-background h-12.5 px-6 flex items-center mb-4">
                                    <h3 className="font-semibold text-sm text-foreground">
                                        {t('requestForChange.changeDetails', 'Change details')}
                                    </h3>
                                </div>

                                <div className="px-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="acceptedFrom"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        {t(
                                                            'requestForChange.acceptedFrom',
                                                            'Accepted from',
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <CalendarDays
                                                                className={cn(
                                                                    'absolute top-2.5 h-4 w-4 text-foreground',
                                                                    isRTL ? 'right-3' : 'left-3',
                                                                )}
                                                                strokeWidth={1.33}
                                                            />
                                                            <Input
                                                                placeholder="DD/MM/YYYY"
                                                                {...field}
                                                                className={cn(
                                                                    'h-9 border-border focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-background',
                                                                    isRTL ? 'pr-10' : 'pl-10',
                                                                )}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="acceptedTo"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        {t(
                                                            'requestForChange.acceptedTo',
                                                            'Accepted to',
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <CalendarDays
                                                                className={cn(
                                                                    'absolute top-2.5 h-4 w-4 text-foreground',
                                                                    isRTL ? 'right-3' : 'left-3',
                                                                )}
                                                                strokeWidth={1.33}
                                                            />
                                                            <Input
                                                                placeholder="DD/MM/YYYY"
                                                                {...field}
                                                                className={cn(
                                                                    'h-9 border-border focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-background',
                                                                    isRTL ? 'pr-10' : 'pl-10',
                                                                )}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="comment"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('requestForChange.comment', 'Comment')}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="bg-background border border-border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg">
                                                        <Textarea
                                                            placeholder={t(
                                                                'requestForChange.commentPlaceholder',
                                                                'Add comment',
                                                            )}
                                                            {...field}
                                                            className="min-h-16 border-0 focus-visible:ring-0 shadow-none resize-none p-3"
                                                        />
                                                        <div className="flex justify-between items-center px-3 pb-3">
                                                            <div className="flex gap-2 text-muted-foreground">
                                                                {/* Potential rich text/icons as per CSS addons block if needed */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-end gap-6 pt-4 pb-10 w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="h-9 min-w-25 border-[#5185F2] text-primary font-medium rounded-lg shadow-sm"
                                >
                                    {t('requestForChange.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="h-9 min-w-25 px-4 font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                >
                                    {form.formState.isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t('requestForChange.send', 'Send')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default RequestForChangeSheet;
