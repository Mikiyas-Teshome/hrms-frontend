'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Button } from '@/components/ui/button';
import { ListFilter, MoreVertical, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useLeaveBalancesPaginated,
    useLeaveBalanceFilterOptions,
} from '@/features/leave-balance/hooks/useLeaveBalance';
import {
    aggregateLeaveBalancesByEmployee,
    type LeaveBalanceEmployeeSummary,
} from '@/features/leave-balance/leave-balance-aggregation.utils';

interface LeaveBalancesTableProps {
    companyOuId?: string;
}

const LeaveBalancesTable = ({ companyOuId }: LeaveBalancesTableProps) => {
    const { t } = useTranslation('dashboard');
    const router = useRouter();

    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        year: 'all',
        leavePolicyId: 'all',
        departmentId: 'all',
    });
    const [pendingFilters, setPendingFilters] = useState(activeFilters);

    const { data: filterOptions } = useLeaveBalanceFilterOptions(companyOuId);

    const filter = useMemo(() => {
        const nextFilter: Record<string, string | number> = {};
        if (activeFilters.year !== 'all') nextFilter.year = Number(activeFilters.year);
        if (activeFilters.leavePolicyId !== 'all') {
            nextFilter.leavePolicyId = activeFilters.leavePolicyId;
        }
        if (activeFilters.departmentId !== 'all') {
            nextFilter.departmentId = activeFilters.departmentId;
        }
        return nextFilter;
    }, [activeFilters]);

    const { data: connection, isLoading } = useLeaveBalancesPaginated(
        companyOuId,
        filter,
        { page: 1, pageSize: 500 },
    );

    const employeeSummaries = useMemo(
        () => aggregateLeaveBalancesByEmployee(connection?.items ?? []),
        [connection?.items],
    );

    const filteredEmployees = useMemo(() => {
        if (!searchValue) return employeeSummaries;
        const needle = searchValue.toLowerCase();
        return employeeSummaries.filter((item) => item.name.toLowerCase().includes(needle));
    }, [employeeSummaries, searchValue]);

    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredEmployees.slice(start, start + pageSize);
    }, [filteredEmployees, currentPage, pageSize]);

    const totalFilteredCount = filteredEmployees.length;
    const totalPages = totalFilteredCount === 0 ? 0 : Math.ceil(totalFilteredCount / pageSize);
    const activeCount = Object.values(activeFilters).filter((value) => value !== 'all').length;
    const daysLabel = t('common.table.days', 'days');

    const handleOpenEmployeePage = (employeeId: string, employeeName: string) => {
        const params = new URLSearchParams({ name: employeeName });
        router.push(`/dashboard/leave/balances/${employeeId}?${params.toString()}`);
    };

    const columns: ColumnConfig<LeaveBalanceEmployeeSummary>[] = [
        {
            key: 'name',
            label: t('leaveBalances.table.employee', 'Employee'),
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-3 font-medium">
                    <Avatar size="default">
                        <AvatarImage src={item.avatar ?? undefined} alt={item.name} />
                        <AvatarFallback className="bg-muted text-xs">
                            {item.name
                                .split(' ')
                                .map((part) => part[0])
                                .join('')}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground">{item.name}</span>
                </div>
            ),
        },
        {
            key: 'policyCount',
            label: t('leaveBalances.table.leavePolicies', 'Leave policies'),
            sortable: true,
        },
        {
            key: 'totalAllocated',
            label: t('leaveBalances.table.allocated', 'Allocated'),
            sortable: true,
            render: (item) => `${item.totalAllocated} ${daysLabel}`,
        },
        {
            key: 'totalUsed',
            label: t('leaveBalances.table.used', 'Used'),
            sortable: true,
            render: (item) => `${item.totalUsed} ${daysLabel}`,
        },
        {
            key: 'totalRemaining',
            label: t('leaveBalances.table.remaining', 'Remaining'),
            sortable: true,
            render: (item) => `${item.totalRemaining} ${daysLabel}`,
        },
        {
            key: 'totalCarriedForward',
            label: t('leaveBalances.table.carriedForward', 'Carried forward'),
            sortable: true,
            render: (item) => `${item.totalCarriedForward} ${daysLabel}`,
        },
    ];

    const renderRowActions = (item: LeaveBalanceEmployeeSummary) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-muted rounded-lg outline-none"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-border">
                <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted rounded-lg transition-colors text-sm"
                    onClick={() => handleOpenEmployeePage(item.employeeId, item.name)}
                >
                    <Eye className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <span>{t('leaveBalances.actions.viewBalances', 'View balances')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const filterButton = (
        <Button
            variant="outline"
            className={cn('h-10 gap-2 border-input rounded-lg', showFilters && 'bg-muted')}
            onClick={() => {
                setShowFilters((value) => !value);
                if (!showFilters) setPendingFilters(activeFilters);
            }}
        >
            <ListFilter className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">{t('attendance.filter', 'Filter')}</span>
            {activeCount > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-50 text-[10px] text-brand-600 font-semibold border border-brand-200">
                    {activeCount}
                </span>
            )}
        </Button>
    );

    const filterPanel = showFilters ? (
        <div className="flex flex-wrap items-end gap-4 p-4 mb-4 border border-border rounded-xl bg-muted/30">
            <div className="space-y-1.5 min-w-35">
                <label className="text-xs font-medium text-muted-foreground">
                    {t('leaveBalances.table.year', 'Year')}
                </label>
                <Select
                    value={pendingFilters.year}
                    onValueChange={(value) => setPendingFilters((current) => ({ ...current, year: value }))}
                >
                    <SelectTrigger className="h-9 bg-background">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                        {(filterOptions?.years ?? []).map((year) => (
                            <SelectItem key={year} value={String(year)}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5 min-w-45">
                <label className="text-xs font-medium text-muted-foreground">
                    {t('leaveBalances.table.leavePolicy')}
                </label>
                <Select
                    value={pendingFilters.leavePolicyId}
                    onValueChange={(value) =>
                        setPendingFilters((current) => ({ ...current, leavePolicyId: value }))
                    }
                >
                    <SelectTrigger className="h-9 bg-background">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                        {(filterOptions?.policies ?? []).map((policy) => (
                            <SelectItem key={policy.id} value={policy.id}>
                                {policy.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1.5 min-w-45">
                <label className="text-xs font-medium text-muted-foreground">
                    {t('leaveBalances.filter.department', 'Department')}
                </label>
                <Select
                    value={pendingFilters.departmentId}
                    onValueChange={(value) =>
                        setPendingFilters((current) => ({ ...current, departmentId: value }))
                    }
                >
                    <SelectTrigger className="h-9 bg-background">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                        {(filterOptions?.departments ?? []).map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const reset = { year: 'all', leavePolicyId: 'all', departmentId: 'all' };
                        setPendingFilters(reset);
                        setActiveFilters(reset);
                        setShowFilters(false);
                        setCurrentPage(1);
                    }}
                >
                    {t('common.reset', 'Reset')}
                </Button>
                <Button
                    size="sm"
                    onClick={() => {
                        setActiveFilters(pendingFilters);
                        setShowFilters(false);
                        setCurrentPage(1);
                    }}
                >
                    {t('common.apply', 'Apply')}
                </Button>
            </div>
        </div>
    ) : null;

    return (
        <>
            {filterPanel}
            <UniversalDataTable
                data={paginatedEmployees}
                columns={columns}
                isLoading={isLoading || !companyOuId}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchValue={searchValue}
                onSearchChange={(value) => {
                    setSearchValue(value);
                    setCurrentPage(1);
                }}
                searchPlaceholder={t('leaveRequests.filter.search', 'Search for employees')}
                renderCustomFilter={filterButton}
                showImport={false}
                showExport={false}
                currentPage={currentPage}
                totalPages={totalPages || 1}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                totalItems={totalFilteredCount}
                emptyMessage={t('common.table.empty', 'No data found.')}
                renderRowActions={renderRowActions}
                onRowClick={(item) => handleOpenEmployeePage(item.employeeId, item.name)}
                getRowId={(item) => item.employeeId}
                minWidth="1000px"
            />
        </>
    );
};

export default LeaveBalancesTable;
