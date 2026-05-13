'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export type OvertimeRules = {
    standard: string;
    weekend: string;
    holiday: string;
    nightShiftEnabled: boolean;
};

interface PayrollOvertimeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialRules: OvertimeRules;
    onSave: (rules: OvertimeRules) => void;
}

export function PayrollOvertimeModal({
    isOpen,
    onOpenChange,
    initialRules,
    onSave,
}: PayrollOvertimeModalProps) {
    const { t } = useTranslation('payrollOvertimeModal');
    const [rules, setRules] = useState<OvertimeRules>(initialRules);

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    if (isOpen && !prevIsOpen) {
        setPrevIsOpen(true);
        setRules(initialRules);
    } else if (!isOpen && prevIsOpen) {
        setPrevIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl gap-0 overflow-hidden border border-border p-0 sm:rounded-2xl">
                <DialogHeader className="border-b border-border bg-muted/30 px-6 py-4">
                    <DialogTitle className="text-[16px] font-semibold text-foreground rtl:text-end">
                        {t('title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 px-6 py-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            {
                                key: 'standard',
                                label: t('fields.standard'),
                                helper: t('fields.standardHint'),
                            },
                            {
                                key: 'weekend',
                                label: t('fields.weekend'),
                                helper: t('fields.weekendHint'),
                            },
                            {
                                key: 'holiday',
                                label: t('fields.holiday'),
                                helper: t('fields.holidayHint'),
                            },
                        ].map((field) => (
                            <div key={field.key} className="space-y-2">
                                <Label className="block text-sm font-semibold text-foreground rtl:text-end">
                                    {field.label}
                                </Label>
                                <div className="relative">
                                    <Input
                                        value={rules[field.key as keyof OvertimeRules] as string}
                                        onChange={(e) =>
                                            setRules((prev) => ({
                                                ...prev,
                                                [field.key]: e.target.value,
                                            }))
                                        }
                                        className="h-10 rounded-lg border-border pe-20 text-sm"
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3 text-[12px] text-muted-foreground">
                                        {t('fields.rateSuffix')}
                                    </span>
                                </div>
                                <p className="text-[12px] text-muted-foreground rtl:text-end">
                                    {field.helper}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 rtl:flex-row-reverse">
                        <div className="space-y-1 rtl:text-end">
                            <p className="text-sm font-semibold text-foreground">
                                {t('fields.nightShift')}
                            </p>
                            <p className="text-[12px] text-muted-foreground">
                                {t('fields.nightShiftHint')}
                            </p>
                        </div>
                        <Switch
                            checked={rules.nightShiftEnabled}
                            onCheckedChange={(checked) =>
                                setRules((prev) => ({
                                    ...prev,
                                    nightShiftEnabled: checked,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4 rtl:flex-row-reverse">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-10 rounded-lg px-8 text-[14px] font-medium border-border text-primary hover:bg-muted"
                    >
                        {t('actions.cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            onSave(rules);
                            onOpenChange(false);
                        }}
                        className="h-10 rounded-lg px-8 text-[14px] font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {t('actions.save')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
