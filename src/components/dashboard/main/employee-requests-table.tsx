'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical, CircleCheck, CircleX, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
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
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useAdminEmployeeRequests } from '@/features/admin-dashboard/hooks/useAdminEmployeeRequests';
import type { AdminRequestRow, AdminRequestTab } from '@/features/admin-dashboard/admin-request.types';
import ReviewRequestSheet from '@/components/dashboard/leave-requests/ReviewRequestSheet';
import type { LeaveRequest } from '@/types/leave-requests';

interface EmployeeRequestsTableProps {
    companyOuId: string;
    enabled?: boolean;
}

export function EmployeeRequestsTable({
    companyOuId,
    enabled = true,
}: EmployeeRequestsTableProps) {
    const { t } = useTranslation('dashboard');
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const canReviewLeave = hasPermission('leave_requests:read');

    const [activeTab, setActiveTab] = useState<AdminRequestTab>('all');
    const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const { rows, isLoading, isEmpty, hasNoSources, canReadLeave, canReadOvertime } =
        useAdminEmployeeRequests(companyOuId, activeTab, enabled && !!companyOuId);

    const getStatusIcon = (type: string) => {
        switch (type) {
            case 'approved':
            case 'approved-manager':
                return <CircleCheck className="h-3.5 w-3.5 text-green-500" strokeWidth={1.5} />;
            case 'pending':
                return <Clock className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />;
            case 'rejected':
                return <CircleX className="h-3.5 w-3.5 text-red-500" strokeWidth={1.5} />;
            default:
                return <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />;
        }
    };

    const getRequestTypeBadge = (kind: AdminRequestRow['kind']) => {
        const label =
            kind === 'leave'
                ? t('employeeRequests.typeLeave', 'Leave')
                : t('employeeRequests.typeOvertime', 'Overtime');
        const bgClass =
            kind === 'leave'
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20'
                : 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-500/20';

        return (
            <Badge
                variant="outline"
                className={cn(
                    'rounded-lg font-medium py-0.5 px-2.5 text-xs border shadow-none',
                    bgClass,
                )}
            >
                {label}
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

    const handleRowAction = (row: AdminRequestRow) => {
        if (row.kind === 'leave' && row.leaveRequest) {
            setReviewRequest(row.leaveRequest);
            setIsReviewOpen(true);
            return;
        }
        router.push('/dashboard/attendance/overtime');
    };

    return (
        <div className="flex flex-col h-full space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {t('employeeRequests.title', 'Employee requests')}
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as AdminRequestTab)}
                        className="w-auto"
                    >
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
                                <Checkbox className="rounded" disabled />
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
                        {!companyOuId ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {t('setup.selectCompanyPlaceholder')}
                                </TableCell>
                            </TableRow>
                        ) : hasNoSources ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {t('employeeRequests.noPermission', 'No access to request data')}
                                </TableCell>
                            </TableRow>
                        ) : isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={`skeleton-${index}`} className="hover:bg-transparent border-border">
                                    <TableCell className="text-center">
                                        <Skeleton className="h-4 w-4 rounded mx-auto" />
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-32 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : isEmpty ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {t('employeeRequests.empty', 'No requests for this filter')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((request) => (
                                <TableRow
                                    key={request.id}
                                    className="hover:bg-muted/50 border-border h-13 transition-colors"
                                >
                                    <TableCell className="text-center">
                                        <Checkbox className="rounded" disabled />
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold text-foreground truncate max-w-37.5 block">
                                            {request.employeeName}
                                        </span>
                                    </TableCell>
                                    <TableCell>{getRequestTypeBadge(request.kind)}</TableCell>
                                    <TableCell className="text-sm font-medium text-muted-foreground">
                                        {request.dateLabel}
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
                                            {request.statusLabel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                                            onClick={() => handleRowAction(request)}
                                            disabled={
                                                request.kind === 'leave' &&
                                                (!canReviewLeave || !request.leaveRequest)
                                            }
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-2 mt-auto pt-2">
                {canReadLeave && (
                    <Button
                        variant="secondary"
                        className="bg-muted/50 text-foreground hover:bg-muted/80 h-9 px-6 rounded-xl font-semibold text-xs transition-all shadow-sm border border-border"
                        asChild
                    >
                        <Link href="/dashboard/leave/leave-requests">
                            {t('employeeRequests.viewAllLeave', 'View all leave requests')}
                        </Link>
                    </Button>
                )}
                {canReadOvertime && (
                    <Button
                        variant="secondary"
                        className="bg-muted/50 text-foreground hover:bg-muted/80 h-9 px-6 rounded-xl font-semibold text-xs transition-all shadow-sm border border-border"
                        asChild
                    >
                        <Link href="/dashboard/attendance/overtime">
                            {t('employeeRequests.viewAllOvertime', 'View overtime')}
                        </Link>
                    </Button>
                )}
            </div>

            <ReviewRequestSheet
                open={isReviewOpen}
                onOpenChange={setIsReviewOpen}
                request={reviewRequest}
            />
        </div>
    );
}
