export const WEEK_DAYS = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
];

export const CALENDAR_TYPES = ['gregorian', 'hijri', 'custom'] as const;

export const extractShiftTimeHHmm = (time: string): string => {
    try {
        if (time.includes('T')) {
            const d = new Date(time);
            return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
        }
        const [hours = '00', minutes = '00'] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch {
        return time;
    }
};

export const formatShiftTime = (time: string, timeFormat: '12' | '24' = '12'): string => {
    const hhmm = extractShiftTimeHHmm(time);
    const [hoursStr, minutesStr] = hhmm.split(':');
    const hours = Number.parseInt(hoursStr, 10);
    const minutes = Number.parseInt(minutesStr, 10);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return time;
    }

    if (timeFormat === '24') {
        return hhmm;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${minutesStr.padStart(2, '0')} ${period}`;
};

export const formatTime = (time: string, locale?: string) => {
    if (locale?.startsWith('ar')) {
        const hhmm = extractShiftTimeHHmm(time);
        const [hoursStr, minutesStr] = hhmm.split(':');
        const hours = Number.parseInt(hoursStr, 10);
        const minutes = Number.parseInt(minutesStr, 10);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return time;
        }
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    }
    return formatShiftTime(time, '12');
};

export const formatShiftTime24 = (time: string) => formatShiftTime(time, '24');

export const shiftTimeToInputValue = (time: string) => extractShiftTimeHHmm(time);

export const parseShiftTimeForApi = (timeStr: string): string => {
    try {
        const normalized = timeStr.includes('T') ? extractShiftTimeHHmm(timeStr) : timeStr;
        const formattedTimeStr = normalized.length === 5 ? `${normalized}:00` : normalized;
        return `1970-01-01T${formattedTimeStr}.000Z`;
    } catch {
        return '1970-01-01T00:00:00.000Z';
    }
};

export const getWorkingDaysString = (
    days?: number[],
    getDayLabel?: (dayIndex: number) => string,
) => {
    if (!days || !Array.isArray(days)) return '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((d) => getDayLabel?.(d) ?? dayNames[d]).join(', ');
};
