
export const formatMinutesToHr = (minutes: number): string => {
    const total = Math.max(0, Math.round(minutes));
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};


export const formatDateString = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString();
    } catch {
        return dateStr;
    }
};


export const formatClockTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '-';
    }
};
