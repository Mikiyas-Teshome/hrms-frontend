'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Pencil, RefreshCw, Trash2, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { AttendanceFilterPanel } from './AttendanceFilterPanel';
import { PaginatedAttendanceRecordsFilterInput, AttendanceRecord } from '@/features/attendance/attendance.types';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { usePaginatedAttendanceRecords, useUpdateOvertimeStatus } from '@/features/attendance/hooks/useAttendance';
import { format } from 'date-fns';
import { formatDateString, formatMinutesToHr } from '@/lib/date-utils';
import { exportReport } from '@/lib/export-utils';
import { fetchAllPaginatedAttendance } from '@/lib/fetch-all-paginated-attendance';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OVERTIME_STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'PAID'] as const;

const statusVariants: Record<string, string> = {
    APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    REJECTED: 'bg-rose-50 text-rose-600 border-rose-100',
    PAID: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    PENDING: 'bg-gray-50 text-gray-500 border-gray-200 border-dashed',
};

interface OvertimeTableProps {
    dateRange?: { from: Date; to: Date };
}

const OvertimeTable = ({ dateRange }: OvertimeTableProps) => {
    const { t, i18n } = useTranslation('dashboard');
    const dateLocale = i18n.language === 'ar' ? 'ar-SA' : i18n.language;
    const { toast } = useToast();
    const { hasPermission, hasScope } = usePermissions();
    const isOwnScopeOnly =
        hasScope('overtime', 'read', 'own') &&
        !hasScope('overtime', 'read', 'department') &&
        !hasScope('overtime', 'read', 'company') &&
        !hasScope('overtime', 'read', 'all');
    const canExport = hasPermission('overtime:export');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<PaginatedAttendanceRecordsFilterInput>({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [recordToChangeStatus, setRecordToChangeStatus] = useState<AttendanceRecord | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [isExporting, setIsExporting] = useState(false);

    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOvertimeStatus();

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

    const getOvertimeStatusLabel = useCallback(
        (status: string) => t(`attendance.overtimeStatusLabels.${status}`, status),
        [t],
    );

    const getShiftTypeLabel = useCallback(
        (shiftType?: string | null) => {
            if (!shiftType) return '-';
            return t(`attendance.shiftTypes.${shiftType}`, shiftType);
        },
        [t],
    );

    const unknownEmployeeLabel = t('attendance.unknownEmployee', 'Unknown');

    const dateRangeFromISO = dateRange?.from?.toISOString();
    const dateRangeToISO = dateRange?.to?.toISOString();

    const dateRangeKey = `${dateRangeFromISO ?? ''}_${dateRangeToISO ?? ''}`;
    const [lastDateRangeKey, setLastDateRangeKey] = useState(dateRangeKey);
    if (lastDateRangeKey !== dateRangeKey) {
        setLastDateRangeKey(dateRangeKey);
        setPage(1);
    }

    const activeCount =
        Object.values(activeFilters).filter((v) => v !== undefined && v !== 'all').length +
        (searchQuery.trim() ? 1 : 0);

    const overtimeFilters: PaginatedAttendanceRecordsFilterInput = {
        ...activeFilters,
        hasOvertime: true,
        startDate: dateRange?.from ? dateRange.from : undefined,
        endDate: dateRange?.to ? dateRange.to : undefined,
    };

    const { data: recordsData, isLoading } = usePaginatedAttendanceRecords(page, limit, overtimeFilters);

    const records = recordsData?.data || [];
    const metaData = recordsData?.metaData || {
        page: 1,
        size: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
    };

    const handleDeleteClick = (record: AttendanceRecord) => {
        setRecordToDelete(record);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (recordToDelete) {
            setRecordToDelete(null);
        }
    };

    const handleApply = (filters: PaginatedAttendanceRecordsFilterInput) => {
        setActiveFilters({
            ...filters,
            search: searchQuery.trim() || undefined,
        });
        setPage(1);
    };

    const handleReset = () => {
        setSearchQuery('');
        setActiveFilters({});
        setPage(1);
    };

    const handleExportClick = async () => {
        setIsExporting(true);
        try {
            const allRecords = await fetchAllPaginatedAttendance(overtimeFilters);
            const fromLabel = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : 'all';
            const toLabel = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : 'all';

            await exportReport({
                filename: `Overtime_${fromLabel}_${toLabel}`,
                columns: [
                    {
                        header: t('attendance.employee', 'Employee'),
                        key: 'employeeName',
                        render: (item: AttendanceRecord) => item.employeeName || unknownEmployeeLabel,
                    },
                    {
                        header: t('attendance.date', 'Date'),
                        key: 'date',
                        render: (item: AttendanceRecord) => formatDateString(item.date, dateLocale),
                    },
                    {
                        header: t('attendance.overtimeHours', 'Hours'),
                        key: 'overtimeMinutes',
                        render: (item: AttendanceRecord) => formatDuration(item.overtimeMinutes),
                    },
                    {
                        header: t('attendance.shiftType', 'Type'),
                        key: 'shiftType',
                        render: (item: AttendanceRecord) => getShiftTypeLabel(item.shiftType),
                    },
                    {
                        header: t('attendance.status', 'Status'),
                        key: 'overtimeStatus',
                        render: (item: AttendanceRecord) =>
                            getOvertimeStatusLabel(item.overtimeStatus || 'PENDING'),
                    },
                ],
                data: allRecords,
                format: 'csv',
            });

            toast({
                title: t('attendance.exportSuccess', 'Export complete'),
                description: t('attendance.exportOvertimeSuccessDesc', {
                    count: allRecords.length,
                    defaultValue: `Exported ${allRecords.length} overtime records.`,
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

    const handleChangeStatusClick = (record: AttendanceRecord) => {
        setRecordToChangeStatus(record);
        setNewStatus(record.overtimeStatus || 'PENDING');
        setIsStatusModalOpen(true);
    };

    const handleConfirmStatusChange = () => {
        if (recordToChangeStatus && newStatus) {
            updateStatus({ recordId: recordToChangeStatus.id, status: newStatus }, {
                onSuccess: () => {
                    setIsStatusModalOpen(false);
                    setRecordToChangeStatus(null);
                }
            });
        }
    };

    const filterButton = (
        <Button
            variant="outline"
            size="default"
            className={cn('h-10 gap-2 border-input', showFilters && 'bg-muted')}
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

    const filterPanel = showFilters ? (
        <AttendanceFilterPanel
            onApply={handleApply}
            onReset={handleReset}
            initialFilters={activeFilters}
            variant="overtime"
            className="mb-4"
        />
    ) : undefined;

    const renderRowActions = (item: AttendanceRecord) => {
        const canApprove = hasPermission('overtime:approve');
        const canCreate = hasPermission('overtime:create');

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
                        <Eye className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.actions.view', 'View')}</span>
                    </DropdownMenuItem>
                    {canApprove && (
                        <>
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('Edit', item.id)}>
                                <Pencil className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.actions.edit', 'Edit')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => handleChangeStatusClick(item)}>
                                <RefreshCw className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.actions.changeStatus', 'Change status')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="gap-3 cursor-pointer py-2.5 text-destructive focus:text-destructive"
                                onClick={() => handleDeleteClick(item)}
                            >
                                <Trash2 className="h-4 w-4" /><span>{t('attendance.actions.delete', 'Delete')}</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const columns: ColumnConfig<AttendanceRecord>[] = useMemo(() => [
        {
            key: 'employeeName',
            label: t('attendance.employee', 'Employee'),
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                        {item.employeeName?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium">{item.employeeName || unknownEmployeeLabel}</span>
                </div>
            ),
        },
        {
            key: 'date',
            label: t('attendance.date', 'Date'),
            render: (item) => formatDateString(item.date, dateLocale),
        },
        {
            key: 'overtimeMinutes',
            label: t('attendance.overtimeHours', 'Hours'),
            render: (item) => formatDuration(item.overtimeMinutes),
        },
        {
            key: 'shiftType',
            label: t('attendance.shiftType', 'Type'),
            render: (item) => getShiftTypeLabel(item.shiftType),
        },
        {
            key: 'status',
            label: t('attendance.status', 'Status'),
            render: (item) => {
                const status = item.overtimeStatus || 'PENDING';
                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            'rounded-full font-medium px-2.5 py-0.5 whitespace-nowrap',
                            statusVariants[status] || statusVariants['PENDING']
                        )}
                    >
                        <div className="size-1.5 rounded-full me-1.5 bg-current" />
                        {getOvertimeStatusLabel(status)}
                    </Badge>
                );
            },
        },
    ], [t, dateLocale, formatDuration, getOvertimeStatusLabel, getShiftTypeLabel, unknownEmployeeLabel]);

    return (
        <div className="flex flex-col gap-4">
            <UniversalDataTable
                data={records}
                columns={isOwnScopeOnly ? columns.filter((c) => c.key !== 'employeeName') : columns}
                enableSelection
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                showSearch={!isOwnScopeOnly}
                searchValue={searchQuery}
                onSearchChange={(value) => {
                    setSearchQuery(value);
                    setActiveFilters((prev) => ({
                        ...prev,
                        search: value.trim() || undefined,
                    }));
                    setPage(1);
                }}
                searchPlaceholder={t('attendance.searchPlaceholder')}
                renderCustomFilter={isOwnScopeOnly ? undefined : filterButton}
                renderFilterPanel={isOwnScopeOnly ? undefined : filterPanel}
                showExport={canExport}
                onExport={canExport ? handleExportClick : undefined}
                exportText={isExporting ? t('attendance.exporting', 'Exporting...') : t('attendance.exportBtn', 'Export')}
                currentPage={metaData.page}
                totalPages={metaData.totalPages}
                pageSize={metaData.size}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                    setLimit(newSize);
                    setPage(1);
                }}
                renderRowActions={renderRowActions}
                isLoading={isLoading}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('attendance.deleteOvertimeTitle', 'Delete Overtime Record')}
                message={t('attendance.deleteOvertimeMessage', {
                    name: recordToDelete?.employeeName || unknownEmployeeLabel,
                })}
                onConfirm={handleConfirmDelete}
                confirmLabel={t('attendance.delete', 'Delete')}
                cancelLabel={t('attendance.cancel', 'Cancel')}
                variant="danger"
            />

            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent className="sm:max-w-106.25">
                    <DialogHeader>
                        <DialogTitle>{t('attendance.changeOvertimeStatusTitle', 'Change overtime status')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('attendance.selectStatus', 'Select a status')} />
                            </SelectTrigger>
                            <SelectContent>
                                {OVERTIME_STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {getOvertimeStatusLabel(status)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                            {t('attendance.cancel', 'Cancel')}
                        </Button>
                        <Button onClick={handleConfirmStatusChange} disabled={isUpdatingStatus}>
                            {isUpdatingStatus
                                ? t('attendance.saving', 'Saving...')
                                : t('attendance.saveChanges', 'Save changes')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OvertimeTable;
