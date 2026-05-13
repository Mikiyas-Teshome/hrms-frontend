'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField as OriginalFormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { leaveRequestSchema, type LeaveRequestFormValues } from '../schemas/leave-request.schema';
import { useCreateLeaveRequest } from '@/features/leave-request/hooks/useLeaveRequest';
import { useLeaveTypes } from '@/features/leave-type/hooks/useLeaveType';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { FormSelect } from '@/components/ui/FormSelect';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

interface CreateLeaveRequestSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const CreateLeaveRequestSheet = ({
    open,
    onOpenChange,
    onSuccess,
}: CreateLeaveRequestSheetProps) => {
    const { t, i18n } = useTranslation('dashboard');
    const { toast } = useToast();
    const isRtl = i18n.language === 'ar';
    const { data: profile } = useProfile();
    const { data: employeeProfile } = useMyEmployeeProfile();
    const { mutateAsync: createRequest, isPending } = useCreateLeaveRequest();

    // Use companyId from profile to fetch leave types
    const companyId = profile?.companyId;
    const { data: leaveTypes, isLoading: isLoadingLeaveTypes } = useLeaveTypes(companyId);

    const form = useForm<LeaveRequestFormValues>({
        resolver: zodResolver(leaveRequestSchema),
        defaultValues: {
            leaveTypeId: '',
            reason: '',
        },
    });

    const onSubmit = async (data: LeaveRequestFormValues) => {
        try {
            if (!employeeProfile?.id) {
                toast({
                    title: t('errors.profileNotFound', 'Employee profile not found'),
                    variant: 'destructive',
                });
                return;
            }

            await createRequest({
                employeeId: employeeProfile.id,
                leaveTypeId: data.leaveTypeId,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate.toISOString(),
                reason: data.reason,
            });

            toast({
                title: t('leaveRequests.successTitle', 'Success'),
                description: t(
                    'leaveRequests.successMessage',
                    'Leave request submitted successfully',
                ),
            });

            onOpenChange(false);
            form.reset();
            onSuccess?.();
        } catch {
            toast({
                title: t('leaveRequests.errorTitle', 'Error'),
                description: t('leaveRequests.errorMessage', 'Failed to submit leave request'),
                variant: 'destructive',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                side={isRtl ? 'left' : 'right'}
                className="w-full sm:max-w-xl p-0 flex flex-col h-full border-0 shadow-2xl overflow-hidden"
            >
                <div className="px-10 py-6 space-y-6 flex flex-col h-full">
                    <SheetHeader className="flex flex-row items-center justify-between shrink-0">
                        <SheetTitle className="text-2xl font-bold text-foreground">
                            {t('leaveRequests.createTitle', 'Create Leave Request')}
                        </SheetTitle>
                        <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-muted-foreground border-solid h-9 w-[44px] flex justify-center items-center">
                            <X className="h-5 w-5" strokeWidth={1.33} />
                            <span className="sr-only">{t('common.close', 'Close')}</span>
                        </SheetClose>
                    </SheetHeader>

                    <Separator className="shrink-0" />

                    <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                        <Form {...form}>
                            <form
                                id="create-leave-request-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <div className="bg-card border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                                    <div className="bg-card-header-background h-12.5 px-6 flex items-center border-b">
                                        <h3 className="font-semibold text-sm text-foreground">
                                            {t('leaveRequests.sectionInfo', 'Leave request info')}
                                        </h3>
                                    </div>

                                    <div className="p-6 md:p-8 space-y-6">
                                        <FormSelect
                                            id="leaveTypeId"
                                            label={t('leaveRequests.leaveType', 'Leave type')}
                                            placeholder={
                                                isLoadingLeaveTypes
                                                    ? t('common.loading', 'Loading...')
                                                    : t(
                                                          'leaveRequests.selectType',
                                                          'Select leave type',
                                                      )
                                            }
                                            control={form.control}
                                            name="leaveTypeId"
                                            error={form.formState.errors.leaveTypeId}
                                            options={(leaveTypes || []).map((type) => ({
                                                label: type.name,
                                                value: type.id,
                                            }))}
                                            t={t}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <OriginalFormField
                                                control={form.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-3">
                                                        <FormLabel className="text-sm font-medium text-foreground">
                                                            {t('leaveRequests.from', 'From')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <DatePicker
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="DD/MM/YYYY"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <OriginalFormField
                                                control={form.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col space-y-3">
                                                        <FormLabel className="text-sm font-medium text-foreground">
                                                            {t('leaveRequests.to', 'To')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <DatePicker
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="DD/MM/YYYY"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <OriginalFormField
                                            control={form.control}
                                            name="reason"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        {t('leaveRequests.reason', 'Reason')}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={t(
                                                                'leaveRequests.reasonPlaceholder',
                                                                'Add reason',
                                                            )}
                                                            {...field}
                                                            className="min-h-30 resize-none border-border"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>

                    <div className="pt-6 mt-auto shrink-0 flex items-center justify-end gap-3 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-11 px-6 rounded-xl font-semibold transition-all hover:bg-muted"
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            form="create-leave-request-form"
                            type="submit"
                            disabled={isPending}
                            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {t('leaveRequests.submit', 'Submit Request')}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CreateLeaveRequestSheet;
