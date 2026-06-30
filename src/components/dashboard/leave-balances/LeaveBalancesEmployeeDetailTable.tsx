'use client';

import React, { useMemo, useState } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Button } from '@/components/ui/button';
import { ListFilter, MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
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
import EditLeaveBalanceSheet from './EditLeaveBalanceSheet';
import LeaveBalanceDetailSheet from './LeaveBalanceDetailSheet';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import {
    useLeaveBalancesPaginated,
    useLeaveBalanceFilterOptions,
    useDeleteLeaveBalance,
} from '@/features/leave-balance/hooks/useLeaveBalance';
import { LeaveBalanceListItem } from '@/features/leave-balance/leave-balance.types';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

interface LeaveBalancesEmployeeDetailTableProps {
    companyOuId?: string;
    employeeId: string;
    showSearch?: boolean;
    showFilter?: boolean;
}

const LeaveBalancesEmployeeDetailTable = ({
    companyOuId,
    employeeId,
    showSearch = false,
    showFilter = false,
}: LeaveBalancesEmployeeDetailTableProps) => {
    const { t } = useTranslation('dashboard');
    const { toast } = useToast();
    const { hasPermission } = usePermissions();

    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        year: 'all',
        leavePolicyId: 'all',
    });
    const [pendingFilters, setPendingFilters] = useState(activeFilters);

    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
    const [selectedBalance, setSelectedBalance] = useState<LeaveBalanceListItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<LeaveBalanceListItem | null>(null);

    const canUpdate = hasPermission('leave_balances:update');
    const canDelete = hasPermission('leave_balances:delete');

    const deleteMutation = useDeleteLeaveBalance();
    const { data: filterOptions } = useLeaveBalanceFilterOptions(companyOuId);

    const filter = useMemo(() => {
        const nextFilter: Record<string, string | number> = { employeeId };
        if (activeFilters.year !== 'all') nextFilter.year = Number(activeFilters.year);
        if (activeFilters.leavePolicyId !== 'all') {
            nextFilter.leavePolicyId = activeFilters.leavePolicyId;
        }
        return nextFilter;
    }, [activeFilters, employeeId]);

    const { data: connection, isLoading } = useLeaveBalancesPaginated(
        companyOuId,
        filter,
        { page: currentPage, pageSize },
    );

    const balances = connection?.items ?? [];
    const totalItems = connection?.totalCount ?? 0;
    const totalPages = connection?.totalPages ?? 0;

    const activeCount = Object.values(activeFilters).filter((value) => value !== 'all').length;

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const result = await deleteMutation.mutateAsync(itemToDelete.id);
            if (result && !result.success) {
                toast({
                    title: t('leaveBalances.delete.error', 'Failed to delete leave balance'),
                    description: result.error,
                    variant: 'destructive',
                });
                return;
            }
            toast({
                title: t('leaveBalances.delete.success', 'Leave balance deleted successfully'),
            });
        } catch {
            toast({
                title: t('leaveBalances.delete.error', 'Failed to delete leave balance'),
                variant: 'destructive',
            });
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const columns: ColumnConfig<LeaveBalanceListItem>[] = [
        {
            key: 'leavePolicy',
            label: t('leaveBalances.table.leavePolicy'),
            render: (item) => item.leavePolicy,
        },
        {
            key: 'year',
            label: t('leaveBalances.table.year', 'Year'),
        },
        {
            key: 'allocated',
            label: t('leaveBalances.table.allocated', 'Allocated'),
            render: (item) => `${item.allocated} ${t('common.table.days', 'days')}`,
        },
        {
            key: 'used',
            label: t('leaveBalances.table.used', 'Used'),
            render: (item) => `${item.used} ${t('common.table.days', 'days')}`,
        },
        {
            key: 'remaining',
            label: t('leaveBalances.table.remaining', 'Remaining'),
            render: (item) => `${item.remaining} ${t('common.table.days', 'days')}`,
        },
        {
            key: 'carriedForward',
            label: t('leaveBalances.table.carriedForward', 'Carried forward'),
            render: (item) => `${item.carriedForward} ${t('common.table.days', 'days')}`,
        },
    ];

    const renderRowActions = (item: LeaveBalanceListItem) => (
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
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-lg border-border">
                <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted rounded-lg transition-colors text-sm"
                    onClick={() => {
                        setSelectedBalance(item);
                        setIsDetailSheetOpen(true);
                    }}
                >
                    <Eye className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <span>{t('leaveBalances.actions.view', 'View')}</span>
                </DropdownMenuItem>
                {canUpdate && (
                    <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted rounded-lg transition-colors text-sm"
                        onClick={() => {
                            setSelectedBalance(item);
                            setIsEditSheetOpen(true);
                        }}
                    >
                        <Edit2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                        <span>{t('leaveBalances.actions.edit', 'Edit')}</span>
                    </DropdownMenuItem>
                )}
                {canDelete && (
                    <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors text-sm"
                        onClick={() => {
                            setItemToDelete(item);
                            setIsDeleteModalOpen(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        <span>{t('leaveBalances.actions.delete', 'Delete')}</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const filterButton = showFilter ? (
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
    ) : null;

    const filterPanel =
        showFilter && showFilters ? (
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
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const reset = { year: 'all', leavePolicyId: 'all' };
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
                data={balances}
                columns={columns}
                isLoading={isLoading || !companyOuId}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                showSearch={showSearch}
                renderCustomFilter={filterButton}
                showImport={false}
                showExport={false}
                currentPage={currentPage}
                totalPages={Math.max(1, totalPages)}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                totalItems={totalItems}
                emptyMessage={t('common.table.empty', 'No data found.')}
                renderRowActions={renderRowActions}
                onRowClick={(item) => {
                    setSelectedBalance(item);
                    setIsDetailSheetOpen(true);
                }}
                minWidth="900px"
            />

            <LeaveBalanceDetailSheet
                open={isDetailSheetOpen}
                onOpenChange={(open) => {
                    setIsDetailSheetOpen(open);
                    if (!open) setSelectedBalance(null);
                }}
                balance={selectedBalance}
            />

            <EditLeaveBalanceSheet
                open={isEditSheetOpen}
                onOpenChange={(open) => {
                    setIsEditSheetOpen(open);
                    if (!open) setSelectedBalance(null);
                }}
                balance={selectedBalance}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('leaveBalances.delete.title', 'Delete Leave Balance')}
                message={t('leaveBalances.delete.message', {
                    name: itemToDelete?.name,
                    leavePolicy: itemToDelete?.leavePolicy ?? '',
                })}
                confirmLabel={t('attendance.delete', 'Delete')}
                cancelLabel={t('attendance.cancel', 'Cancel')}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                variant="danger"
            />
        </>
    );
};

export default LeaveBalancesEmployeeDetailTable;
