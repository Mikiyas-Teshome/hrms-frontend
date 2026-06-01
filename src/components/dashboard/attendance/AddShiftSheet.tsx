'use client';

import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { X, Clock, Loader2 } from 'lucide-react';
import { FormSection } from '@/components/ui/form-section';
import { Separator } from '@/components/ui/separator';
import { shiftSchema, ShiftFormValues } from '../schemas/shift.schema';
import { useCreateShiftTemplate } from '@/features/attendance/hooks/useAttendance';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { WEEK_DAYS } from '@/features/attendance/attendance.utils';
import { useTranslation } from 'react-i18next';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { FormSelect } from '@/components/ui/FormSelect';
import { ShiftType } from '@/features/attendance/attendance.types';

interface AddShiftSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultCompanyId?: string;
}

export function AddShiftSheet({ open, onOpenChange, defaultCompanyId }: AddShiftSheetProps) {
    const { t } = useTranslation('dashboard');
    const { companies: companiesData, isLoading: isLoadingHierarchy } = useCompanyOptions();

    const { mutate: createShift, isPending } = useCreateShiftTemplate();
    const { toast } = useToast();

    const form = useForm<ShiftFormValues>({
        resolver: zodResolver(shiftSchema) as any,
        defaultValues: {
            name: '',
            startTime: '',
            endTime: '',
            breakDuration: 0,
            flexibleMinutes: 0,
            overtimeAllowed: false,
            workingDays: [1, 2, 3, 4, 5], // Default Mon-Fri
            companyOuId: defaultCompanyId || '',
            type: ShiftType.DAY,
            isActive: true,
        },
    });

    const formCompanyOuId = useWatch({ control: form.control, name: 'companyOuId' });

    useEffect(() => {
        if (open && defaultCompanyId) {
            form.setValue('companyOuId', defaultCompanyId);
        }
    }, [open, defaultCompanyId, form]);

    useEffect(() => {
        if (companiesData?.length && !formCompanyOuId) {
            form.setValue('companyOuId', companiesData[0].id, { shouldValidate: true });
        }
    }, [companiesData, formCompanyOuId, form]);

    const onSubmit = (data: ShiftFormValues) => {
        if (!data.companyOuId) return;

        const currentDate = new Date().toISOString().split('T')[0];
        const parseTime = (timeStr: string) => {
            try {
                if (timeStr.includes('T')) return new Date(timeStr).toISOString();
                const formattedTimeStr = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
                return new Date(`${currentDate}T${formattedTimeStr}`).toISOString();
            } catch {
                return new Date().toISOString();
            }
        };

        createShift(
            {
                ...data,
                startTime: parseTime(data.startTime),
                endTime: parseTime(data.endTime),
            },
            {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: 'Shift template created successfully',
                        variant: 'success',
                    });
                    onOpenChange(false);
                    form.reset();
                },
                onError: (error: any) => {
                    toast({
                        title: 'Error',
                        description: error.message || 'Failed to create shift template',
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                className="sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
            >
                <SheetHeader className="flex flex-row items-center justify-between">
                    <SheetTitle className="text-2xl font-bold text-foreground">
                        Add a Shift
                    </SheetTitle>
                    <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg">
                        <X className="h-5 w-5" strokeWidth={1.33} />
                        <span className="sr-only">Close</span>
                    </SheetClose>
                </SheetHeader>
                <Separator />

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <Form {...form}>
                        <form
                            id="shift-form"
                            onSubmit={form.handleSubmit(onSubmit as any)}
                            className="space-y-8"
                        >
                            {/* Shift Info Section */}
                            <FormSection title="Shift info">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <FormSelect
                                            id="companyOuId"
                                            label={t('setup.selectCompany', {
                                                defaultValue: 'Select Company',
                                            })}
                                            placeholder={
                                                isLoadingHierarchy
                                                    ? t('setup.loadingCompanies', {
                                                          defaultValue: 'Loading...',
                                                      })
                                                    : t('setup.selectCompanyPlaceholder', {
                                                          defaultValue: 'Select a company',
                                                      })
                                            }
                                            control={form.control as any}
                                            name="companyOuId"
                                            error={form.formState.errors.companyOuId}
                                            options={
                                                companiesData?.map((c) => ({
                                                    label: c.name,
                                                    value: c.id,
                                                })) || []
                                            }
                                            t={t}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control as any}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    Shift name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter shift name (e.g. Morning Shift)"
                                                        {...field}
                                                        className="h-9 border-border focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormSelect
                                        id="shift-type"
                                        label="Shift Type"
                                        control={form.control as any}
                                        name="type"
                                        placeholder="Select shift type"
                                        t={t}
                                        options={Object.values(ShiftType).map((type) => ({
                                            label: type.charAt(0) + type.slice(1).toLowerCase(),
                                            value: type,
                                        }))}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="overtimeAllowed"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium">
                                                        Overtime Allowed
                                                    </FormLabel>
                                                    <div className="text-[12px] text-muted-foreground">
                                                        Enable if this shift allows overtime
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium">
                                                        Active
                                                    </FormLabel>
                                                    <div className="text-[12px] text-muted-foreground">
                                                        Enable if this shift is currently active
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </FormSection>

                            {/* Shift Details Section */}
                            <FormSection title="Shift details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <FormField
                                        control={form.control as any}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    Start time
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                        <Input
                                                            type="time"
                                                            {...field}
                                                            className="h-9 pl-9 border-border rounded-lg"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="endTime"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    End time
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                        <Input
                                                            type="time"
                                                            {...field}
                                                            className="h-9 pl-9 border-border rounded-lg"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="breakDuration"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    Break (min)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter break minutes"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.valueAsNumber)
                                                        }
                                                        className="h-9 border-border rounded-lg"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="flexibleMinutes"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    Flexible Minutes
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter flexible minutes"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.valueAsNumber)
                                                        }
                                                        className="h-9 border-border rounded-lg"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </FormSection>

                            <FormSection title="Working Days">
                                <FormField
                                    control={form.control as any}
                                    name="workingDays"
                                    render={() => (
                                        <FormItem className="space-y-4">
                                            <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                                                {WEEK_DAYS.map((day) => (
                                                    <FormField
                                                        key={day.value}
                                                        control={form.control as any}
                                                        name="workingDays"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={day.value}
                                                                    className="flex flex-col items-center space-y-2"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(
                                                                                day.value,
                                                                            )}
                                                                            onCheckedChange={(
                                                                                checked: boolean,
                                                                            ) => {
                                                                                return checked
                                                                                    ? field.onChange(
                                                                                          [
                                                                                              ...field.value,
                                                                                              day.value,
                                                                                          ],
                                                                                      )
                                                                                    : field.onChange(
                                                                                          field.value?.filter(
                                                                                              (
                                                                                                  value: number,
                                                                                              ) =>
                                                                                                  value !==
                                                                                                  day.value,
                                                                                          ),
                                                                                      );
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="text-xs font-normal">
                                                                        {day.label}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            );
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </FormSection>
                        </form>
                    </Form>
                </div>

                <SheetFooter className="border-t border-border mt-auto shrink-0 pt-6">
                    <div className="flex justify-end gap-3 w-full sm:w-auto">
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                className="h-9 min-w-25 px-4 font-medium rounded-lg border-muted-foreground text-foreground hover:bg-muted flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            form="shift-form"
                            disabled={isPending}
                            className="h-9 min-w-25 px-4 font-medium rounded-lg bg-primary hover:bg-primary/80 text-white flex-1 sm:flex-none"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save shift
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
