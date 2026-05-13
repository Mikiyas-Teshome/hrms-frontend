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
import {
    MoreVertical,
    Pencil,
    RefreshCw,
    Trash2,
    ListFilter,
    Clock,
    CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { useShiftTemplates } from '@/features/attendance/hooks/useAttendance';
import { ShiftTemplate } from '@/features/attendance/attendance.types';
import { formatTime, getWorkingDaysString } from '@/features/attendance/attendance.utils';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

interface ShiftsTableProps {
    companyId?: string;
}

const ShiftsTable = ({ companyId }: ShiftsTableProps) => {
    const { t } = useTranslation('dashboard');
    const { hasPermission } = usePermissions();
    const { data: shiftTemplates, isLoading } = useShiftTemplates(companyId || '');

    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [pendingFilters, setPendingFilters] = useState({ employee: 'all', location: 'all', shift: 'all', status: 'all' });
    const [activeFilters, setActiveFilters] = useState({ employee: 'all', location: 'all', shift: 'all', status: 'all' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [shiftToDelete, setShiftToDelete] = useState<ShiftTemplate | null>(null);
    const activeCount = Object.values(activeFilters).filter((v) => v !== 'all').length;

    const handleDeleteClick = (shift: ShiftTemplate) => {
        setShiftToDelete(shift);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (shiftToDelete) {
            setShiftToDelete(null);
        }
    };

    const handleApply = () => {
        setActiveFilters(pendingFilters);
        setShowFilters(false);
    };

    const handleReset = () => {
        const defaultFilters = { employee: 'all', location: 'all', shift: 'all', status: 'all' };
        setPendingFilters(defaultFilters);
        setActiveFilters(defaultFilters);
    };

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

    const filterPanel = showFilters ? (
        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-border flex flex-col lg:flex-row lg:items-end gap-4 overflow-hidden">
            <div className="flex-1 space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">{t('attendance.filterEmployee')}</label>
                <Select value={pendingFilters.employee} onValueChange={(v) => setPendingFilters((p) => ({ ...p, employee: v }))}>
                    <SelectTrigger className="h-10 bg-background rounded-lg">
                        <SelectValue placeholder={t('attendance.allEmployees')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('attendance.allEmployees')}</SelectItem>
                        <SelectItem value="Miracle Torff">Miracle Torff</SelectItem>
                        <SelectItem value="Cooper George">Cooper George</SelectItem>
                        <SelectItem value="Nolan Dias">Nolan Dias</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex-1 space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">{t('attendance.filterLocation')}</label>
                <Select value={pendingFilters.location} onValueChange={(v) => setPendingFilters((p) => ({ ...p, location: v }))}>
                    <SelectTrigger className="h-10 bg-background rounded-lg">
                        <SelectValue placeholder={t('attendance.allLocations')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('attendance.allLocations')}</SelectItem>
                        <SelectItem value="Dubai">Dubai</SelectItem>
                        <SelectItem value="Riyadh">Riyadh</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex-1 space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">{t('attendance.filterShift')}</label>
                <Select value={pendingFilters.shift} onValueChange={(v) => setPendingFilters((p) => ({ ...p, shift: v }))}>
                    <SelectTrigger className="h-10 bg-background rounded-lg">
                        <SelectValue placeholder={t('attendance.allShifts')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('attendance.allShifts')}</SelectItem>
                        <SelectItem value="Morning shift">Morning shift</SelectItem>
                        <SelectItem value="Evening shift">Evening shift</SelectItem>
                        <SelectItem value="Night shift">Night shift</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex-1 space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">{t('attendance.filterStatus')}</label>
                <Select value={pendingFilters.status} onValueChange={(v) => setPendingFilters((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="h-10 bg-background rounded-lg">
                        <SelectValue placeholder={t('attendance.all')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('attendance.all')}</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                <Button
                    onClick={handleApply}
                    className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/80 text-white font-medium shadow-sm transition-colors"
                >
                    {t('attendance.applyFilters', 'Apply filters')}
                </Button>
                <Button
                    onClick={handleReset}
                    variant="outline"
                    className="h-10 px-6 rounded-lg bg-white border-border hover:bg-muted font-medium shadow-sm transition-colors"
                >
                    {t('attendance.resetFilters', 'Reset filters')}
                </Button>
            </div>
        </div>
    ) : undefined;

    const columns: ColumnConfig<ShiftTemplate>[] = [
        { 
            key: 'name', 
            label: t('attendance.shiftName', 'Shift name'), 
            className: 'font-medium' 
        },
        { 
            key: 'startTime', 
            label: t('attendance.startTime', 'Start time'),
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>{formatTime(item.startTime)}</span>
                </div>
            )
        },
        { 
            key: 'endTime', 
            label: t('attendance.endTime', 'End time'),
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>{formatTime(item.endTime)}</span>
                </div>
            )
        },
        { 
            key: 'breakDuration', 
            label: t('attendance.breakTime', 'Break (min)'),
            render: (item) => `${item.breakDuration} min`
        },
        { 
            key: 'workingDays', 
            label: t('attendance.workingDays', 'Working Days'),
            render: (item) => (
                <div className="flex items-center gap-2">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">{getWorkingDaysString(item.workingDays)}</span>
                </div>
            )
        },
        { 
            key: 'overtimeAllowed', 
            label: t('attendance.overtime', 'Overtime'),
            render: (item) => (
                <Badge variant={item.overtimeAllowed ? 'default' : 'outline'}>
                    {item.overtimeAllowed ? t('attendance.allowed', 'Allowed') : t('attendance.notAllowed', 'Not Allowed')}
                </Badge>
            )
        },
        { 
            key: 'type', 
            label: t('attendance.shiftType', 'Shift Type'),
            render: (item) => (
                <Badge variant="outline">
                    {item.type}
                </Badge>
            )
        },
        {
            key: 'isActive',
            label: t('attendance.status', 'Status'),
            render: (item) => (
                <Badge 
                    variant="outline" 
                    className={cn(
                        "rounded-full font-medium px-2.5 py-0.5",
                        item.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}
                >
                    <div className={cn("size-1.5 rounded-full mr-1.5 bg-current", item.isActive ? "bg-emerald-600" : "bg-rose-600")} />
                    {item.isActive ? t('attendance.active', 'Active') : t('attendance.inactive', 'Inactive')}
                </Badge>
            ),
        },
    ];

    const renderRowActions = (item: ShiftTemplate) => {
        const canUpdate = hasPermission('shifts:update');
        const canDelete = hasPermission('shifts:delete');

        if (!canUpdate && !canDelete) return null;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg">
                    {canUpdate && (
                        <>
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('Edit', item.id)}>
                                <Pencil className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.edit', 'Edit')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => console.log('Change status', item.id)}>
                                <RefreshCw className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.changeStatus', 'Change status')}</span>
                            </DropdownMenuItem>
                        </>
                    )}
                    {canDelete && (
                        <DropdownMenuItem 
                            className="gap-3 cursor-pointer py-2.5 text-destructive focus:text-destructive" 
                            onClick={() => handleDeleteClick(item)}
                        >
                            <Trash2 className="h-4 w-4" /><span>{t('attendance.delete', 'Delete')}</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
    <div className="flex flex-col gap-4">
        <UniversalDataTable
          data={shiftTemplates || []}
          columns={columns}
          enableSelection
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showSearch
          isLoading={isLoading}
          searchPlaceholder={t('attendance.searchShifts', 'Search for shifts')}
          renderCustomFilter={filterButton}
          renderFilterPanel={filterPanel}
          showImport={hasPermission('shifts:create')}
          showExport={hasPermission('shifts:read')}
          importText={t('attendance.importBtn', 'Import')}
          exportText={t('attendance.exportBtn', 'Export')}
          currentPage={1}
          totalPages={1}
          pageSize={10}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          renderRowActions={renderRowActions}
        />

        <ConfirmationModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            title={t('attendance.deleteShiftTitle', 'Delete Shift')}
            message={t('attendance.deleteShiftMessage', { name: shiftToDelete?.name || '' })}
            onConfirm={handleConfirmDelete}
            confirmLabel={t('attendance.delete', 'Delete')}
            cancelLabel={t('attendance.cancel', 'Cancel')}
            variant="danger"
        />
    </div>
  );
};

export default ShiftsTable;
