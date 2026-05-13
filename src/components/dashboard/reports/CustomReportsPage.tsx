/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Download, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateReportSheet from './CreateReportSheet';
import { ExportButton } from './ExportButton';

const mockCustomReports = [
    {
        id: '1',
        reportName: 'New employee team',
        dataSource: 'Employees',
        filters: 'Department, Date range',
        lastRun: 'Mar 15, 2026',
        createdBy: 'Miracle Torff',
    },
    {
        id: '2',
        reportName: 'May unpaid benefit',
        dataSource: 'Payroll',
        filters: 'Date range, Payroll compo...',
        lastRun: 'Mar 1, 2026',
        createdBy: 'Nolan Dias',
    },
    {
        id: '3',
        reportName: 'Insurance paid',
        dataSource: 'Payroll',
        filters: 'Date range',
        lastRun: 'Mar 26, 2026',
        createdBy: 'Craig Aminoff',
    },
    {
        id: '4',
        reportName: 'Deduction paid to tax',
        dataSource: 'Payroll',
        filters: 'Payroll component',
        lastRun: 'Mar 10, 2026',
        createdBy: 'Alena Korsgaard',
    },
    {
        id: '5',
        reportName: 'Payout for vocational workers',
        dataSource: 'payroll',
        filters: 'Date range, Department',
        lastRun: 'Mar 8, 2026',
        createdBy: 'Alena Gouse',
    },
    {
        id: '6',
        reportName: 'Teams created in 2025',
        dataSource: 'Department',
        filters: 'Department, date range',
        lastRun: 'Mar 26, 2026',
        createdBy: 'Kianna Carder',
    },
];

const CustomReportsPage = () => {
    const { t } = useTranslation(['dashboard']);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const columns: ColumnConfig<any>[] = [
        {
            key: 'reportName',
            label: 'Report name',
            sortable: true,
        },
        {
            key: 'dataSource',
            label: 'Data source',
            sortable: true,
        },
        {
            key: 'filters',
            label: 'Filters',
            sortable: false,
        },
        {
            key: 'lastRun',
            label: 'Last run',
            sortable: true,
        },
        {
            key: 'createdBy',
            label: 'Created by',
            sortable: true,
        },
    ];

    const exportColumns = [
        { header: 'Report Name', key: 'reportName' },
        { header: 'Data Source', key: 'dataSource' },
        { header: 'Filters', key: 'filters' },
        { header: 'Last Run', key: 'lastRun' },
        { header: 'Created By', key: 'createdBy' },
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
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span>Export</span>
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
            <CreateReportSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('reports.custom.title')}
                </h1>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 h-9 rounded-lg transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('reports.custom.createReport')}</span>
                </Button>
            </div>

            {/* Table */}
            <div className="w-full">
                <UniversalDataTable
                    data={mockCustomReports}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Search for employees"
                    showFilter
                    currentPage={currentPage}
                    totalPages={Math.ceil(mockCustomReports.length / pageSize)}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    renderRowActions={renderRowActions}
                    renderHeaderActions={
                        <ExportButton
                            data={mockCustomReports}
                            columns={exportColumns}
                            filename="Custom_Reports_List"
                        />
                    }
                    totalItems={mockCustomReports.length}
                />
            </div>
        </div>
    );
};

export default CustomReportsPage;
