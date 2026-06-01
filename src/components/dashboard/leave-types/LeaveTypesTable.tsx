'use client';
import { LeaveType } from '@/types/leave-types';
import React, { useState } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2, ListFilter, Eye, RefreshCw, CircleDollarSign, CircleX, CircleCheck } from 'lucide-react';
import { mockLeaveTypesData } from '@/data/leave-types';
import { useTranslation } from 'react-i18next';
import { useLeaveTypes, useDeleteLeaveType } from '@/features/leave-type/hooks/useLeaveType';
import { LeaveTypeResponse } from '@/features/leave-type/leave-type.types';
import { cn } from '@/lib/utils';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import EditLeaveTypeSheet from './EditLeaveTypeSheet';

const renderConditionBadge = (condition: 'Paid' | 'Unpaid', label: string) => {
    const isPaid = condition === 'Paid';
    const Icon = isPaid ? CircleDollarSign : CircleX;
    // Paid: #22C55E (text-green-500)
    // Unpaid: #EF4444 (text-red-500) // matched exactly to CSS dump logic
    const colorClass = isPaid ? 'text-[#22C55E]' : 'text-red-500';

    return (
        <div className="flex items-center justify-center gap-1.5 px-2 py-0.5 w-fit bg-background border border-border rounded-lg">
            <Icon className={`w-3 h-3 ${colorClass}`} strokeWidth={1.25} />
            <span className="text-xs font-semibold text-[#0A0A0A]">{label}</span>
        </div>
    );
};

const renderStatusBadge = (status: 'Active' | 'Inactive', label: string) => {
    const isActive = status === 'Active';
    const Icon = isActive ? CircleCheck : CircleX;
    const colorClass = isActive ? 'text-[#22C55E]' : 'text-red-500';

    return (
        <div className="flex items-center justify-center gap-1.5 px-2 py-0.5 w-fit bg-background border border-border rounded-lg">
            <Icon className={`w-3 h-3 ${colorClass}`} strokeWidth={1.25} />
            <span className="text-xs font-semibold text-[#0A0A0A]">{label}</span>
        </div>
    );
};

interface LeaveTypesTableProps {
    companyId?: string;
}

const LeaveTypesTable = ({ companyId }: LeaveTypesTableProps) => {
    const { t } = useTranslation('dashboard');
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ condition: 'all', status: 'all' });
    const [pendingFilters, setPendingFilters] = useState({ condition: 'all', status: 'all' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leaveTypeToDelete, setLeaveTypeToDelete] = useState<LeaveType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [leaveTypeToEdit, setLeaveTypeToEdit] = useState<LeaveType | null>(null);

    const { mutateAsync: deleteLeaveType } = useDeleteLeaveType();
    const activeCount = Object.values(activeFilters).filter((v) => v !== 'all').length;

    const handleDeleteClick = (leaveType: LeaveType) => {
        setLeaveTypeToDelete(leaveType);
        setIsDeleteModalOpen(true);
    };

    const handleEditClick = (leaveType: LeaveType) => {
        setLeaveTypeToEdit(leaveType);
        setIsEditSheetOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!leaveTypeToDelete?.id) return;
        setIsDeleting(true);
        try {
            await deleteLeaveType(leaveTypeToDelete.id);
            setIsDeleteModalOpen(false);
            setLeaveTypeToDelete(null);
            toast({
                title: t('leaveTypes.deleteSuccess'),
                description: t('leaveTypes.deleteSuccessDesc'),
                variant: 'success',
            });
        } catch (error: any) {
            console.error('Failed to delete leave type:', error);
            toast({
                title: t('leaveTypes.deleteError'),
                description: error?.message || t('leaveTypes.deleteErrorDesc'),
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApply = () => {
        setActiveFilters(pendingFilters);
        setShowFilters(false);
    };

    const handleReset = () => {
        const defaultFilters = { condition: 'all', status: 'all' };
        setPendingFilters(defaultFilters);
        setActiveFilters(defaultFilters);
    };

    const { data: apiData, isLoading, isError } = useLeaveTypes(companyId);
    
    const mappedApiData: LeaveType[] = (apiData || []).map((type: LeaveTypeResponse) => ({
        id: type.id,
        name: type.name,
        code: type.code,
        maxDaysPerYear: type.maxDaysPerYear,
        condition: type.paid ? 'Paid' : 'Unpaid',
        status: 'Active', // Placeholder as it is missing from response
        carryForwardAllowed: type.carryForwardAllowed,
        companyOuId: type.companyOuId,
    }));

    const displayData = isLoading ? [] : (isError ? mockLeaveTypesData : mappedApiData);

    // Filter local data
    const filteredData = displayData.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchValue.toLowerCase());
        const matchCondition = activeFilters.condition === 'all' || item.condition === activeFilters.condition;
        const matchStatus = activeFilters.status === 'all' || item.status === activeFilters.status;
        return matchSearch && matchCondition && matchStatus;
    });

    const filterButton = (
        <Button
            variant="outline"
            size="default"
            className={cn('h-10 gap-2 border-input', showFilters && 'bg-muted')}
            onClick={() => setShowFilters((v) => !v)}
        >
            <ListFilter className="h-4 w-4" />
            <span>{t('attendance.filter')}</span>
            {activeCount > 0 && (
                <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white font-semibold">
                    {activeCount}
                </span>
            )}
        </Button>
    );

    const filterPanel = showFilters ? (
        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-border flex flex-col lg:flex-row lg:items-end gap-4 overflow-hidden">
            <div className="flex-1 space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">{t('leaveTypes.filter.condition', 'Condition')}</label>
                <Select value={pendingFilters.condition} onValueChange={(v) => setPendingFilters((p) => ({ ...p, condition: v }))}>
                    <SelectTrigger className="h-10 bg-background rounded-lg">
                        <SelectValue placeholder={t('leaveTypes.filter.allConditions')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('leaveTypes.filter.allConditions')}</SelectItem>
                        <SelectItem value="Paid">{t('leaveTypes.condition.paid')}</SelectItem>
                        <SelectItem value="Unpaid">{t('leaveTypes.condition.unpaid')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex-1 space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">{t('leaveTypes.filter.status', 'Status')}</label>
                <Select value={pendingFilters.status} onValueChange={(v) => setPendingFilters((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="h-10 bg-background rounded-lg">
                        <SelectValue placeholder={t('leaveTypes.filter.allStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('leaveTypes.filter.allStatus')}</SelectItem>
                        <SelectItem value="Active">{t('leaveTypes.status.active')}</SelectItem>
                        <SelectItem value="Inactive">{t('leaveTypes.status.inactive')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                <Button
                    onClick={handleApply}
                    className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/80 text-white font-medium shadow-sm transition-colors"
                >
                    {t('leaveTypes.filter.apply')}
                </Button>
                <Button
                    onClick={handleReset}
                    variant="outline"
                    className="h-10 px-6 rounded-lg bg-background border-border hover:bg-muted font-medium shadow-sm transition-colors"
                >
                    {t('leaveTypes.filter.reset')}
                </Button>
            </div>
        </div>
    ) : undefined;

    const columns: ColumnConfig<LeaveType>[] = [
        {
            key: 'name',
            label: t('leaveTypes.table.name'),
            sortable: true,
            className: 'font-medium',
        },
        {
            key: 'maxDaysPerYear',
            label: t('leaveTypes.table.maxDays'),
            sortable: true,
        },
        {
            key: 'condition',
            label: t('leaveTypes.table.condition'),
            render: (item) => renderConditionBadge(item.condition, item.condition === 'Paid' ? t('leaveTypes.condition.paid') : t('leaveTypes.condition.unpaid'))
        },
        {
            key: 'status',
            label: t('leaveTypes.table.status'),
            render: (item) => renderStatusBadge(item.status, item.status === 'Active' ? t('leaveTypes.status.active') : t('leaveTypes.status.inactive'))
        },
    ];

    const handleRowClick = () => {
    };

    const renderRowActions = (item: LeaveType) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log('View', item.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {t('leaveTypes.actions.view')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditClick(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('leaveTypes.actions.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Change status', item.id)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('leaveTypes.actions.changeStatus')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(item)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('leaveTypes.actions.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
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
                searchPlaceholder={t('leaveTypes.filter.search')}
                renderCustomFilter={filterButton}
                renderFilterPanel={filterPanel}
                showImport={false}
                showExport={false}
                currentPage={currentPage}
                totalPages={1}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                totalItems={filteredData.length}
                renderRowActions={renderRowActions}
                onRowClick={handleRowClick}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('leaveTypes.deleteConfirmTitle')}
                message={t('leaveTypes.deleteConfirmMessage', { name: leaveTypeToDelete?.name || '' })}
                onConfirm={handleConfirmDelete}
                confirmLabel={t('leaveTypes.actions.delete')}
                cancelLabel={t('leaveTypes.cancel')}
                isLoading={isDeleting}
                variant="danger"
            />
            
            <EditLeaveTypeSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                initialData={leaveTypeToEdit}
            />
        </div>
    );
};

export default LeaveTypesTable;
