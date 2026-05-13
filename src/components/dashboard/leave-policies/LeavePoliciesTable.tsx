/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { LeavePolicy } from '@/types/leave-policies';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Button } from '@/components/ui/button';
import { ListFilter, CircleCheck, CircleX, MoreVertical } from 'lucide-react';
import { mockLeavePoliciesData } from '@/data/leave-policies';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    useLeavePolicies,
    useDeleteLeavePolicy,
} from '@/features/leave-policy/hooks/useLeavePolicy';
import { LeavePolicyResponse } from '@/features/leave-policy/leave-policy.types';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';

const renderStatusBadge = (status: LeavePolicy['status']) => {
    const isActive = status === 'Active';
    const Icon = isActive ? CircleCheck : CircleX;
    const colorClass = isActive ? 'text-[#22C55E]' : 'text-[#EF4444]';
    const borderClass = isActive ? 'border-[#22C55E]/30' : 'border-[#EF4444]/30';

    return (
        <div
            className={cn(
                'flex items-center gap-1.5 px-2 py-0.5 w-fit bg-background border rounded-lg',
                borderClass,
            )}
        >
            <Icon className={cn('w-3 h-3', colorClass)} strokeWidth={2} />
            <span className="text-[12px] font-semibold text-foreground">{status}</span>
        </div>
    );
};

const LeavePoliciesTable = () => {
    const { t } = useTranslation('dashboard');
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<LeavePolicy | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { mutateAsync: deleteLeavePolicy } = useDeleteLeavePolicy();

    const { data: policiesResponse, isLoading, isError } = useLeavePolicies();

    const policiesData: LeavePolicy[] = isError
        ? mockLeavePoliciesData
        : (policiesResponse || []).map((policy: LeavePolicyResponse) => ({
              id: policy.id,
              policyName: `Policy-${policy.id.substring(0, 4)}`,
              leaveType: policy.leaveTypeId,
              maxDaysPerYear: policy.maxBalance,
              accrualMethod: policy.accrualMethod,
              carryForward: 'N/A',
              approval: 'Required',
              status: 'Active',
          }));

    const handleDeleteClick = (policy: LeavePolicy) => {
        setPolicyToDelete(policy);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!policyToDelete?.id) return;
        setIsDeleting(true);
        try {
            await deleteLeavePolicy(policyToDelete.id);
            setIsDeleteModalOpen(false);
            setPolicyToDelete(null);
            toast({
                title: t('leavePolicies.deleteSuccess'),
                description: t('leavePolicies.deleteSuccessDesc'),
                variant: 'success',
            });
        } catch (error: any) {
            console.error('Failed to delete leave policy:', error);
            toast({
                title: t('leavePolicies.deleteError'),
                description: error?.message || t('leavePolicies.deleteErrorDesc'),
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const displayData = isLoading ? [] : policiesData;

    const filteredData = displayData.filter((item) => {
        const matchSearch = item.policyName.toLowerCase().includes(searchValue.toLowerCase());
        return matchSearch;
    });

    const columns: ColumnConfig<LeavePolicy>[] = [
        {
            key: 'policyName',
            label: t('leavePolicies.table.policyName'),
            sortable: true,
            className: 'font-medium text-foreground',
        },
        {
            key: 'leaveType',
            label: t('leavePolicies.table.leaveType'),
        },
        {
            key: 'maxDaysPerYear',
            label: t('leavePolicies.table.maxDays'),
        },
        {
            key: 'accrualMethod',
            label: t('leavePolicies.table.accrualMethod'),
        },
        {
            key: 'carryForward',
            label: t('leavePolicies.table.carryForward'),
        },
        {
            key: 'approval',
            label: t('leavePolicies.table.approval'),
            render: (item) => <span className="text-sm text-foreground">{item.approval}</span>,
        },
        {
            key: 'status',
            label: t('leavePolicies.table.status'),
            render: (item) => renderStatusBadge(item.status),
        },
    ];

    const renderRowActions = (item: LeavePolicy) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem className="cursor-pointer">
                    {t('leavePolicies.actions.view')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    {t('leavePolicies.actions.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    {t('leavePolicies.actions.changeStatus')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => handleDeleteClick(item)}
                >
                    {t('leavePolicies.actions.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const filterButton = (
        <Button
            variant="outline"
            className={cn('h-10 gap-2 border-input', showFilters && 'bg-muted')}
            onClick={() => setShowFilters((v) => !v)}
        >
            <ListFilter className="h-4 w-4" />
            <span>{t('attendance.filter')}</span>
        </Button>
    );

    return (
        <div className="space-y-4">
            <UniversalDataTable
                data={filteredData}
                columns={columns}
                isLoading={isLoading}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder={t('leaveRequests.filter.search')}
                renderCustomFilter={filterButton}
                showImport={false}
                showExport={false}
                currentPage={currentPage}
                totalPages={1}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                totalItems={filteredData.length}
                renderRowActions={renderRowActions}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('leavePolicies.deleteConfirmTitle')}
                message={t('leavePolicies.deleteConfirmMessage', {
                    name: policyToDelete?.policyName || '',
                })}
                onConfirm={handleConfirmDelete}
                confirmLabel={t('leavePolicies.actions.delete')}
                cancelLabel={t('attendance.cancel')}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default LeavePoliciesTable;
