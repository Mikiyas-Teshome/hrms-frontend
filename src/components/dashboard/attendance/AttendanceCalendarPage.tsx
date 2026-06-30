'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSelect } from '@/components/ui/FormSelect';
import { cn } from '@/lib/utils';
import { AttendanceSectionSkeleton } from '@/components/dashboard/settings/SettingsSectionSkeleton';
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
import {
    isHolidayDateAlreadySaved,
    toUtcHolidayIsoDate,
    type UpcomingHijriHoliday,
} from '@/data/attendance-hijri-holidays';
import { useUpcomingHijriHolidays } from '@/features/attendance/hooks/useUpcomingHijriHolidays';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage, isConflictError } from '@/lib/parse-api-error';
import { ProtectedRoute } from '@/components/auth/protected-route';

type CalendarWorkingHoursPreset = Exclude<WorkingHoursPreset, 'custom'>;

const WORKING_HOURS_OPTIONS: Array<{ value: CalendarWorkingHoursPreset; labelKey: string; descKey: string }> = [
    { value: 'standard', labelKey: 'attendance.workingHoursStandard', descKey: 'attendance.workingHoursStandardDesc' },
    { value: 'hijri', labelKey: 'attendance.workingHoursHijri', descKey: 'attendance.workingHoursHijriDesc' },
];

type AttendanceCompanyFormValues = {
    companyOuId: string;
};

const EMPTY_HIJRI_HOLIDAYS: UpcomingHijriHoliday[] = [];

function areStringArraysEqual(left: string[], right: string[]): boolean {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function AttendanceCalendarPage() {
    const { t: tDashboard } = useTranslation('dashboard');
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
    const [workingHours, setWorkingHours] = useState<CalendarWorkingHoursPreset>('standard');
    const [isHolidaySheetOpen, setIsHolidaySheetOpen] = useState(false);
    const [selectedHijriHolidayIds, setSelectedHijriHolidayIds] = useState<string[]>([]);
    const [selectedStandardHolidayIds, setSelectedStandardHolidayIds] = useState<string[]>([]);
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

    const isHijriWorkingHours = workingHours === 'hijri';
    const today = useMemo(() => new Date(), []);

    const {
        data: upcomingHijriHolidaysData,
        isLoading: isLoadingHijriHolidays,
        isError: isHijriHolidaysError,
    } = useUpcomingHijriHolidays(isHijriWorkingHours, today, currentYear);
    const upcomingHijriHolidays = upcomingHijriHolidaysData ?? EMPTY_HIJRI_HOLIDAYS;

    useEffect(() => {
        if (companyOptions.length > 0 && !companyOuId) {
            setValue('companyOuId', companyOptions[0].value, { shouldValidate: true });
        }
    }, [companyOptions, companyOuId, setValue]);

    useEffect(() => {
        if (!primaryShift) {
            return;
        }

        const detected = detectWorkingHoursPreset(primaryShift.workingDays);
        const nextWorkingHours: CalendarWorkingHoursPreset =
            detected === 'custom' ? 'standard' : detected;

        setWorkingHours((current) => (current === nextWorkingHours ? current : nextWorkingHours));
    }, [primaryShift]);

    const pendingHijriHolidays = useMemo(() => {
        return upcomingHijriHolidays.filter(
            (holiday) => !isHolidayDateAlreadySaved(holidays ?? [], holiday.date),
        );
    }, [upcomingHijriHolidays, holidays]);

    const savedHolidayIdsKey = useMemo(
        () => (holidays ?? []).map((holiday) => holiday.id).join('|'),
        [holidays],
    );

    const pendingHijriHolidayIdsKey = useMemo(
        () => pendingHijriHolidays.map((holiday) => holiday.id).join('|'),
        [pendingHijriHolidays],
    );

    useEffect(() => {
        if (isHijriWorkingHours) {
            setSelectedStandardHolidayIds((current) => (current.length === 0 ? current : []));
            return;
        }

        const nextIds = savedHolidayIdsKey ? savedHolidayIdsKey.split('|') : [];
        setSelectedStandardHolidayIds((current) =>
            areStringArraysEqual(current, nextIds) ? current : nextIds,
        );
    }, [isHijriWorkingHours, companyOuId, savedHolidayIdsKey]);

    useEffect(() => {
        if (!isHijriWorkingHours) {
            setSelectedHijriHolidayIds((current) => (current.length === 0 ? current : []));
            return;
        }

        const nextIds = pendingHijriHolidayIdsKey ? pendingHijriHolidayIdsKey.split('|') : [];
        setSelectedHijriHolidayIds((current) =>
            areStringArraysEqual(current, nextIds) ? current : nextIds,
        );
    }, [isHijriWorkingHours, companyOuId, pendingHijriHolidayIdsKey]);

    const isSectionLoading =
        isLoadingCompanies ||
        (!!companyOuId &&
            (isLoadingHolidays || isLoadingShifts || (isHijriWorkingHours && isLoadingHijriHolidays)));

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

    const toggleHijriHolidaySelection = (holidayId: string, checked: boolean) => {
        setSelectedHijriHolidayIds((current) => {
            if (checked) {
                return current.includes(holidayId) ? current : [...current, holidayId];
            }
            return current.filter((id) => id !== holidayId);
        });
    };

    const toggleStandardHolidaySelection = (holidayId: string, checked: boolean) => {
        setSelectedStandardHolidayIds((current) => {
            if (checked) {
                return current.includes(holidayId) ? current : [...current, holidayId];
            }
            return current.filter((id) => id !== holidayId);
        });
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
                date: toUtcHolidayIsoDate(
                    `${holidayDate.getFullYear()}-${String(holidayDate.getMonth() + 1).padStart(2, '0')}-${String(holidayDate.getDate()).padStart(2, '0')}`,
                ),
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

            if (isHijriWorkingHours) {
                const holidaysToCreate = pendingHijriHolidays.filter((holiday) =>
                    selectedHijriHolidayIds.includes(holiday.id),
                );

                for (const holiday of holidaysToCreate) {
                    if (isHolidayDateAlreadySaved(holidays ?? [], holiday.date)) {
                        continue;
                    }

                    const name = t(holiday.nameKey, holiday.defaultName);
                    const holidayDate = new Date(toUtcHolidayIsoDate(holiday.date));

                    try {
                        await createHoliday({
                            companyOuId,
                            name,
                            date: toUtcHolidayIsoDate(holiday.date),
                            isReligious: holiday.isReligious,
                            type: 'hijri',
                            year: holidayDate.getUTCFullYear(),
                        });
                    } catch (error: unknown) {
                        if (isConflictError(error)) {
                            continue;
                        }
                        throw error;
                    }
                }
            } else if (holidays?.length) {
                const holidaysToRemove = holidays.filter(
                    (holiday) => !selectedStandardHolidayIds.includes(holiday.id),
                );

                for (const holiday of holidaysToRemove) {
                    await removeHoliday(holiday.id);
                }
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

    return (
        <ProtectedRoute module="shifts">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 min-w-0 animate-in fade-in duration-300">
                <div>
                    <h2 className="text-2xl font-bold text-foreground leading-8">
                        {tDashboard('attendance.calendarTitle')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {tDashboard('attendance.calendarDescription')}
                    </p>
                </div>

                <div className="border-t border-border" />

                {isLoadingCompanies && companies.length === 0 ? (
                    <AttendanceSectionSkeleton showCompanyField />
                ) : (
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
                                    <Label className="text-sm font-semibold text-foreground">
                                        {t('attendance.workingHours')}
                                    </Label>
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
                                                            workingHours === opt.value
                                                                ? 'border-primary'
                                                                : 'border-muted-foreground',
                                                        )}
                                                    >
                                                        {workingHours === opt.value && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground">
                                                        {t(opt.labelKey)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                                                    {t(opt.descKey)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-border" />

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold text-foreground">
                                            {t('attendance.holidayCalendar')}
                                        </Label>
                                        {!isHijriWorkingHours ? (
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
                                        ) : null}
                                    </div>

                                    {isHijriWorkingHours ? (
                                        <>
                                            <p className="text-sm text-muted-foreground">
                                                {t('attendance.hijriHolidayReviewHint')}
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                {isHijriHolidaysError ? (
                                                    <p className="text-sm text-destructive">
                                                        {t('attendance.hijriHolidaysLoadFailed')}
                                                    </p>
                                                ) : upcomingHijriHolidays.length ? (
                                                    upcomingHijriHolidays.map((holiday) => {
                                                        const name = t(holiday.nameKey, holiday.defaultName);
                                                        const alreadySaved = isHolidayDateAlreadySaved(
                                                            holidays ?? [],
                                                            holiday.date,
                                                        );
                                                        const checked =
                                                            alreadySaved ||
                                                            selectedHijriHolidayIds.includes(holiday.id);

                                                        return (
                                                            <div
                                                                key={holiday.id}
                                                                className="flex items-center justify-between border border-border rounded-lg px-4 py-2.5"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Checkbox
                                                                        id={holiday.id}
                                                                        checked={checked}
                                                                        disabled={alreadySaved}
                                                                        onCheckedChange={(nextChecked) => {
                                                                            if (alreadySaved) {
                                                                                return;
                                                                            }
                                                                            toggleHijriHolidaySelection(
                                                                                holiday.id,
                                                                                Boolean(nextChecked),
                                                                            );
                                                                        }}
                                                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    />
                                                                    <Label
                                                                        htmlFor={holiday.id}
                                                                        className={cn(
                                                                            'text-sm font-medium',
                                                                            alreadySaved
                                                                                ? 'cursor-default'
                                                                                : 'cursor-pointer',
                                                                        )}
                                                                    >
                                                                        {name}
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    {alreadySaved ? (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {t('attendance.hijriHolidayAlreadySaved')}
                                                                        </span>
                                                                    ) : null}
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {formatHolidayDate(holiday.date)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        {t('attendance.noUpcomingHijriHolidays')}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {holidays?.length ? (
                                                <p className="text-sm text-muted-foreground">
                                                    {t('attendance.standardHolidayReviewHint')}
                                                </p>
                                            ) : null}
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
                                                                checked={selectedStandardHolidayIds.includes(
                                                                    holiday.id,
                                                                )}
                                                                disabled={isSaving}
                                                                onCheckedChange={(nextChecked) => {
                                                                    toggleStandardHolidaySelection(
                                                                        holiday.id,
                                                                        Boolean(nextChecked),
                                                                    );
                                                                }}
                                                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            <Label
                                                                htmlFor={holiday.id}
                                                                className="text-sm font-medium cursor-pointer"
                                                            >
                                                                {holiday.name}
                                                            </Label>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatHolidayDate(holiday.date)}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    {t('attendance.noHolidays')}
                                                </p>
                                            )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex justify-end pt-2">
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
                )}

                {!isHijriWorkingHours ? (
                    <AddHolidaySheet
                        open={isHolidaySheetOpen}
                        onOpenChange={setIsHolidaySheetOpen}
                        defaultCalendarType="gregorian"
                        onSubmit={(data) => {
                            void handleHolidaySubmit(data);
                        }}
                    />
                ) : null}
            </div>
        </ProtectedRoute>
    );
}
