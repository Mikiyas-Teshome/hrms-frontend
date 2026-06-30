'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/FormSelect';
import { holidaySchema, type HolidayValues } from '@/components/onboarding/schemas/holiday';
import { cn } from '@/lib/utils';

interface AddHolidaySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: HolidayValues) => void;
    initialData?: HolidayValues | null;
    defaultCalendarType?: 'gregorian' | 'hijri' | 'custom';
}

export function AddHolidaySheet({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    defaultCalendarType,
}: AddHolidaySheetProps) {
    const { t, i18n } = useTranslation('hrPolicies');
    const isRTL = i18n.language === 'ar';
    const isEditing = !!initialData;

    const hideCalendarType = Boolean(defaultCalendarType);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<HolidayValues>({
        resolver: zodResolver(holidaySchema),
        defaultValues: {
            name: '',
            date: '',
            isReligious: false,
            type: 'gregorian',
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        const resolvedCalendarType = defaultCalendarType || initialData?.type || 'gregorian';

        if (initialData) {
            reset({
                ...initialData,
                type: hideCalendarType ? resolvedCalendarType : initialData.type,
            });
            return;
        }

        reset({
            name: '',
            date: '',
            isReligious: false,
            type: resolvedCalendarType,
        });
    }, [open, reset, initialData, defaultCalendarType, hideCalendarType]);

    const handleFormSubmit = (data: HolidayValues) => {
        onSubmit({
            ...data,
            type: defaultCalendarType || data.type,
        });
        onOpenChange(false);
    };

    const sheetTitle = isEditing
        ? t('holidays.addHoliday.titleUpdate', { defaultValue: 'Edit custom holiday' })
        : t('holidays.addHoliday.title');

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRTL ? 'left' : 'right'}
                className="w-full max-w-full sm:max-w-[600px] p-0 flex flex-col h-full border-l border-border/50 overflow-hidden"
            >
                <SheetHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b border-border/30 shrink-0">
                    <SheetTitle className="text-xl sm:text-2xl font-bold text-foreground leading-tight pr-10">
                        {sheetTitle}
                    </SheetTitle>
                </SheetHeader>

                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-24"
                >
                    <div className="border border-border rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-background">
                        <div className="bg-muted/50 px-4 py-3 border-b border-border">
                            <span className="text-sm font-semibold text-foreground">
                                {t('holidays.addHoliday.holidayInfo', { defaultValue: 'Holiday details' })}
                            </span>
                        </div>

                        <div className="p-4 sm:p-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-medium text-foreground">
                                    {t('holidays.addHoliday.holidayName')}
                                </Label>
                                <Input
                                    {...register('name')}
                                    placeholder={t('holidays.addHoliday.holidayNamePlaceholder')}
                                    className={cn(
                                        'h-9 rounded-lg border-border bg-background px-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]',
                                        errors.name && 'border-destructive',
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-medium text-foreground">
                                    {t('holidays.addHoliday.holidayDate')}
                                </Label>
                                <Input
                                    type="date"
                                    {...register('date')}
                                    className={cn(
                                        'h-9 rounded-lg border-border bg-background px-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] dark:scheme-dark',
                                        errors.date && 'border-destructive text-start',
                                    )}
                                />
                            </div>

                            {!hideCalendarType && (
                                <FormSelect
                                    id="type"
                                    label={t('holidays.addHoliday.calendarType', {
                                        defaultValue: 'Calendar Type',
                                    })}
                                    placeholder="Calendar Type"
                                    control={control}
                                    name="type"
                                    options={[
                                        {
                                            label: 'Standard Shift (Gregorian)',
                                            value: 'gregorian',
                                        },
                                        { label: 'Hijri Calendar', value: 'hijri' },
                                        { label: 'Custom Schedule', value: 'custom' },
                                    ]}
                                    t={t}
                                />
                            )}

                            <div className="flex items-center gap-2 rtl:flex-row-reverse">
                                <Label className="text-sm font-medium text-foreground flex-1">
                                    {t('holidays.addHoliday.isReligious', {
                                        defaultValue: 'Is Religious Holiday',
                                    })}
                                </Label>
                                <input
                                    type="checkbox"
                                    {...register('isReligious')}
                                    className="w-4 h-4 rounded border-border"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-4 sm:p-6 border-t border-border/30 bg-background flex justify-end gap-3 sm:gap-6 shrink-0 z-10">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="h-10 px-8 rounded-lg border-border text-foreground hover:bg-muted/50"
                    >
                        {t('holidays.addHoliday.actions.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit(handleFormSubmit)}
                        className="h-10 px-8 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-md shadow-primary/20"
                    >
                        {t('holidays.addHoliday.actions.save')}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
