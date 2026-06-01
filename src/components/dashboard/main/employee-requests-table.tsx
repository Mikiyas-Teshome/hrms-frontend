'use client';

import { MoreVertical, CircleCheck, CircleX, Clock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const requests = [
    {
        id: 1,
        employee: { name: 'Cristofer Bergson', avatar: '/avatars/avatar-1.png', initials: 'CB' },
        type: 'Leave',
        date: 'Mar 07',
        status: 'Manager approved',
        statusType: 'approved-manager',
    },
    {
        id: 2,
        employee: { name: 'Maria Vaccaro', avatar: '/avatars/avatar-2.png', initials: 'MV' },
        type: 'Overtime',
        date: 'Mar 07',
        status: 'Approved',
        statusType: 'approved',
    },
    {
        id: 3,
        employee: { name: 'Lydia Aminoff', avatar: '/avatars/avatar-3.png', initials: 'LA' },
        type: 'Leave',
        date: 'Mar 06',
        status: 'Approved',
        statusType: 'approved',
    },
    {
        id: 4,
        employee: { name: 'Paityn Botosh', avatar: '/avatars/avatar-4.png', initials: 'PB' },
        type: 'Leave',
        date: 'Mar 04',
        status: 'In Process',
        statusType: 'pending',
    },
    {
        id: 5,
        employee: { name: 'Maria Gouse', avatar: '/avatars/avatar-5.png', initials: 'MG' },
        type: 'Overtime',
        date: 'Mar 03',
        status: 'Rejected',
        statusType: 'rejected',
    },
];

export function EmployeeRequestsTable() {
    const { t } = useTranslation('dashboard');
    const [searchValue] = useState('');

    const getStatusIcon = (type: string) => {
        switch (type) {
            case 'approved':
            case 'approved-manager':
                return <CircleCheck className="h-3.5 w-3.5 text-green-500" strokeWidth={1.5} />;
            case 'pending':
                return (
                    <Loader2
                        className="h-3.5 w-3.5 text-amber-500 animate-spin"
                        strokeWidth={1.5}
                    />
                );
            case 'rejected':
                return <CircleX className="h-3.5 w-3.5 text-red-500" strokeWidth={1.5} />;
            default:
                return <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />;
        }
    };

    const getRequestTypeBadge = (type: string) => {
        let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';

        if (type === 'Leave') {
            bgClass =
                'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
        } else if (type === 'Overtime') {
            bgClass =
                'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-500/20';
        }

        return (
            <Badge
                variant="outline"
                className={cn(
                    'rounded-lg font-medium py-0.5 px-2.5 text-xs border shadow-none',
                    bgClass,
                )}
            >
                {type}
            </Badge>
        );
    };

    const getStatusBadgeStyle = (statusType: string) => {
        switch (statusType) {
            case 'approved':
            case 'approved-manager':
                return 'bg-green-50/50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400';
            case 'pending':
                return 'bg-amber-50/50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400';
            case 'rejected':
                return 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400';
            default:
                return 'bg-slate-50/50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20 text-slate-700 dark:text-slate-400';
        }
    };

    const filteredRequests = requests.filter(
        (request) =>
            request.employee.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            request.type.toLowerCase().includes(searchValue.toLowerCase()) ||
            request.status.toLowerCase().includes(searchValue.toLowerCase()),
    );

    return (
        <div className="flex flex-col h-full space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {t('employeeRequests.title', 'Employee requests')}
                </h2>
                <div className="flex items-center gap-3">
                    <Tabs defaultValue="all" className="w-auto">
                        <TabsList className="bg-secondary/50 p-1 h-9 rounded-xl">
                            <TabsTrigger
                                value="all"
                                className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                {t('common.all', 'All')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="pending"
                                className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                {t('common.pending', 'Pending')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="approved"
                                className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                {t('common.approved', 'Approved')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="denied"
                                className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                {t('common.denied', 'Denied')}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-card">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border border-b">
                            <TableHead className="w-12.5 text-center">
                                <Checkbox className="rounded" />
                            </TableHead>
                            <TableHead className="font-semibold text-foreground text-sm">
                                {t('employeeRequests.employee', 'Employee')}
                            </TableHead>
                            <TableHead className="font-semibold text-foreground text-sm">
                                {t('employeeRequests.requestType', 'Request type')}
                            </TableHead>
                            <TableHead className="font-semibold text-foreground text-sm">
                                {t('employeeRequests.date', 'Date')}
                            </TableHead>
                            <TableHead className="font-semibold text-foreground text-sm">
                                {t('employeeRequests.status', 'Status')}
                            </TableHead>
                            <TableHead className="w-12.5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.map((request) => (
                            <TableRow
                                key={request.id}
                                className="hover:bg-muted/50 border-border h-13 transition-colors"
                            >
                                <TableCell className="text-center">
                                    <Checkbox className="rounded" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-foreground truncate max-w-37.5">
                                            {request.employee.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{getRequestTypeBadge(request.type)}</TableCell>
                                <TableCell className="text-sm font-medium text-muted-foreground">
                                    {request.date}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'flex items-center gap-1.5 w-fit rounded-lg border py-0.5 px-2.5 text-xs font-bold shadow-none',
                                            getStatusBadgeStyle(request.statusType),
                                        )}
                                    >
                                        {getStatusIcon(request.statusType)}
                                        {request.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center sm:justify-end mt-auto pt-2">
                <Button
                    variant="secondary"
                    className="bg-muted/50 text-foreground hover:bg-muted/80 h-9 px-6 rounded-xl font-semibold text-xs transition-all shadow-sm border border-border"
                >
                    {t('employeeRequests.viewAll', 'View all requests')}
                </Button>
            </div>
        </div>
    );
}
