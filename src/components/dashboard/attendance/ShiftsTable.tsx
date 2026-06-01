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
    MoreVertical,
    Pencil,
    RefreshCw,
    Trash2,
    Clock,
    CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { useShiftTemplates, useEmployeeShifts, useToggleShiftTemplateStatus } from '@/features/attendance/hooks/useAttendance';
import { ShiftTemplate } from '@/features/attendance/attendance.types';
import { formatTime, getWorkingDaysString } from '@/features/attendance/attendance.utils';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { ShiftSheet } from './ShiftSheet';
import { useToast } from '@/hooks/use-toast';

interface ShiftsTableProps {
    companyId?: string;
}

const ShiftsTable = ({ companyId }: ShiftsTableProps) => {
    const { t } = useTranslation('dashboard');
    const { hasPermission, hasScope } = usePermissions();
    const { user } = useAuth();
    const isOwnScopeOnly =
        hasScope('shifts', 'read', 'own') &&
        !hasScope('shifts', 'read', 'department') &&
        !hasScope('shifts', 'read', 'company') &&
        !hasScope('shifts', 'read', 'all');

    const { data: shiftTemplates, isLoading: isLoadingTemplates } = useShiftTemplates(!isOwnScopeOnly ? (companyId || '') : '');
    const { data: employeeShifts, isLoading: isLoadingEmployeeShifts } = useEmployeeShifts(isOwnScopeOnly ? (user?.id || '') : '');

    const isLoading = isOwnScopeOnly ? isLoadingEmployeeShifts : isLoadingTemplates;

    const data = (isOwnScopeOnly
        ? (employeeShifts?.map((es) => es.shiftTemplate).filter(Boolean) as ShiftTemplate[])
        : (shiftTemplates || [])) || [];

    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [shiftToDelete, setShiftToDelete] = useState<ShiftTemplate | null>(null);

    const { toast } = useToast();
    const { mutate: toggleStatus } = useToggleShiftTemplateStatus();
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const [isShiftSheetOpen, setIsShiftSheetOpen] = useState(false);
    const [shiftToEdit, setShiftToEdit] = useState<ShiftTemplate | null>(null);

    const handleEditClick = (shift: ShiftTemplate) => {
        setShiftToEdit(shift);
        setIsShiftSheetOpen(true);
    };

    const handleToggleStatus = (id: string) => {
        setTogglingId(id);
        toggleStatus(id, {
            onSuccess: () => {
                toast({
                    title: t('attendance.success', 'Success'),
                    description: t('attendance.statusUpdated', 'Shift status updated successfully'),
                    variant: 'success',
                });
            },
            onError: (error: any) => {
                toast({
                    title: t('attendance.error', 'Error'),
                    description: error.message || t('attendance.statusUpdateFailed', 'Failed to update shift status'),
                    variant: 'destructive',
                });
            },
            onSettled: () => setTogglingId(null)
        });
    };

    const handleDeleteClick = (shift: ShiftTemplate) => {
        setShiftToDelete(shift);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (shiftToDelete) {
            setShiftToDelete(null);
        }
    };

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
                            <DropdownMenuItem className="gap-3 cursor-pointer py-2.5" onClick={() => handleEditClick(item)}>
                                <Pencil className="h-4 w-4 text-muted-foreground" /><span>{t('attendance.edit', 'Edit')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="gap-3 cursor-pointer py-2.5" 
                                onClick={() => handleToggleStatus(item.id)}
                                disabled={togglingId === item.id}
                            >
                                <RefreshCw className={cn("h-4 w-4 text-muted-foreground", togglingId === item.id && "animate-spin")} />
                                <span>{t('attendance.changeStatus', 'Change status')}</span>
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
          data={data}
          columns={columns}
          enableSelection={!isOwnScopeOnly}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showSearch={false}
          isLoading={isLoading}
          showImport={!isOwnScopeOnly && hasPermission('shifts:create')}
          showExport={!isOwnScopeOnly && hasPermission('shifts:read')}
          importText={t('attendance.importBtn', 'Import')}
          exportText={t('attendance.exportBtn', 'Export')}
          currentPage={1}
          totalPages={1}
          pageSize={10}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          renderRowActions={isOwnScopeOnly ? undefined : renderRowActions}
        />

        <ShiftSheet
            open={isShiftSheetOpen}
            onOpenChange={setIsShiftSheetOpen}
            shiftToEdit={shiftToEdit}
            defaultCompanyId={companyId}
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
