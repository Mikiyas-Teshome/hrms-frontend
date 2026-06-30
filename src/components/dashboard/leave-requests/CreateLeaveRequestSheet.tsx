'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import { leaveRequestSchema, type LeaveRequestFormValues } from '@/features/leave-request/schemas/leave-request.schema';
import { useCreateLeaveRequest } from '@/features/leave-request/hooks/useLeaveRequest';
import { useUploadLeaveAttachment } from '@/features/leave-request/hooks/useLeaveRequest';
import { useLeavePoliciesPaginated } from '@/features/leave-policy/hooks/useLeavePolicy';
import { useLeaveCompanyOuId } from '@/features/leave-request/hooks/useLeaveCompanyOuId';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { FormSelect } from '@/components/ui/FormSelect';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

interface CreateLeaveRequestSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const defaultFormValues = {
    leavePolicyId: '',
    reason: '',
} as LeaveRequestFormValues;

const CreateLeaveRequestSheet = ({
    open,
    onOpenChange,
    onSuccess,
}: CreateLeaveRequestSheetProps) => {
    const { t, i18n } = useTranslation('dashboard');
    const { toast } = useToast();
    const isRtl = i18n.language === 'ar';
    const { companyOuId } = useLeaveCompanyOuId();
    const { data: employeeProfile, isLoading: isLoadingProfile } = useMyEmployeeProfile();
    const { mutateAsync: createRequest, isPending } = useCreateLeaveRequest();
    const { mutateAsync: uploadAttachment, isPending: isUploadingAttachment } = useUploadLeaveAttachment();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const { data: policiesConnection, isLoading: isLoadingPolicies } = useLeavePoliciesPaginated(
        companyOuId,
        { status: 'active' },
        { page: 1, pageSize: 500 },
    );
    const leavePolicies = policiesConnection?.items ?? [];

    const form = useForm<LeaveRequestFormValues>({
        resolver: zodResolver(leaveRequestSchema),
        defaultValues: defaultFormValues,
    });

    useEffect(() => {
        if (!open) return;
        form.reset(defaultFormValues);
    }, [open, form]);

    const isLoadingPrerequisites = isLoadingProfile || isLoadingPolicies;
    const hasEmployeeProfile = !!employeeProfile?.id;
    const hasLeavePolicies = leavePolicies.length > 0;
    const canSubmit =
        hasEmployeeProfile &&
        hasLeavePolicies &&
        !isPending &&
        !isUploadingAttachment &&
        !isLoadingPrerequisites;

    const onAttachmentSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        setSelectedFiles(files);
    };

    const onSubmit = async (data: LeaveRequestFormValues) => {
        try {
            if (!employeeProfile?.id) {
                toast({
                    title: t('errors.profileNotFound', 'Employee profile not found'),
                    variant: 'destructive',
                });
                return;
            }

            const uploadedAttachments = await Promise.all(
                selectedFiles.map((file) => uploadAttachment(file)),
            );

            await createRequest({
                employeeId: employeeProfile.id,
                leavePolicyId: data.leavePolicyId,
                startDate: format(data.startDate, 'yyyy-MM-dd'),
                endDate: format(data.endDate, 'yyyy-MM-dd'),
                reason: data.reason,
                attachments: uploadedAttachments.map((attachment) => ({
                    fileName: attachment.fileName,
                    fileUrl: attachment.fileUrl,
                    storageKey: attachment.storageKey,
                    mimeType: attachment.mimeType,
                    size: attachment.size,
                })),
            });

            toast({
                title: t('leaveRequests.successTitle', 'Success'),
                description: t(
                    'leaveRequests.successMessage',
                    'Leave request submitted successfully',
                ),
            });

            onOpenChange(false);
            form.reset(defaultFormValues);
            setSelectedFiles([]);
            onSuccess?.();
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : t('leaveRequests.errorMessage', 'Failed to submit leave request');
            toast({
                title: t('leaveRequests.errorTitle', 'Error'),
                description: message,
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
                        {isLoadingPrerequisites ? (
                            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('common.loading', 'Loading...')}
                            </div>
                        ) : !hasEmployeeProfile ? (
                            <p className="py-8 text-sm text-muted-foreground">
                                {t(
                                    'leaveRequests.profileRequired',
                                    'Your employee profile could not be loaded. Contact HR to link your account.',
                                )}
                            </p>
                        ) : !hasLeavePolicies ? (
                            <p className="py-8 text-sm text-muted-foreground">
                                {t('leaveRequests.noLeavePolicies')}
                            </p>
                        ) : (
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
                                                id="leavePolicyId"
                                                label={t('leaveRequests.leavePolicy')}
                                                placeholder={t('leaveRequests.selectPolicy')}
                                                control={form.control}
                                                name="leavePolicyId"
                                                error={form.formState.errors.leavePolicyId}
                                                options={leavePolicies.map((policy) => ({
                                                    label: policy.policyName,
                                                    value: policy.id,
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
                                            <div className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('leaveRequests.attachments', 'Attachments')}
                                                </FormLabel>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={onAttachmentSelect}
                                                    className="block w-full text-sm text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
                                                />
                                                {selectedFiles.length > 0 && (
                                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                                        {selectedFiles.map((file) => (
                                                            <li key={file.name}>{file.name}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </div>

                    <div className="pt-6 mt-auto shrink-0 flex items-center justify-end gap-3 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedFiles([]);
                                onOpenChange(false);
                            }}
                            className="h-11 px-6 rounded-xl font-semibold transition-all hover:bg-muted"
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            form="create-leave-request-form"
                            type="submit"
                            disabled={!canSubmit}
                            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                        >
                            {(isPending || isUploadingAttachment) && <Loader2 className="h-4 w-4 animate-spin" />}
                            {t('leaveRequests.submit', 'Submit Request')}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CreateLeaveRequestSheet;
