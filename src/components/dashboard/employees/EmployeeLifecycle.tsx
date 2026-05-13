'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Search, FileInput, FileOutput, Users, CircleCheck, CalendarClock, FileClock, EllipsisVertical, User, Eye, Loader2 } from 'lucide-react';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { EmployeeStatus } from '@/features/employee/employee.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';

const KANBAN_COLUMNS_CONFIG = [
    { id: 'onboarding', title: 'Onboarding', color: '#136DEC', statuses: [EmployeeStatus.INVITED] },
    { id: 'active', title: 'Active', color: '#00DF5D', statuses: [EmployeeStatus.ACTIVE, EmployeeStatus.SUSPENDED, EmployeeStatus.TRANSFERRED] },
    { id: 'on_leave', title: 'On leave', color: '#FFE100', statuses: [EmployeeStatus.ON_LEAVE] },
    { id: 'inactive', title: 'Inactive', color: '#FF0000', statuses: [EmployeeStatus.INACTIVE, EmployeeStatus.TERMINATED, EmployeeStatus.ARCHIVED] },
];

export default function EmployeeLifecycle() {
    const { t } = useTranslation('employees');
    const router = useRouter();
    const [searchValue, setSearchValue] = useState('');
    const { data: profile } = useProfile();
    const { data: employeesData, isLoading } = useEmployees();

    const employees = employeesData || [];
    
    const filteredEmployees = employees.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchValue.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchValue.toLowerCase())
    );

    const kanbanColumns = KANBAN_COLUMNS_CONFIG.map(col => ({
        ...col,
        items: filteredEmployees.filter(emp => col.statuses.includes(emp.status))
    }));

    const stats = [
        { title: 'Number of employees', value: employees.length, icon: Users, bgColor: 'rgba(40, 101, 227, 0.05)', color: '#2865E3', borderColor: 'rgba(40, 101, 227, 0.5)' },
        { title: 'Active employees', value: employees.filter(e => e.status === EmployeeStatus.ACTIVE).length, icon: CircleCheck, bgColor: 'rgba(34, 197, 94, 0.05)', color: '#22C55E', borderColor: 'rgba(34, 197, 94, 0.5)' },
        { title: 'On leave', value: employees.filter(e => e.status === EmployeeStatus.ON_LEAVE).length, icon: CalendarClock, bgColor: 'rgba(217, 119, 6, 0.05)', color: '#D97706', borderColor: 'rgba(217, 119, 6, 0.5)' },
        { title: 'Non compliant', value: 0, icon: FileClock, bgColor: 'rgba(239, 68, 68, 0.05)', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.5)' },
    ];

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('employeeLifecycle')}
                </h1>
            </div>

            {/* Stats Section */}
            <SummaryStatList
                stats={stats.map((stat) => ({
                    title: stat.title,
                    value: stat.value,
                    icon: stat.icon,
                    iconBgColor: stat.bgColor,
                    iconColor: stat.color,
                    borderColor: stat.borderColor,
                }))}
            />

            {/* Data Table / Board Interface block */}
            <div className="flex flex-col items-start gap-6 w-full min-w-[487px]">
                {/* Filters Wrapper */}
                <div className="flex flex-row justify-between items-center pb-4 w-full h-[52px]">
                    <div className="flex flex-row items-center gap-3 w-[300px]">
                        <div className="flex flex-row items-center px-3 py-1 gap-2 w-full h-9 bg-background border border-border shadow-sm rounded-lg">
                            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                            <Input 
                                type="text"
                                placeholder={t('searchEmployees')}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="border-0 shadow-none focus-visible:ring-0 p-0 h-4 text-sm font-sans placeholder-muted-foreground text-foreground w-full bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex flex-row items-start gap-2 h-9">
                        <Button 
                            variant="outline"
                            className="flex flex-row items-center justify-center gap-2 px-4 py-2 w-[100px] h-9 border-[#5185F2] hover:bg-[#5185F2]/10 bg-background shadow-sm rounded-lg"
                        >
                            <FileInput className="w-4 h-4 text-[#2865E3]" />
                            <span className="font-sans font-medium text-sm text-[#2865E3]">{t('import')}</span>
                        </Button>
                        <Button 
                            variant="outline"
                            className="flex flex-row items-center justify-center gap-2 px-4 py-2 w-[100px] h-9 border-[#5185F2] hover:bg-[#5185F2]/10 bg-background shadow-sm rounded-lg"
                        >
                            <FileOutput className="w-4 h-4 text-[#2865E3]" />
                            <span className="font-sans font-medium text-sm text-[#2865E3]">{t('export')}</span>
                        </Button>
                    </div>
                </div>

                {/* Columns Container */}
                <div className="flex flex-row items-start gap-6 w-full overflow-x-auto pb-4 min-h-[500px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center w-full py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : kanbanColumns.map((col) => (
                        <div 
                            key={col.id} 
                            className="flex flex-col flex-1 min-w-[240px] max-w-[300px] bg-card border border-border/80 shadow-sm rounded-xl overflow-hidden h-fit"
                        >
                            {/* Column Header */}
                            <div 
                                className="flex flex-row items-center px-6 h-[50px] bg-muted/50 shrink-0"
                                style={{ borderTop: `4px solid ${col.color}` }}
                            >
                                <span className="flex-1 font-sans font-semibold text-sm text-foreground">
                                    {col.title}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border/50">
                                    {col.items.length}
                                </span>
                            </div>

                            {/* Column Items */}
                            <div className="flex flex-col w-full max-h-[600px] overflow-y-auto no-scrollbar">
                                {col.items.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="flex flex-row items-center pl-3 pr-2 py-2 gap-2 h-[66px] border-b border-border/50 last:border-0 w-full hover:bg-muted/50 transition-colors cursor-pointer"
                                    >
                                        <div 
                                            className="w-2 h-2 rounded-full shrink-0" 
                                            style={{ backgroundColor: col.color === '#00DF5D' ? '#00E05D' : col.color }} 
                                        />
                                        
                                        <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-sans font-semibold text-sm text-foreground truncate">
                                                    {item.firstName} {item.lastName}
                                                </span>
                                                <span className="font-sans text-xs text-muted-foreground truncate">
                                                    {item.jobTitle}
                                                </span>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 rounded-md">
                                                    <EllipsisVertical className="w-4 h-4 text-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuItem 
                                                    onClick={() => router.push(`/dashboard/employees/${item.id}`)}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-sans font-medium text-sm">{t('view')}</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                                {col.items.length === 0 && (
                                    <p className="text-xs text-muted-foreground px-4 py-3 italic">
                                        {t('noEmployees')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
