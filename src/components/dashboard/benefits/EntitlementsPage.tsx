'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { entitlementStats, mockEntitlements } from '@/data/benefits';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddEntitlementSheet from './AddEntitlementSheet';

const EntitlementsPage = () => {
    const { t } = useTranslation(['dashboard']);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const columns: ColumnConfig<any>[] = [
        {
            key: 'entitlementName',
            label: t('benefits.entitlements.table.entitlementName'),
            sortable: true,
        },
        {
            key: 'type',
            label: t('benefits.entitlements.table.type'),
            sortable: true,
        },
        {
            key: 'value',
            label: t('benefits.entitlements.table.value'),
            sortable: true,
        },
        {
            key: 'assignedTo',
            label: t('benefits.entitlements.table.assignedTo'),
            sortable: true,
        },
        {
            key: 'frequency',
            label: t('benefits.entitlements.table.frequency'),
            sortable: true,
        },
        {
            key: 'status',
            label: t('benefits.entitlements.table.status'),
            render: (item) => (
                <Badge 
                    variant="outline" 
                    className={
                        item.status === 'Active' 
                        ? "bg-green-500/10 text-green-600 border-green-500/20" 
                        : "bg-muted text-muted-foreground border-border"
                    }
                >
                    <div className={item.status === 'Active' ? "w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" : "w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"} />
                    {item.status}
                </Badge>
            )
        }
    ];

    const renderRowActions = (item: any) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>View</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <AddEntitlementSheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('benefits.entitlements.title')}
                </h1>
                <Button
                    onClick={() => setIsAddSheetOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 h-9 rounded-lg transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('benefits.entitlements.addEntitlement')}</span>
                </Button>
            </div>

            <SummaryStatList
                stats={entitlementStats.map((stat) => ({
                    title: t(`benefits.entitlements.stats.${
                        stat.title === 'Number of entitlements' ? 'numEntitlements' : 
                        stat.title === 'Active entitlements' ? 'activeEntitlements' : 
                        stat.title === 'Assigned to all employees' ? 'assignedToAll' : 'monthlySpending'
                    }`),
                    value: stat.value,
                    icon: stat.icon,
                    iconBgColor: stat.bgColor,
                    iconColor: stat.color,
                    borderColor: stat.borderColor,
                }))}
            />

            <div className="w-full">
                <UniversalDataTable
                    data={mockEntitlements}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Search for employees"
                    showFilter
                    currentPage={currentPage}
                    totalPages={1}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    renderRowActions={renderRowActions}
                    totalItems={mockEntitlements.length}
                />
            </div>
        </div>
    );
};

export default EntitlementsPage;
