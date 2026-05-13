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
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Pencil, RefreshCw, Trash2, ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { usePaginatedAttendanceRecords } from '@/features/attendance/hooks/useAttendance';
import { AttendanceFilterPanel } from './AttendanceFilterPanel';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';

const statusVariants: Record<string, string> = {
    [AttendanceStatus.PRESENT]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [AttendanceStatus.ABSENT]: 'bg-rose-50 text-rose-600 border-rose-100',
    [AttendanceStatus.ON_LEAVE]: 'bg-amber-50 text-amber-600 border-amber-100',
    [AttendanceStatus.ACTIVE]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [AttendanceStatus.LATE]: 'bg-orange-50 text-orange-600 border-orange-100',
    [AttendanceStatus.HALF_DAY]: 'bg-blue-50 text-blue-600 border-blue-100',
};

import { AttendanceStatus, type AttendanceRecord, type PaginatedAttendanceRecordsFilterInput } from '@/features/attendance/attendance.types';
import { formatMinutesToHr, formatDateString, formatClockTime } from '@/lib/date-utils';

const defaultFilters: PaginatedAttendanceRecordsFilterInput = {
};

const AttendanceOverviewTable = () => {
    const { t } = useTranslation('dashboard');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<PaginatedAttendanceRecordsFilterInput>(defaultFilters);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
    const { data: recordsData, isLoading, error } = usePaginatedAttendanceRecords(
        pageSize,
        currentPage,
        activeFilters
    );

    const handleDeleteClick = (record: AttendanceRecord) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (recordToDelete) {
            setRecordToDelete(null);
        }
    };

    const activeCount = Object.values(activeFilters).filter((v) => v !== undefined && v !== 'all').length;

    const handleApply = (filters: PaginatedAttendanceRecordsFilterInput) => {
        setActiveFilters(filters);
    };

    const handleReset = () => {
        setActiveFilters(defaultFilters);
    };

    const renderRowActions = (item: AttendanceRecord) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg">
                <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('View', item.id)}>
                    <Eye className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.view', 'View')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('Edit', item.id)}>
                    <Pencil className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.edit', 'Edit')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('Change status', item.id)}>
                    <RefreshCw className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.changeStatus', 'Change status')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="gap-3 cursor-pointer py-2.5 text-destructive focus:text-destructive"
                    onClick={() => handleDeleteClick(item)}
                >
                    <Trash2 className="h-4 w-4" /><span>{t('attendance.delete', 'Delete')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const filterPanel = showFilters ? (
        <AttendanceFilterPanel
            onApply={handleApply}
            onReset={handleReset}
            initialFilters={activeFilters}
            className="mb-4"
        />
    ) : undefined;

    const filterButton = (
        <Button
            variant="outline"
            size="default"
            className={cn('h-10 gap-2 border-input', showFilters && 'bg-black/5 dark:bg-white/5')}
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

    const columns: ColumnConfig<AttendanceRecord>[] = [
        {
            key: 'userId',
            label: 'Employee',
            render: (item) => {
                const displayName = item.employeeName ?? '';
                const initial = displayName.charAt(0).toUpperCase();
                
                return (
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold uppercase shrink-0 border border-brand-100">
                            {initial}
                        </div>
                        <span className="font-medium">{displayName}</span>
                    </div>
                );
            },
        },
        { 
            key: 'date', 
            label: 'Date',
            render: (item) => formatDateString(item.date)
        },
        { 
            key: 'clockIn', 
            label: 'Clock in',
            render: (item) => formatClockTime(item.clockIn)
        },
        { 
            key: 'clockOut', 
            label: 'Clock out',
            render: (item) => formatClockTime(item.clockOut)
        },
        { 
            key: 'totalMinutes', 
            label: 'Total time',
            render: (item) => formatMinutesToHr(item.totalMinutes)
        },
        { 
            key: 'overtimeMinutes', 
            label: 'Overtime',
            render: (item) => formatMinutesToHr(item.overtimeMinutes)
        },
        {
            key: 'status',
            label: 'Status',
            render: (item) => (
                <Badge
                    variant="outline"
                    className={cn(
                        'rounded-full font-medium px-2.5 py-0.5 whitespace-nowrap',
                        statusVariants[item.status] || 'bg-muted text-muted-foreground border-border'
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
                data={recordsData?.data || []}
                columns={columns}
                isLoading={isLoading}
                enableSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                showSearch
                searchPlaceholder={t('attendance.searchPlaceholder')}
                renderCustomFilter={filterButton}
                showImport
                showExport
                importText={t('attendance.importBtn', 'Import')}
                exportText={t('attendance.exportBtn', 'Export')}
                renderFilterPanel={filterPanel}
                currentPage={currentPage}
                totalPages={recordsData?.pagination.totalPages || 0}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                renderRowActions={renderRowActions}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('attendance.deleteConfirmTitle', 'Delete Attendance Record')}
                message={t('attendance.deleteConfirmMessage', { 
                    name: recordToDelete?.employeeName || ''
                })}
                onConfirm={handleConfirmDelete}
                confirmLabel={t('attendance.delete', 'Delete')}
                cancelLabel={t('attendance.cancel', 'Cancel')}
                variant="danger"
            />
        </div>
    );
};

export default AttendanceOverviewTable;
