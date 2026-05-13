import { 
  Users, 
  Hourglass, 
  Moon,
  ClipboardCheck,
  Sunrise,
  Sunset,
  Timer,
  Loader,
  CircleCheck,
  CalendarClock
} from 'lucide-react';

export const attendanceOverviewStats = [
  {
    id: 'employees',
    label: 'Number of employees',
    value: '24',
    icon: Users,
    iconColor: '#136DEC',
    bgColor: 'rgba(19, 109, 236, 0.05)',
  },
  {
    id: 'active',
    label: 'Active employees',
    value: '22',
    icon: CircleCheck,
    iconColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.05)',
  },
  {
    id: 'leave',
    label: 'On leave',
    value: '1',
    icon: CalendarClock,
    iconColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.05)',
  },
  {
    id: 'overtime',
    label: 'Total overtime this month',
    value: '12hrs',
    icon: Timer,
    iconColor: '#EA580C',
    bgColor: 'rgba(234, 88, 12, 0.05)',
  },
];

export const shiftsStats = [
  {
    id: 'shifts',
    label: 'Number of shifts',
    value: '3',
    icon: Hourglass,
    iconColor: '#136DEC',
    bgColor: 'rgba(19, 109, 236, 0.05)',
  },
  {
    id: 'morning',
    label: 'Morning shift employees',
    value: '12',
    icon: Sunrise,
    iconColor: '#FB923C',
    bgColor: 'rgba(251, 146, 60, 0.05)',
  },
  {
    id: 'evening',
    label: 'Evening shift employees',
    value: '4',
    icon: Sunset,
    iconColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.05)',
  },
  {
    id: 'night',
    label: 'Night shift employees',
    value: '7',
    icon: Moon,
    iconColor: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.05)',
  },
];

export const overtimeStats = [
  {
    id: 'employees',
    label: 'Overtime employees',
    value: '19',
    icon: Timer,
    iconColor: '#136DEC',
    bgColor: 'rgba(19, 109, 236, 0.05)',
  },
  {
    id: 'approved',
    label: 'Approved overtime',
    value: '12',
    icon: ClipboardCheck,
    iconColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.05)',
  },
  {
    id: 'pending',
    label: 'Pending overtime',
    value: '7',
    icon: Loader,
    iconColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.05)',
  },
  {
    id: 'total',
    label: 'Total overtime this month',
    value: '4hrs',
    icon: Timer,
    iconColor: '#EA580C',
    bgColor: 'rgba(234, 88, 12, 0.05)',
  },
];

export interface AttendanceRecord {
  id: string;
  employee: string;
  avatar?: string;
  date: string;
  shift: string;
  clockIn: string;
  clockOut: string;
  totalTime: string;
  overtime: string;
  status: 'Present' | 'Absent' | 'On leave' | 'Active';
}

export const attendanceOverviewData: AttendanceRecord[] = [
  { id: '1', employee: 'Miracle Torff', date: '05/03/2026', shift: 'Morning shift', clockIn: '2:30 AM', clockOut: '18:30 PM', totalTime: '8.00 hr', overtime: '0.5 hr', status: 'Present' },
  { id: '2', employee: 'Cooper George', date: '05/03/2026', shift: 'Morning shift', clockIn: '-', clockOut: '-', totalTime: '-', overtime: '-', status: 'Absent' },
  { id: '3', employee: 'Nolan Dias', date: '05/03/2026', shift: 'Morning shift', clockIn: '2:30 AM', clockOut: '17:30 PM', totalTime: '7.00 hr', overtime: '0 hr', status: 'Present' },
  { id: '4', employee: 'Ahmad Press', date: '05/03/2026', shift: 'Morning shift', clockIn: '2:30 AM', clockOut: '17:00 PM', totalTime: '6.30 hr', overtime: '0 hr', status: 'Present' },
  { id: '5', employee: 'Craig Aminoff', date: '05/03/2026', shift: 'Morning shift', clockIn: '2:30 AM', clockOut: '18:30 PM', totalTime: '8.00 hr', overtime: '0.5 hr', status: 'Present' },
  { id: '6', employee: 'Maria Botosh', date: '05/03/2026', shift: 'Morning shift', clockIn: '2:30 AM', clockOut: '18:20 PM', totalTime: '7.40 hr', overtime: '0.2 hr', status: 'Present' },
];

export interface ShiftRecord {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  workingHours: string;
  type: string;
  status: 'Active' | 'Inactive';
}

export const shiftsData: ShiftRecord[] = [
  { id: '1', shiftName: 'Morning shift', startTime: '2:30', endTime: '18:00', breakTime: '60', workingHours: '8.0 hr', type: 'Day', status: 'Active' },
  { id: '2', shiftName: 'Evening shift', startTime: '14:00', endTime: '23:00', breakTime: '60', workingHours: '8.0 hr', type: 'Day', status: 'Active' },
  { id: '3', shiftName: 'Night shift', startTime: '22:00', endTime: '7:00', breakTime: '60', workingHours: '8.0 hr', type: 'Night', status: 'Active' },
];

export interface OvertimeRecord {
  id: string;
  employee: string;
  date: string;
  hours: string;
  type: string;
  reason: string;
  manager: string;
  status: 'Approved' | 'Rejected' | 'Paid' | 'Pending';
}

export const overtimeData: OvertimeRecord[] = [
  { id: '1', employee: 'Miracle Torff', date: '05/03/2026', hours: '8.00 hr', type: 'Weekday', reason: 'Project deadline', manager: 'Miracle Torff', status: 'Approved' },
  { id: '2', employee: 'Cooper George', date: '05/03/2026', hours: '4.30 hr', type: 'Weekday', reason: 'Project deadline', manager: 'Miracle Torff', status: 'Rejected' },
  { id: '3', employee: 'Nolan Dias', date: '05/03/2026', hours: '7.00 hr', type: 'Weekend', reason: 'Project deadline', manager: 'Ahmad Press', status: 'Approved' },
  { id: '4', employee: 'Ahmad Press', date: '05/03/2026', hours: '6.30 hr', type: 'Holiday', reason: 'System maintenance', manager: 'Ahmad Press', status: 'Approved' },
  { id: '5', employee: 'Craig Aminoff', date: '05/03/2026', hours: '8.00 hr', type: 'Holiday', reason: 'Project deadline', manager: 'Miracle Torff', status: 'Approved' },
];
