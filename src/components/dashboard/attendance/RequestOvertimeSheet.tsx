'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { X, Loader2 } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetTitle,
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
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/FormSelect';
import { DatePicker } from '@/components/ui/date-picker';
import { overtimeRequestSchema, OvertimeRequestFormValues } from '../schemas/overtime.schema';
import { useToast } from '@/hooks/use-toast';

interface RequestOvertimeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RequestOvertimeSheet({ open, onOpenChange }: RequestOvertimeSheetProps) {
    const { t } = useTranslation('dashboard');
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<OvertimeRequestFormValues>({
        resolver: zodResolver(overtimeRequestSchema),
        defaultValues: {
            dateWorked: new Date(),
            hoursWorked: 0.5,
            reason: '',
            justification: '',
        },
    });

    const onSubmit = async (data: OvertimeRequestFormValues) => {
        setIsSubmitting(true);
        try {
            console.log('Overtime request data:', data);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            toast({
                title: 'Success',
                description: 'Overtime request submitted successfully',
                variant: 'success',
            });
            onOpenChange(false);
            form.reset();
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to submit overtime request',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const overtimeReasons = [
        { label: t('attendance.reasons.urgent_task'), value: 'urgent_task' },
        { label: t('attendance.reasons.project_deadline'), value: 'project_deadline' },
        { label: t('attendance.reasons.shift_coverage'), value: 'shift_coverage' },
        { label: t('attendance.reasons.system_maintenance'), value: 'system_maintenance' },
        { label: t('attendance.reasons.emergency_support'), value: 'emergency_support' },
        { label: t('attendance.reasons.others'), value: 'others' },
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showCloseButton={false}
                className="w-full sm:max-w-[576px] p-0 flex flex-col h-full border-0 shadow-2xl bg-background rtl:left-0 rtl:right-auto"
            >
                {/* Main Container - padding: 24px 40px; gap: 24px; */}
                <div className="flex flex-col gap-6 px-10 py-6 h-full overflow-hidden">
                    
                    {/* Header Section - Frame 122 - height: 68px; */}
                    <div className="flex flex-col items-end w-full h-[68px] shrink-0">
                        <SheetClose asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-11 h-9 rounded-lg hover:bg-muted"
                            >
                                <X className="size-5 text-foreground/80" strokeWidth={1.33} />
                                <span className="sr-only">Close</span>
                            </Button>
                        </SheetClose>

                        {/* Title - Heading 2 - height: 32px; */}
                        <div className="w-full h-8 flex items-center mt-2">
                            <SheetTitle className="text-2xl font-bold text-foreground leading-8 ">
                                {t('attendance.requestOvertimeTitle')}
                            </SheetTitle>
                        </div>
                    </div>

                    {/* Separator - height: 0px; border: 1px solid #E5E5E5; */}
                    <div className="w-full border-t border-border shrink-0" />

                    {/* Form Content - Flex Vertical - gap: 32px; */}
                    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-8">
                        <Form {...form}>
                            <form id="overtime-request-form" onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-8">
                                
                                {/* Info Section - Frame 56 - background: #FFFFFF; border: 1px solid rgba(229, 229, 229, 0.8); */}
                                <div className="w-full flex flex-col rounded-xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.04)] overflow-hidden">
                                    
                                    {/* Section Header - Frame 59 - height: 50px; background: #F8F8F8; */}
                                    <div className="w-full h-[50px] bg-card-header-background flex items-center px-6">
                                        <h3 className="text-sm font-semibold text-foreground leading-none ">
                                            {t('attendance.requestOvertimeInfo')}
                                        </h3>
                                    </div>

                                    {/* Card Content - gap: 16px; padding: 0px 24px; */}
                                    <div className="flex flex-col gap-4 px-6 py-6 w-full">
                                        
                                        {/* Row: Date and Hours - Container - gap: 24px; */}
                                        <div className="flex flex-row gap-6 w-full">
                                            
                                            {/* Date Worked - Field - width: 211px; */}
                                            <FormField
                                                control={form.control}
                                                name="dateWorked"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 flex flex-col gap-3">
                                                        <FormLabel className="text-sm font-medium text-foreground  leading-5">
                                                            {t('attendance.dateWorked')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            {/* InputGroup - height: 36px; padding: 4px 12px; gap: 8px; */}
                                                            <div className="relative w-full h-9 bg-background border border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg flex items-center px-0">
                                                                <DatePicker 
                                                                    value={field.value} 
                                                                    onChange={field.onChange}
                                                                    placeholder="DD/MM/YYYY"
                                                                    className="h-full border-0 bg-transparent shadow-none px-3 focus-visible:ring-0 font-normal text-foreground "
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Hours Worked - Field - width: 211px; */}
                                            <FormField
                                                control={form.control}
                                                name="hoursWorked"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 flex flex-col gap-3">
                                                        <FormLabel className="text-sm font-medium text-foreground  leading-5">
                                                            {t('attendance.hoursWorked')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            {/* InputGroup - height: 36px; padding: 4px 12px; gap: 8px; */}
                                                            <div className="relative w-full h-9 bg-background border border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg flex items-center px-3 gap-2">
                                                                <Input
                                                                    type="number"
                                                                    step="0.5"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                    className="flex-1 h-full border-0 bg-transparent shadow-none p-0 focus-visible:ring-0 font-normal text-foreground "
                                                                />
                                                                {/* KbdGroup for 'Hours' label */}
                                                                <div className="h-5 px-2 bg-secondary rounded-md flex items-center justify-center shrink-0">
                                                                    <span className="text-[12px] text-muted-foreground ">
                                                                        Hours
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Reason for Overtime - Field - width: 446px; */}
                                        <div className="w-full">
                                            <FormSelect
                                                id="reason"
                                                label={t('attendance.reasonForOvertime')}
                                                placeholder="Select a reason"
                                                control={form.control}
                                                name="reason"
                                                options={overtimeReasons}
                                                t={t}
                                                containerClassName="flex flex-col gap-3"
                                            />
                                        </div>

                                        {/* Justification - Field - height: 142px; */}
                                        <div className="w-full">
                                            <FormField
                                                control={form.control}
                                                name="justification"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col gap-3">
                                                        <FormLabel className="text-sm font-medium text-foreground  leading-5">
                                                            {t('attendance.justification')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            {/* InputGroup - height: 110px; border: 1px solid #E5E5E5; */}
                                                            <div className="flex flex-col w-full h-[110px] bg-background border border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg overflow-hidden">
                                                                <Textarea
                                                                    placeholder={t('attendance.justificationPlaceholder')}
                                                                    {...field}
                                                                    className="flex-1 min-h-[64px] border-0 focus-visible:ring-0 resize-none  p-3 text-sm text-foreground placeholder:text-muted-foreground"
                                                                />
                                                                {/* InputGroup / Addon Block Bottom - height: 46px; padding: 6px 12px 12px; */}
                                                                <div className="h-[46px] w-full flex items-center justify-between px-3 pb-3 border-0 bg-transparent">
                                                                    <div className="flex items-center gap-2">
                                                                        {/* Decorative placeholder */}
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
                                </div>
                            </form>
                        </Form>
                    </div>

                    {/* Footer - Container - padding: 16px 0px; gap: 24px; height: 68px; */}
                    <div className="flex justify-end items-center gap-6 w-full h-[68px] py-4 border-t border-border shrink-0">
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                className="h-9 w-[100px] border-[#5185F2] text-[#2865E3] hover:bg-[#5185F2]/5 font-medium rounded-lg px-4  shadow-xs"
                            >
                                {t('attendance.cancel')}
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            form="overtime-request-form"
                            disabled={isSubmitting}
                            className="h-9 w-[131px] bg-[#2865E3] hover:bg-[#2865E3]/90 text-[#FAFAFA] font-medium rounded-lg px-4 "
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            <span className="truncate">{t('attendance.submitRequest')}</span>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
