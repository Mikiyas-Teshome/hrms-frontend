'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet';
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
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    name: '',
                    date: '',
                    isReligious: false,
                    type: defaultCalendarType || 'gregorian',
                });
            }
        }
    }, [open, reset, initialData, defaultCalendarType]);

    const handleFormSubmit = (data: HolidayValues) => {
        onSubmit(data);
        onOpenChange(false);
    };

    // Helper to format date for display in the input (YYYY-MM-DD)
    // The input type="date" expects this format.

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRTL ? 'left' : 'right'}
                showCloseButton={false}
                className="w-full sm:max-w-200! border-none p-0 focus:outline-none"
            >
                <div className="flex h-full flex-col bg-background overflow-y-auto">
                    {/* Header Section */}
                    <div className="flex flex-col px-10 pt-6 gap-6">
                        <div className="flex justify-end h-17 items-start">
                            <SheetClose asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-[44px] h-9 p-[8px_12px] rounded-lg hover:bg-muted"
                                >
                                    <X className="size-5 text-foreground/80" strokeWidth={1.33} />
                                </Button>
                            </SheetClose>
                        </div>

                        <div className="flex flex-col gap-6">
                            <SheetTitle className="text-start text-2xl font-bold leading-8 text-foreground p-0 ">
                                {initialData
                                    ? 'Edit custom holiday'
                                    : t('holidays.addHoliday.title')}
                            </SheetTitle>
                            <div className="w-full border-t border-border" />
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit(handleFormSubmit)}
                        className="flex flex-1 flex-col px-10 py-6 gap-8"
                    >
                        {/* Holiday Info Card */}
                        <div className="flex flex-col w-full rounded-xl border border-border/80 bg-card shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="flex h-12.5 items-center bg-muted px-6">
                                <h3 className=" text-sm font-semibold text-foreground">
                                    {initialData
                                        ? 'Edit custom holiday'
                                        : t('holidays.addHoliday.title')}
                                </h3>
                            </div>

                            <div className="flex flex-col gap-4 px-6 py-6">
                                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                                    {/* Holiday Name */}
                                    <div className="flex flex-col gap-6">
                                        <Label className=" text-sm font-medium text-foreground leading-5">
                                            {t('holidays.addHoliday.holidayName')}
                                        </Label>
                                        <Input
                                            {...register('name')}
                                            placeholder={t(
                                                'holidays.addHoliday.holidayNamePlaceholder',
                                            )}
                                            className={cn(
                                                'h-9 rounded-lg border-border bg-background px-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] ',
                                                errors.name && 'border-destructive',
                                            )}
                                        />
                                    </div>

                                    {/* Holiday Date */}
                                    <div className="flex flex-col gap-6">
                                        <Label className=" text-sm font-medium text-foreground leading-5">
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

                                    {/* Calendar Type */}
                                    <div className="flex flex-col gap-6">
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
                                    </div>

                                    {/* Is Religious */}
                                    <div className="flex flex-col gap-6 justify-center mt-2">
                                        <div className="flex items-center gap-2 rtl:flex-row-reverse w-full">
                                            <Label className="text-sm font-medium text-foreground leading-5 flex-1">
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
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-6 py-4 h-17">
                            <SheetClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 w-full sm:w-25 border-primary/50 text-sm font-medium text-primary shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-primary/5 rounded-lg "
                                >
                                    {t('holidays.addHoliday.actions.cancel')}
                                </Button>
                            </SheetClose>
                            <Button
                                type="submit"
                                className="h-9 w-full sm:w-33.5 bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 rounded-lg "
                            >
                                {t('holidays.addHoliday.actions.save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
