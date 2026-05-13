'use client';

import React, { useState } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Badge } from '@/components/ui/badge';
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
import { MoreVertical, Eye, Pencil, RefreshCw, Trash2, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { overtimeData, OvertimeRecord } from '@/data/attendance';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { AttendanceFilterPanel } from './AttendanceFilterPanel';
import { PaginatedAttendanceRecordsFilterInput } from '@/features/attendance/attendance.types';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const statusVariants: Record<string, string> = {
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    Paid: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    Pending: 'bg-gray-50 text-gray-500 border-gray-200 border-dashed',
};

const OvertimeTable = () => {
    const { t } = useTranslation('dashboard');
    const { hasPermission } = usePermissions();
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<PaginatedAttendanceRecordsFilterInput>({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<OvertimeRecord | null>(null);
    const activeCount = Object.values(activeFilters).filter((v) => v !== undefined && v !== 'all').length;

    const handleDeleteClick = (record: OvertimeRecord) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (recordToDelete) {
            setRecordToDelete(null);
        }
    };

    const handleApply = (filters: PaginatedAttendanceRecordsFilterInput) => {
        setActiveFilters(filters);
    };

    const handleReset = () => {
        setActiveFilters({});
    };

    const filterButton = (
        <Button
            variant="outline"
            size="default"
            className={cn('h-10 gap-2 border-input', showFilters && 'bg-muted')}
            onClick={() => setShowFilters((v) => !v)}
        >
            <ListFilter className="h-4 w-4" />
            <span>Filter</span>
            {activeCount > 0 && (
                <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white font-semibold">
                    {activeCount}
                </span>
            )}
        </Button>
    );

    const filterPanel = showFilters ? (
        <AttendanceFilterPanel
            onApply={handleApply}
            onReset={handleReset}
            initialFilters={activeFilters}
            className="mb-4"
        />
    ) : undefined;

    const renderRowActions = (item: OvertimeRecord) => {
        const canApprove = hasPermission('overtime:approve');
        const canCreate = hasPermission('overtime:create');

        // Show actions if user can approve (manage) or is the one who created it (simplified check for now)
        if (!canApprove && !canCreate) return null;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg">
                    <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('View', item.id)}>
                        <Eye className="h-4 w-4 text-muted-foreground" /><span>View</span>
                    </DropdownMenuItem>
                    {canApprove && (
                        <>
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('Edit', item.id)}>
                                <Pencil className="h-4 w-4 text-muted-foreground" /><span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('Change status', item.id)}>
                                <RefreshCw className="h-4 w-4 text-muted-foreground" /><span>Change status</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="gap-3 cursor-pointer py-2.5 text-destructive focus:text-destructive"
                                onClick={() => handleDeleteClick(item)}
                            >
                                <Trash2 className="h-4 w-4" /><span>Delete</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const columns: ColumnConfig<OvertimeRecord>[] = [
        {
            key: 'employee',
            label: 'Employee',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                        {item.employee.charAt(0)}
                    </div>
                    <span className="font-medium">{item.employee}</span>
                </div>
            ),
        },
        { key: 'date', label: 'Date' },
        { key: 'hours', label: 'Hours' },
        { key: 'type', label: 'Type' },
        { key: 'reason', label: 'Reason' },
        { key: 'manager', label: 'Manager' },
        {
            key: 'status',
            label: 'Status',
            render: (item) => (
                <Badge
                    variant="outline"
                    className={cn(
                        'rounded-full font-medium px-2.5 py-0.5 whitespace-nowrap',
                        statusVariants[item.status]
                    )}
                >
                    <div className="size-1.5 rounded-full mr-1.5 bg-current" />
                    {item.status}
                </Badge>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <UniversalDataTable
                data={overtimeData}
                columns={columns}
                enableSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                showSearch
                searchPlaceholder="Search for employees"
                renderCustomFilter={filterButton}
                renderFilterPanel={filterPanel}
                showImport={hasPermission('overtime:create')}
                showExport={hasPermission('overtime:read')}
                importText={t('attendance.importBtn', 'Import')}
                exportText={t('attendance.exportBtn', 'Export')}
                currentPage={1}
                totalPages={7}
                pageSize={10}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                renderRowActions={renderRowActions}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('attendance.deleteOvertimeTitle', 'Delete Overtime Record')}
                message={t('attendance.deleteOvertimeMessage', { name: recordToDelete?.employee || '' })}
                onConfirm={handleConfirmDelete}
                confirmLabel={t('attendance.delete', 'Delete')}
                cancelLabel={t('attendance.cancel', 'Cancel')}
                variant="danger"
            />
        </div>
    );
};

export default OvertimeTable;
