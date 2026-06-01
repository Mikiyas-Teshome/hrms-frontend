'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSelect } from '@/components/ui/FormSelect';
import { cn } from '@/lib/utils';
import { SectionLayout } from '../SectionLayout';
import { AttendanceSectionSkeleton } from '../SettingsSectionSkeleton';
import { useTranslation } from 'react-i18next';
import { AddHolidaySheet } from '@/components/onboarding/hr-policies/add-holiday-sheet';
import { type HolidayValues } from '@/components/onboarding/schemas/holiday';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import {
    useCreateHoliday,
    useCreateShiftTemplate,
    useHolidays,
    useRemoveHoliday,
    useShiftTemplates,
    useUpdateShiftTemplate,
} from '@/features/attendance/hooks/useAttendance';
import {
    buildShiftTemplatePayload,
    detectWorkingHoursPreset,
    resolvePrimaryShiftTemplate,
    type WorkingHoursPreset,
} from '@/features/settings/attendance-settings.utils';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';

const WORKING_HOURS_OPTIONS: Array<{ value: WorkingHoursPreset; labelKey: string; descKey: string }> = [
    { value: 'standard', labelKey: 'attendance.workingHoursStandard', descKey: 'attendance.workingHoursStandardDesc' },
    { value: 'hijri', labelKey: 'attendance.workingHoursHijri', descKey: 'attendance.workingHoursHijriDesc' },
    { value: 'custom', labelKey: 'attendance.workingHoursCustom', descKey: 'attendance.workingHoursCustomDesc' },
];

type AttendanceCompanyFormValues = {
    companyOuId: string;
};

export function AttendanceTimeSection() {
    const { t, i18n } = useTranslation('settings');
    const { toast } = useToast();
    const currentYear = new Date().getFullYear();

    const { companies, isLoading: isLoadingCompanies } = useCompanyOptions();
    const {
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AttendanceCompanyFormValues>({
        defaultValues: { companyOuId: '' },
    });
    const companyOuId = watch('companyOuId');

    const companyOptions = useMemo(
        () =>
            companies.map((company) => ({
                label: company.name || company.displayLabel || company.companyProfile?.legalName || company.id,
                value: company.id,
            })),
        [companies],
    );
    const [workingHours, setWorkingHours] = useState<WorkingHoursPreset>('standard');
    const [isHolidaySheetOpen, setIsHolidaySheetOpen] = useState(false);
    const [removingHolidayId, setRemovingHolidayId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { data: holidays, isLoading: isLoadingHolidays } = useHolidays(companyOuId, currentYear);
    const { data: shiftTemplates, isLoading: isLoadingShifts } = useShiftTemplates(companyOuId);

    const { mutateAsync: createHoliday } = useCreateHoliday();
    const { mutateAsync: removeHoliday } = useRemoveHoliday();
    const { mutateAsync: createShiftTemplate } = useCreateShiftTemplate();
    const { mutateAsync: updateShiftTemplate } = useUpdateShiftTemplate();

    const primaryShift = useMemo(
        () => resolvePrimaryShiftTemplate(shiftTemplates),
        [shiftTemplates],
    );

    useEffect(() => {
        if (companyOptions.length > 0 && !companyOuId) {
            setValue('companyOuId', companyOptions[0].value, { shouldValidate: true });
        }
    }, [companyOptions, companyOuId, setValue]);

    useEffect(() => {
        if (!primaryShift) {
            setWorkingHours('standard');
            return;
        }

        setWorkingHours(detectWorkingHoursPreset(primaryShift.workingDays));
    }, [primaryShift]);

    const isSectionLoading =
        isLoadingCompanies || (!!companyOuId && (isLoadingHolidays || isLoadingShifts));

    const formatHolidayDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    const handleRemoveHoliday = async (holidayId: string) => {
        setRemovingHolidayId(holidayId);
        try {
            await removeHoliday(holidayId);
            toast({
                title: t('success.title'),
                description: t('success.holidayRemoved'),
            });
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: getUserFacingErrorMessage(error, t('errors.saveFailed')),
            });
        } finally {
            setRemovingHolidayId(null);
        }
    };

    const handleHolidaySubmit = async (data: HolidayValues) => {
        if (!companyOuId) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: t('attendance.selectCompanyFirst'),
            });
            return;
        }

        try {
            const holidayDate = new Date(data.date);
            await createHoliday({
                companyOuId,
                name: data.name,
                date: holidayDate.toISOString(),
                isReligious: data.isReligious,
                type: data.type,
                year: holidayDate.getFullYear(),
            });

            toast({
                title: t('success.title'),
                description: t('success.holidayAdded'),
            });
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: getUserFacingErrorMessage(error, t('errors.saveFailed')),
            });
        }
    };

    const handleSave = async () => {
        if (!companyOuId) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: t('attendance.selectCompanyFirst'),
            });
            return;
        }

        setIsSaving(true);
        try {
            const payload = buildShiftTemplatePayload(workingHours, companyOuId, primaryShift);

            if (primaryShift) {
                await updateShiftTemplate({
                    id: primaryShift.id,
                    ...payload,
                });
            } else {
                await createShiftTemplate(payload);
            }

            toast({
                title: t('success.title'),
                description: t('success.attendanceSaved'),
            });
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: getUserFacingErrorMessage(error, t('errors.saveFailed')),
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingCompanies && companies.length === 0) {
        return (
            <SectionLayout title={t('attendance.title')} description={t('attendance.description')}>
                <AttendanceSectionSkeleton />
            </SectionLayout>
        );
    }

    return (
        <SectionLayout title={t('attendance.title')} description={t('attendance.description')}>
            <div className="flex flex-col gap-6">
                <div className="max-w-sm">
                    <FormSelect
                        id="companyOuId"
                        label={t('attendance.selectCompany')}
                        placeholder={
                            isLoadingCompanies
                                ? t('attendance.loadingCompanies')
                                : t('attendance.selectCompany')
                        }
                        control={control}
                        name="companyOuId"
                        error={errors.companyOuId}
                        options={companyOptions}
                        t={t}
                        containerClassName="flex flex-col gap-1.5"
                    />
                </div>

                {isSectionLoading ? (
                    <AttendanceSectionSkeleton showCompanyField={false} />
                ) : (
                    <>
                        <div className="border-t border-border" />

                        <div className="flex flex-col gap-3">
                            <Label className="text-sm font-semibold text-foreground">{t('attendance.workingHours')}</Label>
                            <div className="flex gap-3 flex-wrap">
                                {WORKING_HOURS_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setWorkingHours(opt.value)}
                                        className={cn(
                                            'flex flex-col gap-1 text-left p-3 rounded-xl border transition-all w-44',
                                            workingHours === opt.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/40 bg-background',
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center',
                                                    workingHours === opt.value ? 'border-primary' : 'border-muted-foreground',
                                                )}
                                            >
                                                {workingHours === opt.value && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{t(opt.labelKey)}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed pl-5">{t(opt.descKey)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-foreground">{t('attendance.holidayCalendar')}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary text-sm h-8 px-2 hover:bg-primary/5"
                                    onClick={() => setIsHolidaySheetOpen(true)}
                                    disabled={!companyOuId}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    {t('attendance.addCustomHoliday')}
                                </Button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {holidays?.length ? (
                                    holidays.map((holiday) => (
                                        <div
                                            key={holiday.id}
                                            className="flex items-center justify-between border border-border rounded-lg px-4 py-2.5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={holiday.id}
                                                    checked
                                                    disabled={removingHolidayId === holiday.id}
                                                    onCheckedChange={(checked) => {
                                                        if (!checked) {
                                                            void handleRemoveHoliday(holiday.id);
                                                        }
                                                    }}
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <Label htmlFor={holiday.id} className="text-sm font-medium cursor-pointer">
                                                    {holiday.name}
                                                </Label>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {formatHolidayDate(holiday.date)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">{t('attendance.noHolidays')}</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
                            <Label className="text-sm font-semibold text-foreground">{t('attendance.timeTracking')}</Label>
                            <p className="text-xs text-muted-foreground">{t('attendance.timeTrackingUnavailable')}</p>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="button"
                                onClick={() => void handleSave()}
                                disabled={isSaving || !companyOuId}
                                className="bg-primary hover:bg-primary/90 text-white h-9 px-5 rounded-lg"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('saveChange')}
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <AddHolidaySheet
                open={isHolidaySheetOpen}
                onOpenChange={setIsHolidaySheetOpen}
                defaultCalendarType={
                    workingHours === 'hijri' ? 'hijri' : workingHours === 'custom' ? 'custom' : 'gregorian'
                }
                onSubmit={(data) => {
                    void handleHolidaySubmit(data);
                }}
            />
        </SectionLayout>
    );
}
