import { LeaveRequest } from '@/types/leave-requests';
import { CircleCheck, Loader, Users, CalendarDays } from 'lucide-react';

export const leaveRequestStats = [
    {
        borderColor: '#22C55E80',
        icon: CircleCheck,
        title: 'Active leave request',
        value: '5',
    },
    {
        borderColor: '#2865E380',
        icon: Loader,
        title: 'Pending requests',
        value: '1',
    },
    {
        borderColor: '#2865E380',
        icon: Users,
        title: 'Leave requested employees',
        value: '3',
    },
    {
        borderColor: '#D9770680',
        icon: CalendarDays,
        title: 'Total requested days',
        value: '112',
    },
];

export const mockLeaveRequestsData: LeaveRequest[] = [
    {
        id: '1',
        employeeName: 'Cristofer Bergson',
        requestType: 'Annual leave',
        leaveFrom: '05/03/2026',
        leaveTo: '12/03/2026',
        duration: '7 days',
        status: 'Manager approved',
    },
    {
        id: '2',
        employeeName: 'Maria Vaccaro',
        requestType: 'Sick leave',
        leaveFrom: '11/03/2026',
        leaveTo: '13/03/2026',
        duration: '2 days',
        status: 'Approved',
    },
    {
        id: '3',
        employeeName: 'Lydia Aminoff',
        requestType: 'Maternity leave',
        leaveFrom: '05/03/2026',
        leaveTo: '08/07/2026',
        duration: '2 months',
        status: 'Approved',
    },
    {
        id: '4',
        employeeName: 'Paityn Botosh',
        requestType: 'Sick leave',
        leaveFrom: '03/03/2026',
        leaveTo: '06/03/2026',
        duration: '3 days',
        status: 'Pending',
    },
    {
        id: '5',
        employeeName: 'Maria Gouse',
        requestType: 'Maternity leave',
        leaveFrom: '01/01/2026',
        leaveTo: '07/05/2026',
        duration: '4 months',
        status: 'Rejected',
    },
];
