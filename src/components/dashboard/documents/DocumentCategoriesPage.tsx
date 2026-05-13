'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit, Trash2, RotateCcw } from 'lucide-react';
import { categoryStats, mockDocumentCategories } from '@/data/documents';
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
import AddCategorySheet from './AddCategorySheet';

const DocumentCategoriesPage = () => {
    const { t } = useTranslation(['dashboard']);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const columns: ColumnConfig<any>[] = [
        {
            key: 'categoryName',
            label: t('documentData.documentCategories.table.categoryName'),
            sortable: true,
        },
        {
            key: 'type',
            label: t('documentData.documentCategories.table.type'),
            sortable: true,
        },
        {
            key: 'required',
            label: t('documentData.documentCategories.table.required'),
            sortable: true,
        },
        {
            key: 'expiryDateRequired',
            label: t('documentData.documentCategories.table.expiryDateRequired'),
            sortable: true,
        },
        {
            key: 'appliedTo',
            label: t('documentData.documentCategories.table.appliedTo'),
            sortable: true,
        },
        {
            key: 'status',
            label: t('documentData.documentCategories.table.status'),
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
            <AddCategorySheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('documentData.documentCategories.title')}
                </h1>
                <Button
                    onClick={() => setIsAddSheetOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 h-9 rounded-lg transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('documentData.documentCategories.addCategory')}</span>
                </Button>
            </div>

            <SummaryStatList
                stats={categoryStats.map((stat) => ({
                    title: t(`documentData.documentCategories.stats.${
                        stat.title === 'Total categories' ? 'total' : 
                        stat.title === 'Required categories' ? 'required' : 
                        stat.title === 'Expiry date required' ? 'expiryRequired' : 'active'
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
                    data={mockDocumentCategories}
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
                    totalItems={mockDocumentCategories.length}
                />
            </div>
        </div>
    );
};

export default DocumentCategoriesPage;
