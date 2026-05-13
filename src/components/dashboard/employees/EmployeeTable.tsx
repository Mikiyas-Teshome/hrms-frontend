/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Pencil, RefreshCw, Trash2, CircleCheck, CircleX, Shield, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { EmployeeResponse } from '@/features/employee/employee.types';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import UpdatePermissionSheet from './UpdatePermissionSheet';
import AssignShiftModal from './AssignShiftModal';
import { useDeleteEmployee, useUpdateEmployeeStatus } from '@/features/employee/hooks/useEmployee';
import { useToast } from '@/hooks/use-toast';
import { Employee, EmployeeStatus as LegacyStatus } from '@/types/employee';
import { EmployeeStatus } from '@/features/employee/employee.types';

interface EmployeeTableProps {
    onImport?: () => void;
    onExport?: () => void;
    onFilterClick?: () => void;
    expandedFilters?: React.ReactNode;
    onEdit?: (employee: EmployeeResponse) => void;
}

const mapEmployeeToLegacy = (emp: EmployeeResponse | null): Employee | null => {
    if (!emp) return null;
    return {
        id: emp.id,
        userId: emp.userId || undefined,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.orgUnit?.orgUnitName || emp.departmentId || '',
        role: emp.jobTitle || '', // Fallback to jobTitle if role is missing
        email: emp.email,
        status: emp.status as unknown as LegacyStatus,
    };
};

const EmployeeTable = ({ onImport, onExport, onFilterClick, expandedFilters, onEdit }: EmployeeTableProps) => {
    const { t, i18n } = useTranslation('employees');
    const { hasPermission } = usePermissions();
    const router = useRouter();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeResponse | null>(null);
    const [isPermissionSheetOpen, setIsPermissionSheetOpen] = useState(false);
    const [employeeForPermission, setEmployeeForPermission] = useState<EmployeeResponse | null>(null);
    const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false);
    const [employeeForShift, setEmployeeForShift] = useState<EmployeeResponse | null>(null);
    const { toast } = useToast();
    const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();
    const { mutate: updateStatus } = useUpdateEmployeeStatus();
    const { data: employeesData, isLoading } = useEmployees({
        page: currentPage,
        limit: pageSize,
    });

    const employees = employeesData || [];

    const filteredEmployees = React.useMemo(() => {
        return employees.filter(emp => 
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchValue.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchValue.toLowerCase()) ||
            emp.jobTitle.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [employees, searchValue]);

    const handleDeleteClick = (employee: EmployeeResponse) => {
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!employeeToDelete) return;
        deleteEmployee(employeeToDelete.id, {
            onSuccess: () => {
                toast({
                    title: t('deleteSuccess', 'Employee deleted'),
                    description: t('deleteSuccessDesc', 'The employee has been removed.'),
                    variant: 'success',
                });
                setIsDeleteModalOpen(false);
                setEmployeeToDelete(null);
            },
            onError: (err: any) => {
                toast({
                    title: t('deleteError', 'Delete failed'),
                    description: err?.message || t('deleteErrorDesc', 'Could not delete employee.'),
                    variant: 'destructive',
                });
            },
        });
    };

    const columns: ColumnConfig<EmployeeResponse>[] = [
        {
            key: 'employeeNumber',
            label: t('employeeNumber', 'Employee ID'),
            sortable: true,
            className: 'font-medium',
        },
        {
            key: 'firstName',
            label: t('name'),
            sortable: true,
            className: 'font-medium py-3',
            render: (item) => `${item.firstName} ${item.lastName}`,
        },
        {
            key: 'email',
            label: t('email'),
            sortable: true,
        },
        {
            key: 'departmentId',
            label: t('department'),
            sortable: true,
            className: 'text-muted-foreground',
            render: (item) => item.orgUnit?.orgUnitName || item.departmentId || '-',
        },
        {
            key: 'jobTitle',
            label: t('jobTitle', 'Job Title'),
            sortable: true,
        },
        {
            key: 'employmentType',
            label: t('jobType', 'Job Type'),
            sortable: true,
        },
        {
            key: 'status',
            label: t('status'),
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-2 px-2 py-0.5 border border-border rounded-lg bg-background w-fit">
                    {item.status.toLowerCase() === 'active' ? (
                        <CircleCheck className="w-3 h-3 text-[#22C55E]" />
                    ) : item.status.toLowerCase() === 'invited' ? (
                        <RefreshCw className="w-3 h-3 text-[#5185F2]" />
                    ) : (
                        <CircleX className="w-3 h-3 text-[#EF4444]" />
                    )}
                    <span className="text-xs font-semibold text-foreground capitalize">
                        {item.status}
                    </span>
                </div>
            ),
        },
    ];

    const renderRowActions = (item: EmployeeResponse) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="min-w-45">
                {hasPermission('employees:read') && (
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/employees/${item.id}`)} className="flex items-center cursor-pointer gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span>{t('view')}</span>
                    </DropdownMenuItem>
                )}
                {hasPermission('employees:update') && (
                    <>
                        <DropdownMenuItem onClick={() => onEdit?.(item)} className="flex items-center cursor-pointer gap-2">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                            <span>{t('edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => {
                                const newStatus = item.status === EmployeeStatus.ACTIVE ? EmployeeStatus.INACTIVE : EmployeeStatus.ACTIVE;
                                updateStatus({ 
                                    id: item.id, 
                                    input: { status: newStatus } 
                                }, {
                                    onSuccess: () => {
                                        toast({
                                            title: t('statusUpdateSuccess', 'Status updated successfully'),
                                            variant: 'success',
                                        });
                                    },
                                    onError: (error: any) => {
                                        toast({
                                            title: t('statusUpdateError', 'Failed to update status'),
                                            description: error.message,
                                            variant: 'destructive',
                                        });
                                    }
                                });
                            }} 
                            className="flex items-center cursor-pointer gap-2"
                        >
                            <RefreshCw className="w-4 h-4 text-muted-foreground" />
                            <span>{t('changeStatus')}</span>
                        </DropdownMenuItem>
                    </>
                )}
                {hasPermission('roles:assign') && (
                    <DropdownMenuItem 
                        onClick={() => {
                            setEmployeeForPermission(item);
                            setIsPermissionSheetOpen(true);
                        }} 
                        className="flex items-center cursor-pointer gap-2"
                    >
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span>{t('updatePermission', 'Update Permission')}</span>
                    </DropdownMenuItem>
                )}
                {hasPermission('shifts:assign') && (
                    <DropdownMenuItem 
                        onClick={() => {
                            setEmployeeForShift(item);
                            setIsAssignShiftOpen(true);
                        }} 
                        className="flex items-center cursor-pointer gap-2"
                    >
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{t('assignShift', 'Assign Shift')}</span>
                    </DropdownMenuItem>
                )}
                {hasPermission('employees:delete') && (
                    <DropdownMenuItem 
                        onClick={() => handleDeleteClick(item)} 
                        className="flex items-center cursor-pointer gap-2 text-destructive focus:text-destructive"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>{t('delete')}</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="w-full">
            <UniversalDataTable
                data={filteredEmployees}
                columns={columns}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder={t('searchForEmployees')}
                onImport={onImport}
                onExport={onExport}
                showImport={hasPermission('employees:import')}
                showExport={hasPermission('employees:export')}
                currentPage={currentPage}
                totalPages={1} // Ideally get from API
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                totalItems={filteredEmployees.length}
                renderRowActions={renderRowActions}
                minWidth="1000px"
                isLoading={isLoading}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('deleteEmployeeData')}
                message={t('deleteConfirmationMessage', { name: employeeToDelete ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}` : '' })}
                onConfirm={handleConfirmDelete}
                confirmLabel={t('delete')}
                cancelLabel={t('cancel')}
                isLoading={isDeleting}
                variant="danger"
            />

            <UpdatePermissionSheet 
                open={isPermissionSheetOpen}
                onOpenChange={setIsPermissionSheetOpen}
                employee={mapEmployeeToLegacy(employeeForPermission)}
            />

            <AssignShiftModal
                open={isAssignShiftOpen}
                onOpenChange={setIsAssignShiftOpen}
                employee={employeeForShift}
            />

            <AssignShiftModal
                open={isAssignShiftOpen}
                onOpenChange={setIsAssignShiftOpen}
                employee={employeeForShift}
            />

        </div>
    );
};

export default EmployeeTable;
