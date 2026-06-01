'use client';

import React, { useMemo, useState } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Pencil, RefreshCw, Trash2, CircleCheck, CircleX, Shield, Calendar as CalendarIcon, ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { usePaginatedEmployees } from '@/features/employee/hooks/useEmployee';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { EmployeeListFilterInput, EmployeeResponse, EmployeeSortBy, EmployeeSortOrder } from '@/features/employee/employee.types';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import UpdatePermissionSheet from './UpdatePermissionSheet';
import { AssignShiftModal } from '../organization/assign-shift-modal';
import { useDeleteEmployee, useUpdateEmployeeStatus } from '@/features/employee/hooks/useEmployee';
import { useToast } from '@/hooks/use-toast';
import { Employee, EmployeeStatus as LegacyStatus } from '@/types/employee';
import { EmployeeStatus } from '@/features/employee/employee.types';
import EmployeeFilterSection from './EmployeeFilterSection';

interface EmployeeTableProps {
    onImport?: () => void;
    onExport?: () => void;
    onFilterClick?: () => void;
    expandedFilters?: React.ReactNode;
    onEdit?: (employee: EmployeeResponse) => void;
    ouIdFilter?: string;
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

const EmployeeTable = ({ onImport, onExport, onEdit, ouIdFilter }: EmployeeTableProps) => {
    const { t, i18n } = useTranslation('employees');
    const { hasPermission } = usePermissions();
    const router = useRouter();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<EmployeeListFilterInput>({});
    const [sortColumn, setSortColumn] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeResponse | null>(null);
    const [isPermissionSheetOpen, setIsPermissionSheetOpen] = useState(false);
    const [employeeForPermission, setEmployeeForPermission] = useState<EmployeeResponse | null>(null);
    const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false);
    const [employeeForShift, setEmployeeForShift] = useState<EmployeeResponse | null>(null);
    const { toast } = useToast();
    const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();
    const { mutate: updateStatus } = useUpdateEmployeeStatus();
    const effectiveFilter = useMemo(
        () => ({
            ...activeFilters,
            departmentOuId: activeFilters.departmentOuId || ouIdFilter,
            search: debouncedSearch || undefined,
            sortBy: mapColumnToSortBy(sortColumn) ?? 'CREATED_AT',
            sortOrder: (sortDirection === 'asc' ? 'ASC' : 'DESC') as EmployeeSortOrder,
        }),
        [activeFilters, ouIdFilter, debouncedSearch, sortColumn, sortDirection],
    );
    const { data: employeesData, isLoading } = usePaginatedEmployees(
        { page: currentPage, size: pageSize },
        effectiveFilter,
    );

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue.trim());
            setCurrentPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchValue]);

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

    const handleApplyFilters = (filters: EmployeeListFilterInput) => {
        setActiveFilters(filters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setActiveFilters({});
        setCurrentPage(1);
    };

    const handleSort = (column: string) => {
        if (!mapColumnToSortBy(column)) {
            return;
        }
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    return (
        <div className="w-full">
            <UniversalDataTable
                data={employeesData?.data || []}
                columns={columns}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder={t('searchForEmployees')}
                onImport={onImport}
                onExport={onExport}
                renderCustomFilter={(
                    <Button
                        variant="outline"
                        size="default"
                        className="h-10 gap-2 border-input"
                        onClick={() => setShowFilters((prev) => !prev)}
                    >
                        <ListFilter className="h-4 w-4" />
                        <span>{t('filter', 'Filter')}</span>
                        {activeFilterCount > 0 ? (
                            <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-semibold">
                                {activeFilterCount}
                            </span>
                        ) : null}
                    </Button>
                )}
                renderFilterPanel={(
                    <EmployeeFilterSection
                        isVisible={showFilters}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                        initialFilters={activeFilters}
                    />
                )}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                showImport={hasPermission('employees:import')}
                showExport={hasPermission('employees:export')}
                currentPage={currentPage}
                totalPages={employeesData?.metaData.totalPages || 0}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                totalItems={employeesData?.metaData.total || 0}
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
                isOpen={isAssignShiftOpen}
                onClose={() => {
                    setIsAssignShiftOpen(false);
                    setEmployeeForShift(null);
                }}
                target={employeeForShift ? {
                    id: employeeForShift.userId || employeeForShift.id,
                    name: `${employeeForShift.firstName} ${employeeForShift.lastName}`,
                    type: 'EMPLOYEE',
                    companyId: employeeForShift.orgUnit?.orgUnitId || null,
                } : null}
            />

        </div>
    );
};

export default EmployeeTable;

function mapColumnToSortBy(column: string): EmployeeSortBy | null {
    if (column === 'createdAt') return 'CREATED_AT';
    if (column === 'employeeNumber') return 'EMPLOYEE_NUMBER';
    if (column === 'firstName') return 'FIRST_NAME';
    if (column === 'email') return 'EMAIL';
    if (column === 'departmentId') return 'DEPARTMENT_ID';
    if (column === 'jobTitle') return 'JOB_TITLE';
    if (column === 'employmentType') return 'EMPLOYMENT_TYPE';
    if (column === 'status') return 'STATUS';
    return null;
}
