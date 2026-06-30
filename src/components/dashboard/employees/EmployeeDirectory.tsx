'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';
import EmployeeTable from './EmployeeTable';
import AddEmployeeSheet from './AddEmployeeSheet';
import EditEmployeeSheet from './EditEmployeeSheet';
import ImportEmployeesModal from './ImportEmployeesModal';
import { useTranslation } from 'react-i18next';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { Users, CircleCheck, CalendarClock, FileClock } from 'lucide-react';
import { EmployeeResponse } from '@/features/employee/employee.types';
import { exportReport } from '@/lib/export-utils';

const EmployeeDirectory = () => {
    const { t } = useTranslation('employees');
    const searchParams = useSearchParams();
    const ouIdFilter = searchParams.get('ouId') ?? undefined;
    const { hasPermission } = usePermissions();
    const { data: employeesData, isLoading } = useEmployees(
        ouIdFilter ? { ouId: ouIdFilter } : {},
    );
    const employees = employeesData || [];

    const dynamicStats = [
        { title: 'numberOfEmployees', value: employees.length, icon: Users, bgColor: 'rgba(40, 101, 227, 0.05)', color: '#2865E3', borderColor: 'rgba(40, 101, 227, 0.5)' },
        { title: 'activeEmployees', value: employees.filter(e => e.status.toLowerCase() === 'active').length, icon: CircleCheck, bgColor: 'rgba(34, 197, 94, 0.05)', color: '#22C55E', borderColor: 'rgba(34, 197, 94, 0.5)' },
        { title: 'onLeave', value: employees.filter(e => ['onleave', 'on-leave'].includes(e.status.toLowerCase())).length, icon: CalendarClock, bgColor: 'rgba(217, 119, 6, 0.05)', color: '#D97706', borderColor: 'rgba(217, 119, 6, 0.5)' },
        { title: 'nonCompliant', value: 0, icon: FileClock, bgColor: 'rgba(239, 68, 68, 0.05)', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.5)' },
    ];
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeResponse | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleAddEmployeeClick = () => {
        setEmployeeToEdit(null);
        setIsAddSheetOpen(true);
    };

    const handleEditEmployee = (employee: EmployeeResponse) => {
        setEmployeeToEdit(employee);
        setIsEditSheetOpen(true);
    };

    const handleImportClick = () => {
        setIsImportModalOpen(true);
    };

    const handleExportClick = async () => {
        const columns = [
            { header: t('employeeId', 'Employee ID'), key: 'employeeNumber' },
            { header: t('firstName', 'First Name'), key: 'firstName' },
            { header: t('lastName', 'Last Name'), key: 'lastName' },
            { header: t('email', 'Email'), key: 'email' },
            { header: t('role', 'Role'), key: 'roleName' },
            { header: t('jobTitle', 'Job Title'), key: 'jobTitle' },
            { header: t('status', 'Status'), key: 'status' },
            { header: t('hireDate', 'Hire Date'), key: 'hireDate' },
        ];

        await exportReport({
            filename: `Employees_${new Date().toISOString().split('T')[0]}`,
            columns,
            data: employees,
            format: 'csv'
        });
    };

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <AddEmployeeSheet 
                open={isAddSheetOpen} 
                onOpenChange={setIsAddSheetOpen} 
            />

            <EditEmployeeSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                employee={employeeToEdit}
            />
            
            <ImportEmployeesModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('employeesDirectory')}
                </h1>
                {hasPermission('employees:create') && (
                    <Button
                        onClick={handleAddEmployeeClick}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 h-9 rounded-lg transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        <span>{t('addEmployee')}</span>
                    </Button>
                )}
            </div>

            {isLoading ? (
                <SummaryStatListSkeleton count={4} />
            ) : (
                <SummaryStatList
                    stats={dynamicStats.map((stat) => ({
                        title: t(stat.title),
                        value: stat.value,
                        icon: stat.icon,
                        iconBgColor: stat.bgColor,
                        iconColor: stat.color,
                        borderColor: stat.borderColor,
                    }))}
                />
            )}
            
            <div className="w-full">
                <EmployeeTable 
                    onImport={handleImportClick}
                    onExport={handleExportClick}
                    onEdit={handleEditEmployee}
                    ouIdFilter={ouIdFilter}
                />
            </div>
        </div>
    );
};

export default EmployeeDirectory;
