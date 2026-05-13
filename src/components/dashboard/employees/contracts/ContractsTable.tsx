'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Eye, Pencil, Trash2, ToggleLeft, CircleCheck, CircleX, RefreshCw } from 'lucide-react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { ContractType } from '@/data/contracts';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContractsTableProps {
    data: ContractType[];
    onEdit: (item: ContractType) => void;
    onDelete: (item: ContractType) => void;
    onImport?: () => void;
    onExport?: () => void;
    onFilterClick?: () => void;
}

export function ContractsTable({ data, onEdit, onDelete, onImport, onExport, onFilterClick }: ContractsTableProps) {
    const { t } = useTranslation(['contracts', 'employees', 'dashboard']);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    const columns: ColumnConfig<ContractType>[] = [
        {
            key: 'name',
            label: t('contractType'),
            className: 'font-medium py-3',
            sortable: true,
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {item.description}
                    </span>
                </div>
            ),
        },
        {
            key: 'duration',
            label: t('duration'),
            className: 'text-muted-foreground',
            sortable: true,
            render: (item) => (
                <span className="text-foreground">{item.duration}</span>
            ),
        },
        {
            key: 'probation',
            label: t('probation'),
            className: 'text-muted-foreground',
            sortable: true,
            render: (item) => (
                <span className="text-foreground">{item.probation}</span>
            ),
        },
        {
            key: 'renewable',
            label: t('renewable'),
            className: 'text-muted-foreground',
            sortable: true,
            render: (item) => (
                <span className="text-foreground">
                    {item.renewable ? t('yes') : t('no')}
                </span>
            ),
        },
        {
            key: 'contractsSigned',
            label: t('contractsSigned'),
            className: 'text-muted-foreground',
            sortable: true,
            render: (item) => (
                <span className="text-foreground font-medium">
                    {item.contractsSigned}
                </span>
            ),
        },
        {
            key: 'status',
            label: t('employees:status'),
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-2 px-2 py-0.5 border border-border rounded-lg bg-background w-fit">
                    {item.status.toLowerCase() === 'active' ? (
                        <CircleCheck className="w-3 h-3 text-[#22C55E]" />
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

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description.toLowerCase().includes(searchValue.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const renderRowActions = (item: ContractType) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-muted">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-border/50">
                <DropdownMenuItem className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg focus:bg-muted">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{t('employees:view')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => onEdit(item)}
                    className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg focus:bg-muted"
                >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    <span>{t('employees:edit')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg focus:bg-muted">
                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    <span>{t('employees:changeStatus')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => onDelete(item)}
                    className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg focus:bg-destructive/10 text-destructive focus:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('employees:delete')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <UniversalDataTable
            data={paginatedData}
            columns={columns}
            enableSelection={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder={t('employees:searchForEmployees')}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            totalItems={filteredData.length}
            renderRowActions={renderRowActions}
            onImport={onImport}
            onExport={onExport}
            onFilterClick={onFilterClick}
            filterText={t('employees:filter')}
            minWidth="1000px"
        />
    );
}
