import {
    CalendarClock,
    CircleCheck,
    ClipboardCheck,
    Hourglass,
    Loader,
    Moon,
    Sunrise,
    Sunset,
    Timer,
    Users,
    type LucideIcon,
} from 'lucide-react';

export interface AttendanceStatCardConfig {
    id: string;
    label: string;
    icon: LucideIcon;
    iconColor: string;
    bgColor: string;
}

export const ATTENDANCE_OVERVIEW_STAT_CARDS: AttendanceStatCardConfig[] = [
    {
        id: 'employees',
        label: 'Number of employees',
        icon: Users,
        iconColor: '#136DEC',
        bgColor: 'rgba(19, 109, 236, 0.05)',
    },
    {
        id: 'active',
        label: 'Active employees',
        icon: CircleCheck,
        iconColor: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.05)',
    },
    {
        id: 'leave',
        label: 'On leave',
        icon: CalendarClock,
        iconColor: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.05)',
    },
    {
        id: 'overtime',
        label: 'Total overtime this month',
        icon: Timer,
        iconColor: '#EA580C',
        bgColor: 'rgba(234, 88, 12, 0.05)',
    },
];

export const SHIFT_STAT_CARDS: AttendanceStatCardConfig[] = [
    {
        id: 'shifts',
        label: 'Number of shifts',
        icon: Hourglass,
        iconColor: '#136DEC',
        bgColor: 'rgba(19, 109, 236, 0.05)',
    },
    {
        id: 'morning',
        label: 'Morning shift employees',
        icon: Sunrise,
        iconColor: '#FB923C',
        bgColor: 'rgba(251, 146, 60, 0.05)',
    },
    {
        id: 'evening',
        label: 'Evening shift employees',
        icon: Sunset,
        iconColor: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.05)',
    },
    {
        id: 'night',
        label: 'Night shift employees',
        icon: Moon,
        iconColor: '#7C3AED',
        bgColor: 'rgba(124, 58, 237, 0.05)',
    },
];

export const OVERTIME_STAT_CARDS: AttendanceStatCardConfig[] = [
    {
        id: 'employees',
        label: 'Overtime employees',
        icon: Timer,
        iconColor: '#136DEC',
        bgColor: 'rgba(19, 109, 236, 0.05)',
    },
    {
        id: 'approved',
        label: 'Approved overtime',
        icon: ClipboardCheck,
        iconColor: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.05)',
    },
    {
        id: 'pending',
        label: 'Pending overtime',
        icon: Loader,
        iconColor: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.05)',
    },
    {
        id: 'total',
        label: 'Total overtime this month',
        icon: Timer,
        iconColor: '#EA580C',
        bgColor: 'rgba(234, 88, 12, 0.05)',
    },
];
