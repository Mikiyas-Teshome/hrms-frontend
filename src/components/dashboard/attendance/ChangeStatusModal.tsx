'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2 } from 'lucide-react';
import { useAdminUpdateAttendanceRecord } from '@/features/attendance/hooks/useAttendance';
import { AttendanceStatus, type AttendanceRecord } from '@/features/attendance/attendance.types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ChangeStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: AttendanceRecord | null;
}

export default function ChangeStatusModal({ isOpen, onClose, record }: ChangeStatusModalProps) {
    const { t } = useTranslation('dashboard');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const updateRecordMutation = useAdminUpdateAttendanceRecord();

    const { control, setValue, watch } = useForm<{ status: AttendanceStatus }>({
        defaultValues: {
            status: AttendanceStatus.PRESENT
        }
    });

    const status = watch('status');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (record && isOpen) {
            setValue('status', record.status);
            setRemarks(record.remarks || '');
        }
    }, [record, isOpen, setValue]);

    const handleSave = () => {
        if (!record) return;

        updateRecordMutation.mutate({
            recordId: record.id,
            clockIn: record.clockIn,
            clockOut: record.clockOut,
            remarks,
            status,
        }, {
            onSuccess: () => {
                toast({
                    title: t('attendance.statusSuccessTitle', 'Status updated'),
                    description: t('attendance.statusSuccessMessage', 'Status updated successfully.'),
                });
                queryClient.invalidateQueries({ queryKey: ['attendance'] });
                onClose();
            },
            onError: (err: any) => {
                toast({
                    title: t('attendance.statusErrorTitle', 'Failed to update status'),
                    description: err.message,
                    variant: 'destructive',
                });
            }
        });
    };

    if (!record) return null;

    const statusOptions = Object.values(AttendanceStatus).map((statusVal) => ({
        label: statusVal,
        value: statusVal,
    }));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border border-border shadow-2xl bg-background text-foreground rounded-2xl">
                <DialogDescription className="sr-only">
                    Modal dialog for changing attendance status.
                </DialogDescription>
                
                <DialogHeader className="px-6 pt-6 pb-2 text-start rtl:text-end font-sans">
                    <DialogTitle className="text-[20px] font-semibold tracking-tight">
                        {t('attendance.changeStatusTitle', 'Change Status')}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-2 space-y-4 text-start rtl:text-end font-sans">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-semibold">{t('attendance.employee', 'Employee')}</Label>
                        <div className="p-2.5 rounded-lg bg-muted text-muted-foreground font-medium text-sm text-start rtl:text-end font-sans">
                            {record.employeeName}
                        </div>
                    </div>

                    <FormSelect
                        id="status"
                        label={t('attendance.status', 'Status')}
                        control={control as any}
                        name="status"
                        options={statusOptions}
                        t={t}
                        containerClassName="flex flex-col gap-1.5 text-start rtl:text-end"
                    />

                    <div className="flex flex-col gap-1.5 text-start rtl:text-end">
                        <Label htmlFor="remarks" className="text-sm font-semibold">{t('attendance.remarks', 'Remarks')}</Label>
                        <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={t('attendance.remarksPlaceholder', 'Add remarks/reasons for modification')}
                            className="rounded-lg border-input bg-background min-h-[80px] text-start rtl:text-end font-sans"
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 py-5 flex flex-row justify-end rtl:flex-row-reverse gap-3 mt-4 font-sans">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6 h-10 rounded-lg text-foreground hover:bg-accent border-[#e5e7eb]"
                    >
                        {t('attendance.cancel', 'Cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateRecordMutation.isPending}
                        className="px-6 h-10 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium min-w-[100px]"
                    >
                        {updateRecordMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                                {t('attendance.saving', 'Saving...')}
                            </>
                        ) : (
                            t('attendance.save', 'Save')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
