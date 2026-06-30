'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Pencil, RefreshCw, ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { usePaginatedAttendanceRecords } from '@/features/attendance/hooks/useAttendance';
import { AttendanceFilterPanel } from './AttendanceFilterPanel';
import { AttendanceStatus, type AttendanceRecord, type PaginatedAttendanceRecordsFilterInput } from '@/features/attendance/attendance.types';
import { formatMinutesToHr, formatDateString, formatClockTime } from '@/lib/date-utils';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

import EditAttendanceModal from './EditAttendanceModal';
import ChangeStatusModal from './ChangeStatusModal';
import ImportAttendanceModal from './ImportAttendanceModal';
import { exportReport } from '@/lib/export-utils';
import { fetchAllPaginatedAttendance } from '@/lib/fetch-all-paginated-attendance';
import { format } from 'date-fns';

const statusVariants: Record<string, string> = {
    [AttendanceStatus.PRESENT]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [AttendanceStatus.ABSENT]: 'bg-rose-50 text-rose-600 border-rose-100',
    [AttendanceStatus.ON_LEAVE]: 'bg-amber-50 text-amber-600 border-amber-100',
    [AttendanceStatus.ACTIVE]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [AttendanceStatus.LATE]: 'bg-orange-50 text-orange-600 border-orange-100',
    [AttendanceStatus.HALF_DAY]: 'bg-blue-50 text-blue-600 border-blue-100',
};

const defaultFilters: PaginatedAttendanceRecordsFilterInput = {};

interface AttendanceOverviewTableProps {
    startDate?: string;
    endDate?: string;
}

const AttendanceOverviewTable = ({ startDate, endDate }: AttendanceOverviewTableProps) => {
    const { t, i18n } = useTranslation('dashboard');
    const dateLocale = i18n.language === 'ar' ? 'ar-SA' : i18n.language;
    const timeUnits = useMemo(
        () => ({
            hours: t('attendance.timeUnits.hours', 'h'),
            minutes: t('attendance.timeUnits.minutes', 'm'),
        }),
        [t],
    );
    const formatDuration = useCallback(
        (minutes: number) => formatMinutesToHr(minutes, timeUnits),
        [timeUnits],
    );
    const getStatusLabel = useCallback(
        (status: string) => t(`attendance.statusLabels.${status}`, status.replace(/_/g, ' ')),
        [t],
    );
    const { toast } = useToast();
    const { hasPermission, hasScope } = usePermissions();

    const canUpdate = hasPermission('attendance:update');
    const canImport = hasPermission('attendance:import');
    const canExport = hasPermission('attendance:export');
    const isOwnScopeOnly =
        hasScope('attendance', 'read', 'own') &&
        !hasScope('attendance', 'read', 'department') &&
        !hasScope('attendance', 'read', 'company') &&
        !hasScope('attendance', 'read', 'all');

    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<PaginatedAttendanceRecordsFilterInput>(defaultFilters);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const [prevStartDate, setPrevStartDate] = useState(startDate);
    const [prevEndDate, setPrevEndDate] = useState(endDate);

    if (startDate !== prevStartDate || endDate !== prevEndDate) {
        setPrevStartDate(startDate);
        setPrevEndDate(endDate);
        setCurrentPage(1);
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setActiveFilters(prev => ({
                ...prev,
                search: searchQuery || undefined
            }));
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate]);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState<AttendanceRecord | null>(null);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [recordToChangeStatus, setRecordToChangeStatus] = useState<AttendanceRecord | null>(null);

    const mergedFilters: PaginatedAttendanceRecordsFilterInput = {
        ...activeFilters,
        startDate: startDate || activeFilters.startDate,
        endDate: endDate || activeFilters.endDate,
    };

    const { data: recordsData, isLoading } = usePaginatedAttendanceRecords(
        currentPage,
        pageSize,
        mergedFilters,
    );

    const handleImportClick = () => {
        setIsImportModalOpen(true);
    };

    const handleExportClick = async () => {
        setIsExporting(true);
        try {
            const allRecords = await fetchAllPaginatedAttendance(mergedFilters);
            const fromLabel = startDate ? format(new Date(startDate), 'yyyy-MM-dd') : 'all';
            const toLabel = endDate ? format(new Date(endDate), 'yyyy-MM-dd') : 'all';

            await exportReport({
                filename: `Attendance_Overview_${fromLabel}_${toLabel}`,
                columns: [
                    {
                        header: t('attendance.employee', 'Employee'),
                        key: 'employeeName',
                        render: (item: AttendanceRecord) => item.employeeName ?? '',
                    },
                    {
                        header: t('attendance.date', 'Date'),
                        key: 'date',
                        render: (item: AttendanceRecord) => formatDateString(item.date, dateLocale),
                    },
                    {
                        header: t('attendance.clockIn', 'Clock in'),
                        key: 'clockIn',
                        render: (item: AttendanceRecord) => formatClockTime(item.clockIn, dateLocale),
                    },
                    {
                        header: t('attendance.clockOut', 'Clock out'),
                        key: 'clockOut',
                        render: (item: AttendanceRecord) => formatClockTime(item.clockOut, dateLocale),
                    },
                    {
                        header: t('attendance.totalTime', 'Total time'),
                        key: 'totalMinutes',
                        render: (item: AttendanceRecord) => formatDuration(item.totalMinutes),
                    },
                    {
                        header: t('attendance.overtime', 'Overtime'),
                        key: 'overtimeMinutes',
                        render: (item: AttendanceRecord) => formatDuration(item.overtimeMinutes),
                    },
                    {
                        header: t('attendance.status', 'Status'),
                        key: 'status',
                        render: (item: AttendanceRecord) => getStatusLabel(item.status),
                    },
                ],
                data: allRecords,
                format: 'csv',
            });

            toast({
                title: t('attendance.exportSuccess', 'Export complete'),
                description: t('attendance.exportSuccessDesc', {
                    count: allRecords.length,
                }),
                variant: 'success',
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Export failed.';
            toast({
                title: t('attendance.exportError', 'Export failed'),
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleEditClick = (record: AttendanceRecord) => {
        setRecordToEdit(record);
        setIsEditModalOpen(true);
    };

    const handleStatusClick = (record: AttendanceRecord) => {
        setRecordToChangeStatus(record);
        setIsStatusModalOpen(true);
    };

    const activeCount =
        Object.values(activeFilters).filter((v) => v !== undefined && v !== 'all').length +
        (searchQuery.trim() ? 1 : 0);

    const handleApply = (filters: PaginatedAttendanceRecordsFilterInput) => {
        setActiveFilters({
            ...filters,
            search: searchQuery.trim() || undefined,
        });
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSearchQuery('');
        setActiveFilters(defaultFilters);
        setCurrentPage(1);
    };

    const renderRowActions = (item: AttendanceRecord) => {
        if (!canUpdate) return null;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg">
                    <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('View', item.id)}>
                        <Eye className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.actions.view', 'View')}</span>
                    </DropdownMenuItem>
                    {canUpdate && (
                        <>
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => handleEditClick(item)}>
                                <Pencil className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.actions.edit', 'Edit')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => handleStatusClick(item)}>
                                <RefreshCw className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.actions.changeStatus', 'Change status')}</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

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
            <span>{t('attendance.filter', 'Filter')}</span>
            {activeCount > 0 && (
                <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white font-semibold">
                    {activeCount}
                </span>
            )}
        </Button>
    );

    const columns: ColumnConfig<AttendanceRecord>[] = useMemo(() => [
        {
            key: 'userId',
            label: t('attendance.employee', 'Employee'),
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
            label: t('attendance.date', 'Date'),
            render: (item) => formatDateString(item.date, dateLocale),
        },
        { 
            key: 'clockIn', 
            label: t('attendance.clockIn', 'Clock in'),
            render: (item) => formatClockTime(item.clockIn, dateLocale),
        },
        { 
            key: 'clockOut', 
            label: t('attendance.clockOut', 'Clock out'),
            render: (item) => formatClockTime(item.clockOut, dateLocale),
        },
        { 
            key: 'totalMinutes', 
            label: t('attendance.totalTime', 'Total time'),
            render: (item) => formatDuration(item.totalMinutes),
        },
        { 
            key: 'overtimeMinutes', 
            label: t('attendance.overtime', 'Overtime'),
            render: (item) => formatDuration(item.overtimeMinutes),
        },
        {
            key: 'status',
            label: t('attendance.status', 'Status'),
            render: (item) => (
                <Badge
                    variant="outline"
                    className={cn(
                        'rounded-full font-medium px-2.5 py-0.5 whitespace-nowrap',
                        statusVariants[item.status] || 'bg-muted text-muted-foreground border-border'
                    )}
                >
                    <div className="size-1.5 rounded-full mr-1.5 bg-current" />
                    {getStatusLabel(item.status)}
                </Badge>
            ),
        },
    ], [t, dateLocale, formatDuration, getStatusLabel]);

    return (
        <div className="flex flex-col gap-4">
            <UniversalDataTable
                data={recordsData?.data || []}
                columns={isOwnScopeOnly ? columns.filter((c) => c.key !== 'userId') : columns}
                isLoading={isLoading}
                enableSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                showSearch={!isOwnScopeOnly}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder={t('attendance.searchPlaceholder')}
                renderCustomFilter={isOwnScopeOnly ? undefined : filterButton}
                showImport={canImport}
                showExport={canExport}
                onImport={canImport ? handleImportClick : undefined}
                onExport={canExport ? handleExportClick : undefined}
                importText={t('attendance.importBtn', 'Import')}
                exportText={isExporting ? t('attendance.exporting', 'Exporting...') : t('attendance.exportBtn', 'Export')}
                renderFilterPanel={isOwnScopeOnly ? undefined : filterPanel}
                currentPage={currentPage}
                totalPages={recordsData?.metaData.totalPages || 0}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                renderRowActions={isOwnScopeOnly ? undefined : renderRowActions}
            />

            <ImportAttendanceModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                startDate={startDate}
                endDate={endDate}
            />

            <EditAttendanceModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                record={recordToEdit}
            />

            <ChangeStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                record={recordToChangeStatus}
            />
        </div>
    );
};

export default AttendanceOverviewTable;
