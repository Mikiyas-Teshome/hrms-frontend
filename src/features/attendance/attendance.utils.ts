import { format } from 'date-fns';

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


export const formatTime = (time: string) => {
    try {
        return format(new Date(time), 'hh:mm a');
    } catch {
        return time;
    }
};


export const getWorkingDaysString = (days?: number[]) => {
    if (!days || !Array.isArray(days)) return '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => dayNames[d]).join(', ');
};
