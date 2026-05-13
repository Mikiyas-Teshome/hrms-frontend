import { LeaveType } from '@/types/leave-types';
import { Users, CircleCheck, CircleDollarSign, CircleX } from 'lucide-react';

export const leaveTypeStats = [
    {
        borderColor: '#2865E380',
        icon: Users,
        title: 'Number of leave types',
        value: '10',
    },
    {
        borderColor: '#22C55E80',
        icon: CircleCheck,
        title: 'Active leaves',
        value: '8',
    },
    {
        borderColor: '#22C55E80',
        icon: CircleDollarSign,
        title: 'Paid leaves',
        value: '7',
    },
    {
        borderColor: '#D9770680',
        icon: CircleX,
        title: 'Unpaid leaves',
        value: '3',
    },
];

export const mockLeaveTypesData: LeaveType[] = [
    { id: '1', name: 'Annual leave', maxDaysPerYear: 21, condition: 'Paid', status: 'Active' },
    { id: '2', name: 'Sick leave', maxDaysPerYear: 10, condition: 'Paid', status: 'Active' },
    { id: '3', name: 'Maternity leave', maxDaysPerYear: 90, condition: 'Paid', status: 'Active' },
    { id: '4', name: 'Paternity leave', maxDaysPerYear: 15, condition: 'Paid', status: 'Inactive' },
    { id: '5', name: 'Emergency leave', maxDaysPerYear: 5, condition: 'Paid', status: 'Active' },
    { id: '6', name: 'Bereavement leave', maxDaysPerYear: 7, condition: 'Unpaid', status: 'Active' },
    { id: '7', name: 'Study leave', maxDaysPerYear: 10, condition: 'Paid', status: 'Active' },
    { id: '8', name: 'Compensatory leave', maxDaysPerYear: 12, condition: 'Paid', status: 'Active' },
    { id: '9', name: 'Personal leave', maxDaysPerYear: 5, condition: 'Unpaid', status: 'Inactive' },
    { id: '10', name: 'Marriage leave', maxDaysPerYear: 7, condition: 'Paid', status: 'Active' },
];
