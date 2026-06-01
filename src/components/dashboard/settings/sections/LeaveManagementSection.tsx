'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { SectionLayout } from '../SectionLayout';
import { useTranslation } from 'react-i18next';

const schema = z.object({
    yearStartMonth: z.string().default('january'),
    yearStartDay: z.string().default('1'),
    carryUnused: z.boolean().default(true),
    resetAnnually: z.boolean().default(true),
    leaveUnits: z.string().default('full_day'),
    accrualMethod: z.string().default('accrual'),
    maxCarryOverDays: z.coerce.number().default(15),
    carryOverExpirationYears: z.coerce.number().default(2),
    allowNegative: z.boolean().default(false),
    maxNegativeDays: z.coerce.number().default(10),
    approvalWorkflow: z.string().default('approval_structure'),
    autoEscalateDays: z.coerce.number().default(10),
    escalationRecipient: z.string().default('hr_manager'),
});

type LeavePrefsValues = z.infer<typeof schema>;

export function LeaveManagementSection() {
    const { t } = useTranslation('settings');

    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<LeavePrefsValues>({
        resolver: zodResolver(schema) as never,
        defaultValues: {
            yearStartMonth: 'january',
            yearStartDay: '1',
            carryUnused: true,
            resetAnnually: true,
            leaveUnits: 'full_day',
            accrualMethod: 'accrual',
            maxCarryOverDays: 15,
            carryOverExpirationYears: 2,
            allowNegative: false,
            maxNegativeDays: 10,
            approvalWorkflow: 'approval_structure',
            autoEscalateDays: 10,
            escalationRecipient: 'hr_manager',
        },
    });

    const carryUnused = watch('carryUnused');
    const resetAnnually = watch('resetAnnually');
    const allowNegative = watch('allowNegative');

    // TODO: wire to backend – submit handler receives all leave prefs
    const onSubmit = (data: LeavePrefsValues) => {
        console.log(data);
        /* call API */
    };

    return (
        <SectionLayout 
            title={t('leave.title', 'Leave Management')} 
            description={t('leave.description', 'Time-off policies and approval behavior.')}
        >
            <div className="flex flex-col gap-6">
                {/* Leave Policies */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-foreground">{t('leave.leavePolicies', 'Leave Policies')}</h3>

                    <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-foreground">{t('leave.yearStartDate', 'Leave year start date')}</span>
                        <div className="flex gap-2 max-w-xs">
                            <FormSelect
                                id="yearStartMonth"
                                control={control}
                                name="yearStartMonth"
                                options={['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => ({
                                    label: m,
                                    value: m.toLowerCase()
                                }))}
                                t={t}
                                containerClassName="flex-1"
                            />
                            <FormSelect
                                id="yearStartDay"
                                control={control}
                                name="yearStartDay"
                                options={Array.from({ length: 28 }, (_, i) => ({
                                    label: String(i + 1),
                                    value: String(i + 1)
                                }))}
                                t={t}
                                containerClassName="w-24"
                            />
                        </div>
                    </div>

                    <div className="flex items-start justify-between gap-8">
                        <div>
                            <p className="text-sm font-medium text-foreground">{t('leave.carryUnused', 'Carry unused leave')}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t('leave.carryUnusedDesc', 'Move unused leave to the next year.')}</p>
                        </div>
                        <Switch 
                            checked={carryUnused} 
                            onCheckedChange={(v) => setValue('carryUnused', v)} 
                            className="shrink-0" 
                        />
                    </div>

                    <div className="flex items-start justify-between gap-8">
                        <div>
                            <p className="text-sm font-medium text-foreground">{t('leave.resetBalances', 'Reset leave balances annually toggle')}</p>
                        </div>
                        <Switch 
                            checked={resetAnnually} 
                            onCheckedChange={(v) => setValue('resetAnnually', v)} 
                            className="shrink-0" 
                        />
                    </div>

                    <div className="max-w-xs">
                        <FormSelect
                            id="leaveUnits"
                            label={t('leave.units', 'Leave Units')}
                            control={control}
                            name="leaveUnits"
                            error={errors.leaveUnits}
                            options={[
                                { label: t('leave.unitFullDay', 'Full day'), value: 'full_day' },
                                { label: t('leave.unitHalfDay', 'Half day'), value: 'half_day' },
                                { label: t('leave.unitHours', 'Hours'), value: 'hours' },
                            ]}
                            t={t}
                        />
                    </div>
                </div>

                <div className="border-t border-border" />

                {/* Accrual & Balance */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-foreground">{t('leave.accrualBalance', 'Accrual & Balance')}</h3>

                    <div className="max-w-xs">
                        <FormSelect
                            id="accrualMethod"
                            label={t('leave.accrualMethod', 'Accrual Method')}
                            control={control}
                            name="accrualMethod"
                            error={errors.accrualMethod}
                            options={[
                                { label: t('leave.methodAccrual', 'Accrual Method'), value: 'accrual' },
                                { label: t('leave.methodLumpSum', 'Lump Sum'), value: 'lump_sum' },
                                { label: t('leave.methodProrated', 'Prorated'), value: 'prorated' },
                            ]}
                            t={t}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-xs">
                        <FormField
                            id="maxCarryOverDays"
                            label={t('leave.maxCarryOver', 'Maximum carry-over days')}
                            register={register}
                            name="maxCarryOverDays"
                            type="number"
                            error={errors.maxCarryOverDays}
                            t={t}
                        />
                        <FormField
                            id="carryOverExpirationYears"
                            label={t('leave.carryOverExpiration', 'Carry-over expiration period')}
                            register={register}
                            name="carryOverExpirationYears"
                            type="number"
                            error={errors.carryOverExpirationYears}
                            t={t}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-8">
                        <div>
                            <p className="text-sm font-medium text-foreground">{t('leave.allowNegative', 'Allow negative leave balance')}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t('leave.allowNegativeDesc', 'Allow employees to use leave days after they finished their leave days.')}</p>
                        </div>
                        <Switch 
                            checked={allowNegative} 
                            onCheckedChange={(v) => setValue('allowNegative', v)} 
                            className="shrink-0" 
                        />
                    </div>

                    {allowNegative && (
                        <div className="max-w-xs">
                            <FormField
                                id="maxNegativeDays"
                                label={t('leave.maxNegative', 'Maximum negative days')}
                                register={register}
                                name="maxNegativeDays"
                                type="number"
                                error={errors.maxNegativeDays}
                                t={t}
                            />
                        </div>
                    )}
                </div>

                <div className="border-t border-border" />

                {/* Approval Workflow */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-foreground">{t('leave.approvalWorkflow', 'Approval Workflow')}</h3>

                    <div className="max-w-xs">
                        <FormSelect
                            id="approvalWorkflow"
                            label={t('leave.approvalWorkflow', 'Approval Workflow')}
                            control={control}
                            name="approvalWorkflow"
                            error={errors.approvalWorkflow}
                            options={[
                                { label: t('leave.workflowApprovalStructure', 'Approval Structure'), value: 'approval_structure' },
                                { label: t('leave.workflowDirectManager', 'Direct Manager'), value: 'direct_manager' },
                                { label: t('leave.workflowHrManager', 'HR Manager'), value: 'hr_manager' },
                            ]}
                            t={t}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                        <FormField
                            id="autoEscalateDays"
                            label={t('leave.autoEscalate', 'Auto-escalate after')}
                            register={register}
                            name="autoEscalateDays"
                            type="number"
                            error={errors.autoEscalateDays}
                            t={t}
                        />
                        <FormSelect
                            id="escalationRecipient"
                            label={t('leave.escalationRecipient', 'Escalation recipient')}
                            control={control}
                            name="escalationRecipient"
                            error={errors.escalationRecipient}
                            options={[
                                { label: t('leave.recipientHrManager', 'HR manager'), value: 'hr_manager' },
                                { label: t('leave.recipientCeo', 'CEO'), value: 'ceo' },
                            ]}
                            t={t}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button 
                        onClick={handleSubmit(onSubmit)} 
                        className="bg-primary hover:bg-primary/90 text-white h-9 px-5 rounded-lg"
                    >
                        {t('saveChange', 'Save change')}
                    </Button>
                </div>
            </div>
        </SectionLayout>
    );
}
