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

const RATE_TYPES = [
    { value: 'x_rate', label: 'x Rate' },
    { value: 'flat_rate', label: 'Flat rate ($)' },
];

const schema = z.object({
    companyId: z.string().default('abc'),
    yearStartMonth: z.string().default('january'),
    yearStartDay: z.string().default('1'),
    carryUnused: z.boolean().default(true),
    resetAnnually: z.boolean().default(true),
    leaveUnits: z.string().default('full_day'),
    standardOvertime: z.coerce.number().default(1.5),
    standardOvertimeRate: z.string().default('x_rate'),
    weekendOvertime: z.coerce.number().default(2.0),
    weekendOvertimeRate: z.string().default('flat_rate'),
    publicHolidayOvertime: z.coerce.number().default(5.0),
    publicHolidayOvertimeRate: z.string().default('flat_rate'),
    approvalWorkflow: z.string().default('approval_structure'),
    autoEscalateDays: z.coerce.number().default(10),
    escalationRecipient: z.string().default('hr_manager'),
    maxCarryOverDays: z.coerce.number().default(15),
    carryOverExpirationYears: z.coerce.number().default(2),
    allowNegative: z.boolean().default(false),
    maxNegativeDays: z.coerce.number().default(10),
});

type PayrollValues = z.infer<typeof schema>;

export function PayrollSection() {
    const { t } = useTranslation('settings');

    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<PayrollValues>({
        resolver: zodResolver(schema) as never,
        defaultValues: {
            companyId: 'abc',
            yearStartMonth: 'january',
            yearStartDay: '1',
            carryUnused: true,
            resetAnnually: true,
            leaveUnits: 'full_day',
            standardOvertime: 1.5,
            standardOvertimeRate: 'x_rate',
            weekendOvertime: 2.0,
            weekendOvertimeRate: 'flat_rate',
            publicHolidayOvertime: 5.0,
            publicHolidayOvertimeRate: 'flat_rate',
            approvalWorkflow: 'approval_structure',
            autoEscalateDays: 10,
            escalationRecipient: 'hr_manager',
            maxCarryOverDays: 15,
            carryOverExpirationYears: 2,
            allowNegative: false,
            maxNegativeDays: 10,
        },
    });

    const carryUnused = watch('carryUnused');
    const resetAnnually = watch('resetAnnually');

    // TODO: wire to backend – submit handler receives all fields
    const onSubmit = (data: PayrollValues) => {
        console.log(data);
        /* call API */
    };

    return (
        <SectionLayout 
            title={t('payroll.title', 'Payroll')} 
            description={t('payroll.description', 'Compensation and payment configuration.')}
        >
            <div className="flex flex-col gap-6">
                {/* Select company */}
                <div className="max-w-sm">
                    <FormSelect
                        id="companyId"
                        label={t('attendance.selectCompany', 'Select company')}
                        control={control}
                        name="companyId"
                        error={errors.companyId}
                        options={[
                            { label: 'ABC Engineering', value: 'abc' },
                        ]}
                        t={t}
                    />
                </div>

                <div className="border-t border-border" />

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

                {/* Overtime Rules */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-foreground">{t('payroll.overtimeRules', 'Overtime Rules')}</h3>

                    <div className="flex flex-col gap-4">
                        {/* Standard Overtime */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-foreground">{t('payroll.standardOvertime', 'Standard Overtime')}</span>
                            <div className="flex gap-2 max-w-xs items-start">
                                <div className="flex-1">
                                    <FormField
                                        id="standardOvertime"
                                        label=""
                                        register={register}
                                        name="standardOvertime"
                                        type="number"
                                        error={errors.standardOvertime}
                                        t={t}
                                    />
                                </div>
                                <FormSelect
                                    id="standardOvertimeRate"
                                    control={control}
                                    name="standardOvertimeRate"
                                    options={RATE_TYPES}
                                    t={t}
                                    containerClassName="w-32"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">{t('payroll.standardOvertimeDesc', 'Weekdays & Regular hours')}</span>
                        </div>

                        {/* Weekend Overtime */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-foreground">{t('payroll.weekendOvertime', 'Weekend Overtime')}</span>
                            <div className="flex gap-2 max-w-xs items-start">
                                <div className="flex-1">
                                    <FormField
                                        id="weekendOvertime"
                                        label=""
                                        register={register}
                                        name="weekendOvertime"
                                        type="number"
                                        error={errors.weekendOvertime}
                                        t={t}
                                    />
                                </div>
                                <FormSelect
                                    id="weekendOvertimeRate"
                                    control={control}
                                    name="weekendOvertimeRate"
                                    options={RATE_TYPES}
                                    t={t}
                                    containerClassName="w-32"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">{t('payroll.weekendOvertimeDesc', 'Saturdays and Sundays')}</span>
                        </div>

                        {/* Public Holiday */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-medium text-foreground">{t('payroll.publicHoliday', 'Public Holiday')}</span>
                            <div className="flex gap-2 max-w-xs items-start">
                                <div className="flex-1">
                                    <FormField
                                        id="publicHolidayOvertime"
                                        label=""
                                        register={register}
                                        name="publicHolidayOvertime"
                                        type="number"
                                        error={errors.publicHolidayOvertime}
                                        t={t}
                                    />
                                </div>
                                <FormSelect
                                    id="publicHolidayOvertimeRate"
                                    control={control}
                                    name="publicHolidayOvertimeRate"
                                    options={RATE_TYPES}
                                    t={t}
                                    containerClassName="w-32"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">{t('payroll.publicHolidayDesc', 'Gazetted holidays')}</span>
                        </div>
                    </div>
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
