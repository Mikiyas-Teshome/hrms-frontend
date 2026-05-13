import { Employee, EmployeeStats, EmployeeStatus } from '@/types/employee';
import { Users, CircleCheck, CalendarClock, FileClock } from 'lucide-react';

export const employeeStatsData = (stats: EmployeeStats) => [
    {
        title: 'Number of employees',
        value: stats.total.toString(),
        icon: Users,
        color: '#2865E3',
        borderColor: 'rgba(40, 101, 227, 0.5)',
        bgColor: 'transparent',
    },
    {
        title: 'Active employees',
        value: stats.active.toString(),
        icon: CircleCheck,
        color: '#22C55E',
        borderColor: 'rgba(34, 197, 94, 0.5)',
        bgColor: 'transparent',
    },
    {
        title: 'On leave',
        value: stats.onLeave.toString(),
        icon: CalendarClock,
        color: '#D97706',
        borderColor: 'rgba(217, 119, 6, 0.5)',
        bgColor: 'transparent',
    },
    {
        title: 'Non compliant',
        value: stats.nonCompliant.toString(),
        icon: FileClock,
        color: '#EF4444',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        bgColor: 'rgba(239, 68, 68, 0.05)',
    },
];

export const mockEmployees: Employee[] = [
    {
        id: '1',
        name: 'Miracle Torff',
        department: 'Donec a eros justo. Fusc...',
        role: 'Designer',
        email: 'Miracletorff@someone.com',
        status: EmployeeStatus.ACTIVE,
    },
    {
        id: '2',
        name: 'Cooper George',
        department: 'Donec a eros justo. Fusc...',
        role: 'Sales agent',
        email: 'Coopergeorge@someone.com',
        status: EmployeeStatus.TERMINATED,
    },
    {
        id: '3',
        name: 'Nolan Dias',
        department: 'Donec a eros justo. Fusc...',
        role: 'Developer',
        email: 'Nolandias@someone.com',
        status: EmployeeStatus.ACTIVE,
    },
    {
        id: '4',
        name: 'Ahmad Press',
        department: 'Donec a eros justo. Fusc...',
        role: 'Marketing manager',
        email: 'Ahmadpress@someone.com',
        status: EmployeeStatus.ACTIVE,
    },
    {
        id: '5',
        name: 'Craig Aminoff',
        department: 'Donec a eros justo. Fusc...',
        role: 'Developer',
        email: 'Craigaminoff@someone.com',
        status: EmployeeStatus.ACTIVE,
    },
    {
        id: '6',
        name: 'Maria Botosh',
        department: 'Management',
        role: 'Managing director',
        email: 'Mariabotosh@someone.com',
        status: EmployeeStatus.ACTIVE,
    },
    {
        id: '7',
        name: 'Alena Korsgaard',
        department: 'Marketing',
        role: 'Graphic designer',
        email: 'Alenakorsgaard@someone.co...',
        status: EmployeeStatus.ACTIVE,
    },
    {
        id: '8',
        name: 'Giana Philips',
        department: 'Sales',
        role: 'Sales agent',
        email: 'Gianaphilips@someone.com',
        status: EmployeeStatus.TERMINATED,
    },
    {
        id: '9',
        name: 'Alena Gouse',
        department: 'Engineering',
        role: 'Designer',
        email: 'Alenagouse@someone.com',
        status: EmployeeStatus.ACTIVE,
    },
    {
        id: '10',
        name: 'Kianna Carder',
        department: 'Management',
        role: 'CTO',
        email: 'Kiannacarder@someone.com',
        status: EmployeeStatus.ACTIVE,
    },
];

export const summaryStats: EmployeeStats = {
    total: 24,
    active: 22,
    onLeave: 1,
    nonCompliant: 1,
};
