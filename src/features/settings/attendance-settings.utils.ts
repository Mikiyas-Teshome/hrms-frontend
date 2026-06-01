import type { CalendarType, ShiftTemplate } from '@/features/attendance/attendance.types';
import { ShiftType } from '@/features/attendance/attendance.types';

export type WorkingHoursPreset = 'standard' | 'hijri' | 'custom';

export const WORKING_HOURS_PRESETS: Record<
    Exclude<WorkingHoursPreset, 'custom'>,
    { workingDays: number[]; name: string }
> = {
    standard: { workingDays: [1, 2, 3, 4, 5], name: 'Standard Hours' },
    hijri: { workingDays: [7, 1, 2, 3, 4], name: 'Hijri Calendar' },
};

export function detectWorkingHoursPreset(workingDays?: number[]): WorkingHoursPreset {
    if (!workingDays?.length) {
        return 'standard';
    }

    const sorted = [...workingDays].sort((a, b) => a - b).join(',');

    for (const [preset, config] of Object.entries(WORKING_HOURS_PRESETS)) {
        const presetSorted = [...config.workingDays].sort((a, b) => a - b).join(',');
        if (sorted === presetSorted) {
            return preset as Exclude<WorkingHoursPreset, 'custom'>;
        }
    }

    return 'custom';
}

export function mapCalendarTypeToPreset(type: CalendarType): WorkingHoursPreset {
    if (type === 'hijri') {
        return 'hijri';
    }
    if (type === 'custom') {
        return 'custom';
    }
    return 'standard';
}

export function buildShiftTimesForDate(date: string) {
    return {
        startTime: new Date(`${date}T09:00:00`).toISOString(),
        endTime: new Date(`${date}T17:00:00`).toISOString(),
    };
}

export function resolvePrimaryShiftTemplate(templates?: ShiftTemplate[]): ShiftTemplate | null {
    if (!templates?.length) {
        return null;
    }

    return templates.find((template) => template.isActive) ?? templates[0] ?? null;
}

export function buildShiftTemplatePayload(
    preset: WorkingHoursPreset,
    companyOuId: string,
    existing?: ShiftTemplate | null,
) {
    const currentDate = new Date().toISOString().split('T')[0];
    const { startTime, endTime } = buildShiftTimesForDate(currentDate);
    const presetConfig =
        preset === 'custom' && existing
            ? { workingDays: existing.workingDays, name: existing.name }
            : WORKING_HOURS_PRESETS[preset === 'custom' ? 'standard' : preset];

    return {
        companyOuId,
        name: existing?.name ?? presetConfig.name,
        startTime: existing?.startTime ?? startTime,
        endTime: existing?.endTime ?? endTime,
        workingDays: presetConfig.workingDays,
        breakDuration: existing?.breakDuration ?? 60,
        flexibleMinutes: existing?.flexibleMinutes ?? 15,
        overtimeAllowed: existing?.overtimeAllowed ?? true,
        type: existing?.type ?? ShiftType.DAY,
    };
}
