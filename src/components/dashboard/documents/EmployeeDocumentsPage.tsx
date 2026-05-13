'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit, Trash2, Download, RotateCcw } from 'lucide-react';
import { documentStats, mockEmployeeDocuments } from '@/data/documents';
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
import UploadDocumentModal from './UploadDocumentModal';

const EmployeeDocumentsPage = () => {
    const { t } = useTranslation(['dashboard']);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const columns: ColumnConfig<any>[] = [
        {
            key: 'employee',
            label: t('documentData.employeeDocuments.table.employee'),
            sortable: true,
        },
        {
            key: 'category',
            label: t('documentData.employeeDocuments.table.category'),
            sortable: true,
        },
        {
            key: 'documentName',
            label: t('documentData.employeeDocuments.table.documentName'),
            sortable: true,
        },
        {
            key: 'expiryDate',
            label: t('documentData.employeeDocuments.table.expiryDate'),
            sortable: true,
        },
        {
            key: 'compliance',
            label: t('documentData.employeeDocuments.table.compliance'),
            render: (item) => (
                <Badge 
                    variant="outline" 
                    className={
                        item.compliance === 'Compliant' 
                        ? "bg-green-500/10 text-green-600 border-green-500/20" 
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    }
                >
                    <div className={item.compliance === 'Compliant' ? "w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" : "w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"} />
                    {item.compliance}
                </Badge>
            )
        },
        {
            key: 'uploadedBy',
            label: t('documentData.employeeDocuments.table.uploadedBy'),
            sortable: true,
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
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <span>Change status</span>
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
            <UploadDocumentModal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('documentData.employeeDocuments.title')}
                </h1>
                <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 h-9 rounded-lg transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('documentData.employeeDocuments.uploadDocument')}</span>
                </Button>
            </div>

            <SummaryStatList
                stats={documentStats.map((stat) => ({
                    title: t(`documentData.employeeDocuments.stats.${
                        stat.title === 'Compliant employees' ? 'compliant' : 
                        stat.title === 'Employee missing documents' ? 'missing' : 
                        stat.title === 'Expired documents' ? 'expired' : 'nearExpiry'
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
                    data={mockEmployeeDocuments}
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
                    totalItems={mockEmployeeDocuments.length}
                />
            </div>
        </div>
    );
};

export default EmployeeDocumentsPage;
