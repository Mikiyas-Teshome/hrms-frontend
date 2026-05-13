
export const formatMinutesToHr = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}.${m.toString().padStart(2, '0')} hr`;
};


export const formatDateString = (dateStr: string): string => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString();
    } catch (e) {
        return dateStr;
    }
};


export const formatClockTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '-';
    }
};
