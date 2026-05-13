/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { LeaveBalance } from '@/types/leave-balances';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Button } from '@/components/ui/button';
import { ListFilter, MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import { mockLeaveBalancesData } from '@/data/leave-balances';
import { useTranslation } from 'react-i18next';
import { useLeaveBalances } from '@/features/leave-balance/hooks/useLeaveBalance';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import EditLeaveBalanceSheet from './EditLeaveBalanceSheet';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';

const LeaveBalancesTable = () => {
    const { t } = useTranslation('dashboard');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<LeaveBalance | null>(null);

    const { data: apiData, isLoading, isError } = useLeaveBalances();

    const displayData = isLoading ? [] : isError ? mockLeaveBalancesData : apiData || [];

    // Search and filter logic
    const filteredData = displayData.filter((item: any) => {
        const searchLower = searchValue.toLowerCase();
        return (
            item.name.toLowerCase().includes(searchLower) ||
            item.leaveType.toLowerCase().includes(searchLower)
        );
    });

    const columns: ColumnConfig<LeaveBalance>[] = [
        {
            key: 'name',
            label: t('leaveBalances.table.name', 'Name'),
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-3 font-medium">
                    <Avatar size="default">
                        <AvatarImage src={item.avatar} alt={item.name} />
                        <AvatarFallback className="bg-muted text-xs">
                            {item.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground">{item.name}</span>
                </div>
            ),
        },
        {
            key: 'leaveType',
            label: t('leaveBalances.table.leaveType', 'Leave type'),
            render: (item) => t(`leaveTypes.types.${item.leaveType}`, item.leaveType),
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

    const renderRowActions = (item: LeaveBalance) => (
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
            <DropdownMenuContent
                align="end"
                className="w-40 rounded-xl p-1 shadow-lg border-border"
            >
                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted rounded-lg transition-colors text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <span>{t('leaveBalances.actions.view', 'View')}</span>
                </DropdownMenuItem>
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
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const filterButton = (
        <Button
            variant="outline"
            className={cn('h-10 gap-2 border-input rounded-lg', showFilters && 'bg-muted')}
            onClick={() => setShowFilters((v) => !v)}
        >
            <ListFilter className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">{t('attendance.filter', 'Filter')}</span>
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-50 text-[10px] text-brand-600 font-semibold border border-brand-200">
                1
            </span>
        </Button>
    );

    return (
        <>
            <UniversalDataTable
                data={filteredData}
                columns={columns}
                isLoading={isLoading}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder={t('leaveRequests.filter.search', 'Search for employees')}
                renderCustomFilter={filterButton}
                showImport={false}
                showExport={false}
                currentPage={currentPage}
                totalPages={1}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                totalItems={filteredData.length}
                emptyMessage={t('common.table.empty', 'No data found.')}
                renderRowActions={renderRowActions}
                minWidth="1000px"
            />

            <EditLeaveBalanceSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                balance={selectedBalance}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('leaveBalances.delete.title', 'Delete Leave Balance')}
                message={t('leaveBalances.delete.message', {
                    name: itemToDelete?.name,
                    leaveType: itemToDelete
                        ? t(`leaveTypes.types.${itemToDelete.leaveType}`, itemToDelete.leaveType)
                        : '',
                })}
                confirmLabel={t('attendance.delete', 'Delete')}
                cancelLabel={t('attendance.cancel', 'Cancel')}
                onConfirm={() => {
                    // API call here
                    setIsDeleteModalOpen(false);
                }}
                variant="danger"
            />
        </>
    );
};

export default LeaveBalancesTable;
