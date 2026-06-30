import type { TFunction } from 'i18next';
import type { LucideIcon } from 'lucide-react';
import {
    ATTENDANCE_OVERVIEW_STAT_CARDS,
    OVERTIME_STAT_CARDS,
    SHIFT_STAT_CARDS,
    type AttendanceStatCardConfig,
} from './attendance-stat-cards.config';
import type { AttendanceOverviewStats, ShiftStats } from './attendance.types';

export interface AttendanceStatCard {
    id: string;
    label: string;
    value: string;
    icon: LucideIcon;
    iconColor: string;
    bgColor: string;
}

function toStatCard(
    config: AttendanceStatCardConfig,
    label: string,
    value: string,
): AttendanceStatCard {
    return {
        id: config.id,
        label,
        value,
        icon: config.icon,
        iconColor: config.iconColor,
        bgColor: config.bgColor,
    };
}

export function buildAttendanceOverviewStatCards(
    stats: AttendanceOverviewStats | undefined,
    t: TFunction,
): AttendanceStatCard[] {
    const hoursUnit = t('attendance.stats.hoursUnit', 'hrs');

    return ATTENDANCE_OVERVIEW_STAT_CARDS.map((config) => {
        const label = t(`attendance.stats.${config.id}`, config.label);

        if (!stats) {
            const value = config.id === 'overtime' ? `0${hoursUnit}` : '0';
            return toStatCard(config, label, value);
        }

        let value = '0';
        switch (config.id) {
            case 'employees':
                value = stats.totalEmployees.toString();
                break;
            case 'active':
                value = stats.activeEmployees.toString();
                break;
            case 'leave':
                value = stats.onLeave.toString();
                break;
            case 'overtime':
                value = `${stats.totalOvertimeHours}${hoursUnit}`;
                break;
        }

        return toStatCard(config, label, value);
    });
}

export function buildShiftStatCards(
    shiftStats: ShiftStats | undefined,
    shiftTemplateCount: number | undefined,
    t: TFunction,
): AttendanceStatCard[] {
    return SHIFT_STAT_CARDS.map((config) => {
        const label = t(`attendance.shiftsStats.${config.id}`, config.label);
        let value = '0';

        if (shiftStats) {
            switch (config.id) {
                case 'shifts':
                    value = shiftStats.totalShifts.toString();
                    break;
                case 'morning':
                    value = shiftStats.morningEmployees.toString();
                    break;
                case 'evening':
                    value = shiftStats.eveningEmployees.toString();
                    break;
                case 'night':
                    value = shiftStats.nightEmployees.toString();
                    break;
            }
        } else if (config.id === 'shifts') {
            value = shiftTemplateCount?.toString() ?? '0';
        }

        return toStatCard(config, label, value);
    });
}

export function buildOvertimeStatCards(
    stats: AttendanceOverviewStats | undefined,
    t: TFunction,
): AttendanceStatCard[] {
    const hoursUnit = t('attendance.stats.hoursUnit', 'hrs');

    return OVERTIME_STAT_CARDS.map((config) => {
        const label = t(`attendance.overtimeStats.${config.id}`, config.label);
        let value = '0';

        switch (config.id) {
            case 'employees':
                value = stats?.overtimeEmployees?.toString() ?? '0';
                break;
            case 'approved':
                value = stats?.approvedOvertime?.toString() ?? '0';
                break;
            case 'pending':
                value = stats?.pendingOvertime?.toString() ?? '0';
                break;
            case 'total':
                value = `${stats?.totalOvertimeHours ?? 0}${hoursUnit}`;
                break;
        }

        return toStatCard(config, label, value);
    });
}
