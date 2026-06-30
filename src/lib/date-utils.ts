
export const formatMinutesToHr = (
    minutes: number,
    units: { hours?: string; minutes?: string } = {},
): string => {
    const hourUnit = units.hours ?? 'h';
    const minuteUnit = units.minutes ?? 'm';
    const total = Math.max(0, Math.round(minutes));
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m}${minuteUnit}`;
    if (m === 0) return `${h}${hourUnit}`;
    return `${h}${hourUnit} ${m}${minuteUnit}`;
};


export const formatDateString = (dateStr: string, locale?: string): string => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString(locale);
    } catch {
        return dateStr;
    }
};


export const formatClockTime = (dateStr: string | null | undefined, locale?: string): string => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '-';
    }
};
