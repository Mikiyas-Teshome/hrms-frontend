'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PayrollCycleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: { cycle: string; processingDay: string };
    onSave: (data: { cycle: string; processingDay: string }) => void;
}

export function PayrollCycleModal({
    isOpen,
    onOpenChange,
    initialData,
    onSave,
}: PayrollCycleModalProps) {
    const { t } = useTranslation('payrollCycleModal');
    const [cycle, setCycle] = useState(initialData?.cycle ?? 'monthly');
    const [processingDay, setProcessingDay] = useState(
        initialData?.processingDay ?? '25th of the month',
    );

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen && !prevIsOpen) {
        setPrevIsOpen(true);
        setCycle(initialData?.cycle ?? 'monthly');
        setProcessingDay(initialData?.processingDay ?? '25th of the month');
    } else if (!isOpen && prevIsOpen) {
        setPrevIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl gap-8 p-8 sm:rounded-3xl">
                <DialogHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <DialogTitle className="text-lg font-bold text-foreground rtl:text-end w-full">
                        {t('title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-10">
                    {/* Payroll Cycle Radio Group */}
                    <RadioGroup
                        value={cycle}
                        onValueChange={setCycle}
                        className="grid grid-cols-1 gap-4 md:grid-cols-3"
                    >
                        {['monthly', 'bi-weekly', 'weekly'].map((key) => (
                            <Label
                                key={key}
                                className={cn(
                                    'relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-5 transition-all hover:bg-muted/50',
                                    'rtl:text-end',
                                    cycle === key
                                        ? 'border-primary ring-1 ring-primary shadow-sm'
                                        : 'border-border',
                                )}
                            >
                                <div className="flex items-center gap-3 rtl:flex-row-reverse">
                                    <RadioGroupItem value={key} className="size-4" />
                                    <span className="text-sm font-bold text-foreground">
                                        {t(`cycles.${key}.name`)}
                                    </span>
                                </div>
                                <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                                    {t(`cycles.${key}.desc`)}
                                </p>
                            </Label>
                        ))}
                    </RadioGroup>

                    {/* Processing Day & Warning */}
                    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                        <div className="space-y-2.5">
                            <Label className="text-sm font-bold text-foreground rtl:text-end block">
                                {t('processingDay')}
                            </Label>
                            <Select value={processingDay} onValueChange={setProcessingDay}>
                                <SelectTrigger className="h-11 rounded-xl bg-background text-sm font-medium">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rtl:text-end">
                                    <SelectItem
                                        value="25th of the month"
                                        className="rtl:flex-row-reverse"
                                    >
                                        25th of the month
                                    </SelectItem>
                                    <SelectItem
                                        value="1st of the month"
                                        className="rtl:flex-row-reverse"
                                    >
                                        1st of the month
                                    </SelectItem>
                                    <SelectItem
                                        value="Last day of the month"
                                        className="rtl:flex-row-reverse"
                                    >
                                        Last day of the month
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 rtl:flex-row-reverse">
                            <Info className="size-5 shrink-0 text-amber-500" />
                            <p className="text-[11px] font-medium leading-relaxed text-amber-800/90 rtl:text-end">
                                {t('warning')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 rtl:flex-row-reverse">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-11 px-8 text-sm font-bold rounded-xl border border-border/60 hover:bg-muted"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            onSave({ cycle, processingDay });
                            onOpenChange(false);
                        }}
                        className="h-11 px-10 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90"
                    >
                        {t('save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
