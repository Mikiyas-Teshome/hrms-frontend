'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    MoreVertical,
    MessageSquare,
    AlertTriangle,
    Bell,
    CheckCircle2,
    Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useMarkNotificationRead } from '@/features/notification/hooks/useNotification';
import type { AdminActivityTab } from '@/features/admin-dashboard/admin-recent-activity.types';
import { useAdminRecentActivity } from '@/features/admin-dashboard/hooks/useAdminRecentActivity';
import {
    filterActivityBySearch,
    filterActivityByTab,
} from '@/features/admin-dashboard/recent-activity.utils';

const TABS: { value: AdminActivityTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'alert', label: 'Alert' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'notifications', label: 'Notifications' },
];

function typeIcon(tabType: string) {
    switch (tabType) {
        case 'Alert':
            return AlertTriangle;
        case 'Notification':
            return Bell;
        default:
            return MessageSquare;
    }
}

function statusIcon(status: string) {
    if (status === 'Unread') {
        return Bell;
    }
    return CheckCircle2;
}

function priorityColor(priority: string): string {
    switch (priority) {
        case 'High':
            return 'text-red-500';
        case 'Mid':
            return 'text-amber-500';
        default:
            return 'text-muted-foreground';
    }
}

interface RecentActivityTableProps {
    companyId: string;
    enabled?: boolean;
}

export function RecentActivityTable({ companyId, enabled = true }: RecentActivityTableProps) {
    const { t } = useTranslation('dashboard');
    const { hasPermission } = usePermissions();
    const canViewAllAudit = hasPermission('audit_logs:read');
    const { mutate: markRead } = useMarkNotificationRead();

    const [activeTab, setActiveTab] = useState<AdminActivityTab>('all');
    const [search, setSearch] = useState('');

    const { rows, isLoading, scopeReady, canReadAnnouncements, canReadAudit } =
        useAdminRecentActivity(companyId, enabled);

    const filtered = useMemo(() => {
        const byTab = filterActivityByTab(rows, activeTab);
        return filterActivityBySearch(byTab, search);
    }, [rows, activeTab, search]);

    const showNoPermission =
        scopeReady &&
        !canReadAnnouncements &&
        !canReadAudit &&
        !isLoading &&
        filtered.length === 0;

    const statusLabel = (status: string) => {
        if (status === 'Published') {
            return t('recentActivity.published', 'Published');
        }
        if (status === 'Resolved') {
            return t('recentActivity.resolved', 'Resolved');
        }
        return status;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                    {t('recentActivity.title', 'Recent Activity')}
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className="relative w-full sm:w-75">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t(
                                'recentActivity.searchPlaceholder',
                                'Search for activities...',
                            )}
                            className="pl-9 h-9 rounded-lg border-border bg-background text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-secondary rounded-[10px] h-9">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    'h-7 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                                    activeTab === tab.value
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-foreground/60 hover:text-foreground',
                                )}
                            >
                                {t(`recentActivity.${tab.value}`, tab.label)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="w-12.5 text-center">
                                <Checkbox className="rounded" disabled />
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                                {t('recentActivity.type', 'Type')}
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                                {t('recentActivity.content', 'Content')}
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                                {t('recentActivity.source', 'Source')}
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                                {t('recentActivity.date', 'Date')}
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                                {t('recentActivity.priority', 'Priority')}
                            </TableHead>
                            <TableHead className="font-medium text-foreground">
                                {t('recentActivity.status', 'Status')}
                            </TableHead>
                            <TableHead className="w-12.5"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!scopeReady || !companyId ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground text-sm"
                                >
                                    {t('setup.selectCompanyPlaceholder')}
                                </TableCell>
                            </TableRow>
                        ) : showNoPermission ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground text-sm"
                                >
                                    {t(
                                        'recentActivity.noPermission',
                                        'No access to activity data',
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={`skeleton-${index}`} className="hover:bg-transparent border-border">
                                    <TableCell className="text-center">
                                        <Skeleton className="h-4 w-4 rounded mx-auto" />
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-16 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20 rounded-md" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground text-sm"
                                >
                                    {t('recentActivity.noResults', 'No results found.')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((activity) => {
                                const TypeIcon = typeIcon(activity.tabType);
                                const StatusIcon = statusIcon(activity.status);
                                const isUnreadNotification =
                                    activity.tabType === 'Notification' &&
                                    activity.status === 'Unread' &&
                                    !!activity.notificationId;

                                return (
                                    <TableRow
                                        key={activity.id}
                                        className={cn(
                                            'hover:bg-muted/50 border-border h-13.25',
                                            isUnreadNotification && 'cursor-pointer',
                                        )}
                                        onClick={() => {
                                            if (
                                                isUnreadNotification &&
                                                activity.notificationId
                                            ) {
                                                markRead(activity.notificationId);
                                            }
                                        }}
                                    >
                                        <TableCell className="text-center">
                                            <Checkbox className="rounded" disabled />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TypeIcon className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-normal text-foreground whitespace-nowrap">
                                                    {activity.tabType}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground min-w-50">
                                            {activity.content}
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {activity.source}
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {activity.dateLabel}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    'text-sm font-semibold',
                                                    priorityColor(activity.priority),
                                                )}
                                            >
                                                {activity.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="flex items-center gap-1.5 w-fit rounded-lg bg-background border-border py-0.5 px-2 text-xs font-semibold text-foreground"
                                            >
                                                <StatusIcon className="h-3 w-3" />
                                                {statusLabel(activity.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {canViewAllAudit && (
                <div className="flex justify-center sm:justify-end">
                    <Button
                        variant="secondary"
                        className="bg-muted text-foreground hover:bg-muted/80 h-9 px-4 rounded-lg font-medium text-sm"
                        asChild
                    >
                        <Link href="/dashboard/reports/hr-reports">
                            {t('recentActivity.viewAll', 'View All Activity')}
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
