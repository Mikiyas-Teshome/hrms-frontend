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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import { Loader2 } from 'lucide-react';
import { useAdminUpdateAttendanceRecord } from '@/features/attendance/hooks/useAttendance';
import { AttendanceStatus, type AttendanceRecord } from '@/features/attendance/attendance.types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface EditAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: AttendanceRecord | null;
}

const formatForDateTimeLocal = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function EditAttendanceModal({ isOpen, onClose, record }: EditAttendanceModalProps) {
    const { t } = useTranslation('dashboard');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const updateRecordMutation = useAdminUpdateAttendanceRecord();

    const [clockIn, setClockIn] = useState('');
    const [clockOut, setClockOut] = useState('');
    const [remarks, setRemarks] = useState('');

    const { control, setValue, watch } = useForm<{ status: AttendanceStatus }>({
        defaultValues: {
            status: AttendanceStatus.PRESENT
        }
    });

    const status = watch('status');

    // Sync state when modal opens/record changes
    useEffect(() => {
        if (record && isOpen) {
            setClockIn(formatForDateTimeLocal(record.clockIn));
            setClockOut(formatForDateTimeLocal(record.clockOut));
            setRemarks(record.remarks || '');
            setValue('status', record.status);
        }
    }, [record, isOpen, setValue]);

    const handleSave = () => {
        if (!record) return;

        updateRecordMutation.mutate({
            recordId: record.id,
            clockIn: clockIn ? new Date(clockIn).toISOString() : null,
            clockOut: clockOut ? new Date(clockOut).toISOString() : null,
            remarks,
            status,
        }, {
            onSuccess: () => {
                toast({
                    title: t('attendance.editSuccessTitle', 'Attendance updated'),
                    description: t('attendance.editSuccessMessage', 'The record has been updated successfully.'),
                });
                queryClient.invalidateQueries({ queryKey: ['attendance'] });
                onClose();
            },
            onError: (err: any) => {
                toast({
                    title: t('attendance.editErrorTitle', 'Failed to update attendance'),
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
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-border shadow-2xl bg-background text-foreground rounded-2xl">
                <DialogDescription className="sr-only">
                    Modal dialog for editing attendance record.
                </DialogDescription>
                
                <DialogHeader className="px-6 pt-6 pb-2 text-start rtl:text-end font-sans">
                    <DialogTitle className="text-[20px] font-semibold tracking-tight">
                        {t('attendance.editRecordTitle', 'Edit Attendance Record')}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-2 space-y-4 text-start rtl:text-end font-sans">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm font-semibold">{t('attendance.employee', 'Employee')}</Label>
                        <div className="p-2.5 rounded-lg bg-muted text-muted-foreground font-medium text-sm text-start rtl:text-end font-sans">
                            {record.employeeName}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 text-start rtl:text-end">
                            <Label htmlFor="clockIn" className="text-sm font-semibold">{t('attendance.clockIn', 'Clock In')}</Label>
                            <Input
                                id="clockIn"
                                type="datetime-local"
                                value={clockIn}
                                onChange={(e) => setClockIn(e.target.value)}
                                className="rounded-lg h-10 border-input bg-background text-start rtl:text-end font-sans"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 text-start rtl:text-end">
                            <Label htmlFor="clockOut" className="text-sm font-semibold">{t('attendance.clockOut', 'Clock Out')}</Label>
                            <Input
                                id="clockOut"
                                type="datetime-local"
                                value={clockOut}
                                onChange={(e) => setClockOut(e.target.value)}
                                className="rounded-lg h-10 border-input bg-background text-start rtl:text-end font-sans"
                            />
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
