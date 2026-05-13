'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const activities = [
    {
        id: 1,
        type: 'Announcements',
        icon: MessageSquare,
        content: 'New leave policy published',
        source: 'HR',
        date: 'Today',
        priority: 'Mid',
        priorityColor: 'text-amber-500',
        status: 'Unread',
        statusIcon: Bell,
    },
    {
        id: 2,
        type: 'Alert',
        icon: AlertTriangle,
        content: '5 employees missing payroll data',
        source: 'Payroll',
        date: 'Mar 8',
        priority: 'High',
        priorityColor: 'text-red-500',
        status: 'Unread',
        statusIcon: Bell,
    },
    {
        id: 3,
        type: 'Announcements',
        icon: MessageSquare,
        content: 'Whole company vacation this weekend',
        source: 'Admin',
        date: 'Mar 8',
        priority: 'Low',
        priorityColor: 'text-muted-foreground',
        status: 'Read',
        statusIcon: CheckCircle2,
    },
    {
        id: 4,
        type: 'Alert',
        icon: AlertTriangle,
        content: 'Unauthorized access detected with the account',
        source: 'System',
        date: 'Mar 5',
        priority: 'High',
        priorityColor: 'text-red-500',
        status: 'Resolved',
        statusIcon: CheckCircle2,
    },
    {
        id: 5,
        type: 'Notification',
        icon: Bell,
        content: 'Ahmed Ali joined Backend Team',
        source: 'Admin',
        date: 'Mar 5',
        priority: 'Low',
        priorityColor: 'text-muted-foreground',
        status: 'Read',
        statusIcon: CheckCircle2,
    },
];

type FilterTab = 'all' | 'alert' | 'announcements' | 'notifications';

const TAB_TO_TYPE: Record<FilterTab, string | null> = {
    all: null,
    alert: 'Alert',
    announcements: 'Announcements',
    notifications: 'Notification',
};

const TABS: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'alert', label: 'Alert' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'notifications', label: 'Notifications' },
];

export function RecentActivityTable() {
    const { t } = useTranslation('dashboard');
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [search, setSearch] = useState('');

    const filtered = activities.filter((a) => {
        const typeMatch = TAB_TO_TYPE[activeTab] === null || a.type === TAB_TO_TYPE[activeTab];
        const searchMatch =
            search.trim() === '' ||
            a.content.toLowerCase().includes(search.toLowerCase()) ||
            a.type.toLowerCase().includes(search.toLowerCase()) ||
            a.source.toLowerCase().includes(search.toLowerCase());
        return typeMatch && searchMatch;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                    {t('recentActivity.title', 'Recent Activity')}
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    {/* Search */}
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

                    {/* Filter tabs — custom pill buttons matching the design */}
                    <div className="flex items-center gap-1 p-1 bg-secondary rounded-[10px] h-9">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
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
                                <Checkbox className="rounded" />
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
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground text-sm"
                                >
                                    {t('recentActivity.noResults', 'No results found.')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((activity) => (
                                <TableRow
                                    key={activity.id}
                                    className="hover:bg-muted/50 border-border h-13.25"
                                >
                                    <TableCell className="text-center">
                                        <Checkbox className="rounded" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <activity.icon className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-normal text-foreground whitespace-nowrap">
                                                {activity.type}
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
                                        {activity.date}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                'text-sm font-semibold',
                                                activity.priorityColor,
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
                                            <activity.statusIcon className="h-3 w-3" />
                                            {activity.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-center sm:justify-end">
                <Button
                    variant="secondary"
                    className="bg-muted text-foreground hover:bg-muted/80 h-9 px-4 rounded-lg font-medium text-sm"
                >
                    {t('recentActivity.viewAll', 'View All Activity')}
                </Button>
            </div>
        </div>
    );
}
