'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { SectionLayout } from '../SectionLayout';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';
import { useCompOffPolicy, useUpsertCompOffPolicy } from '@/features/comp-off/hooks/useCompOff';
import { UpsertCompOffPolicyInput } from '@/features/comp-off/comp-off.types';

export function CompOffPolicySection() {
    const { t } = useTranslation('settings');
    const { toast } = useToast();

    const { data: policy, isLoading } = useCompOffPolicy();
    const { mutateAsync: upsertPolicy, isPending: isSaving } = useUpsertCompOffPolicy();

    const { control, handleSubmit, reset } = useForm<UpsertCompOffPolicyInput>({
        defaultValues: {
            creditRatioMinutes: 480,
            creditMultiplier: 1.0,
            expiryDays: 90,
            minOvertimeMinutes: 120,
            allowHoliday: true,
            allowWeekend: true,
            allowDutyShift: true,
        },
    });

    useEffect(() => {
        if (policy) {
            reset({
                creditRatioMinutes: policy.creditRatioMinutes,
                creditMultiplier: policy.creditMultiplier,
                expiryDays: policy.expiryDays,
                minOvertimeMinutes: policy.minOvertimeMinutes,
                allowHoliday: policy.allowHoliday,
                allowWeekend: policy.allowWeekend,
                allowDutyShift: policy.allowDutyShift,
            });
        }
    }, [policy, reset]);

    const onSubmit = async (data: UpsertCompOffPolicyInput) => {
        try {
            await upsertPolicy({
                ...data,
                creditRatioMinutes: Number(data.creditRatioMinutes),
                creditMultiplier: Number(data.creditMultiplier),
                expiryDays: Number(data.expiryDays),
                minOvertimeMinutes: Number(data.minOvertimeMinutes),
            });
            toast({
                title: t('success.title', 'Success'),
                description: t('success.compOffSaved', 'Comp-off policy saved successfully.'),
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('errors.title', 'Error'),
                description: getUserFacingErrorMessage(error, t('errors.saveFailed', 'Failed to save policy.')),
            });
        }
    };

    if (isLoading) {
        return (
            <SectionLayout title="Comp-Off Policy" description="Manage company-wide rules for earning compensatory off (Comp-off).">
                <div className="flex justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            </SectionLayout>
        );
    }

    return (
        <SectionLayout title="Comp-Off Policy" description="Manage company-wide rules for earning compensatory off (Comp-off).">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <Label>Credit Ratio (Minutes)</Label>
                        <Controller
                            name="creditRatioMinutes"
                            control={control}
                            render={({ field }) => (
                                <Input type="number" {...field} placeholder="e.g. 480 for 8 hours" />
                            )}
                        />
                        <p className="text-xs text-muted-foreground">The number of overtime minutes equivalent to 1 Comp-off day.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Credit Multiplier</Label>
                        <Controller
                            name="creditMultiplier"
                            control={control}
                            render={({ field }) => (
                                <Input type="number" step="0.1" {...field} placeholder="e.g. 1.0 or 1.5" />
                            )}
                        />
                        <p className="text-xs text-muted-foreground">Multiplier applied to earned comp-off days.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Expiry Days</Label>
                        <Controller
                            name="expiryDays"
                            control={control}
                            render={({ field }) => (
                                <Input type="number" {...field} placeholder="e.g. 90" />
                            )}
                        />
                        <p className="text-xs text-muted-foreground">Number of days before earned comp-off expires.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Min Overtime Minutes</Label>
                        <Controller
                            name="minOvertimeMinutes"
                            control={control}
                            render={({ field }) => (
                                <Input type="number" {...field} placeholder="e.g. 120 for 2 hours" />
                            )}
                        />
                        <p className="text-xs text-muted-foreground">Minimum overtime minutes required to qualify for comp-off.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                    <Label className="text-base">Eligibility Settings</Label>
                    
                    <div className="flex flex-col gap-3">
                        <Controller
                            name="allowHoliday"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="allowHoliday"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label htmlFor="allowHoliday" className="font-normal cursor-pointer">Allow earning comp-off on Holidays</Label>
                                </div>
                            )}
                        />

                        <Controller
                            name="allowWeekend"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="allowWeekend"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label htmlFor="allowWeekend" className="font-normal cursor-pointer">Allow earning comp-off on Weekends</Label>
                                </div>
                            )}
                        />

                        <Controller
                            name="allowDutyShift"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="allowDutyShift"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label htmlFor="allowDutyShift" className="font-normal cursor-pointer">Allow earning comp-off for Duty Shifts</Label>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className="border-t border-border mt-2" />

                <div className="pt-2">
                    <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Policy
                    </Button>
                </div>
            </form>
        </SectionLayout>
    );
}
