'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Pencil, Trash2, ToggleLeft, CircleCheck, CircleX, ListFilter } from 'lucide-react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { ContractType } from '@/data/contracts';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

interface ContractsTableProps {
    data: ContractType[];
    isLoading?: boolean;
    onEdit?: (item: ContractType) => void;
    onDelete?: (item: ContractType) => void;
}

export function ContractsTable({ data, isLoading = false, onEdit, onDelete }: ContractsTableProps) {
    const { t } = useTranslation(['contracts', 'employees', 'dashboard']);
    const { hasPermission } = usePermissions();
    const canUpdateContracts = hasPermission('contracts:update');
    const canDeleteContracts = hasPermission('contracts:delete');
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const filterForm = useForm({
        defaultValues: {
            statusFilter: 'all',
            renewableFilter: 'all',
        },
    });
    const statusFilter = useWatch({
        control: filterForm.control,
        name: 'statusFilter',
    }) as 'all' | 'Active' | 'Inactive';
    const renewableFilter = useWatch({
        control: filterForm.control,
        name: 'renewableFilter',
    }) as 'all' | 'yes' | 'no';

    const columns: ColumnConfig<ContractType>[] = [
        {
            key: 'companyName',
            label: t('company', { defaultValue: 'Company' }),
            className: 'text-muted-foreground',
            sortable: true,
            render: (item) => (
                <span className="text-foreground">{item.companyName || '—'}</span>
            ),
        },
        {
            key: 'name',
            label: t('contractType'),
            className: 'font-medium py-3',
            sortable: true,
            render: (item) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-62.5">
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

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            item.description.toLowerCase().includes(searchValue.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesRenewable =
            renewableFilter === 'all' ||
            (renewableFilter === 'yes' && item.renewable) ||
            (renewableFilter === 'no' && !item.renewable);
        return matchesSearch && matchesStatus && matchesRenewable;
    });

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const renderRowActions = (item: ContractType) => {
        if ((!onEdit || !canUpdateContracts) && (!onDelete || !canDeleteContracts)) {
            return null;
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-muted">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-border/50">
                    {onEdit && canUpdateContracts ? (
                        <DropdownMenuItem
                            onClick={() => onEdit(item)}
                            className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg focus:bg-muted"
                        >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                            <span>{t('employees:edit')}</span>
                        </DropdownMenuItem>
                    ) : null}
                    {canUpdateContracts ? (
                        <DropdownMenuItem className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg focus:bg-muted">
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            <span>{t('employees:changeStatus')}</span>
                        </DropdownMenuItem>
                    ) : null}
                    {onDelete && canDeleteContracts ? (
                        <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg focus:bg-destructive/10 text-destructive focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>{t('employees:delete')}</span>
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <UniversalDataTable
            data={paginatedData}
            columns={columns}
            isLoading={isLoading}
            enableSelection={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder={t('employees:searchForEmployees')}
            renderCustomFilter={(
                <Button
                    variant="outline"
                    size="default"
                    className="h-10 gap-2 border-input"
                    onClick={() => setShowFilters((prev) => !prev)}
                >
                    <ListFilter className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            )}
            renderFilterPanel={
                showFilters ? (
                    <div className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg p-4 sm:p-6 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <FormSelect
                                    id="contracts-filter-status"
                                    label={t('employees:status')}
                                    control={filterForm.control}
                                    name="statusFilter"
                                    options={[
                                        { label: 'All', value: 'all' },
                                        { label: 'Active', value: 'Active' },
                                        { label: 'Inactive', value: 'Inactive' },
                                    ]}
                                    t={t}
                                    containerClassName="space-y-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <FormSelect
                                    id="contracts-filter-renewable"
                                    label={t('renewable')}
                                    control={filterForm.control}
                                    name="renewableFilter"
                                    options={[
                                        { label: 'All', value: 'all' },
                                        { label: 'Yes', value: 'yes' },
                                        { label: 'No', value: 'no' },
                                    ]}
                                    t={t}
                                    containerClassName="space-y-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    filterForm.reset({
                                        statusFilter: 'all',
                                        renewableFilter: 'all',
                                    });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                ) : undefined
            }
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            totalItems={filteredData.length}
            renderRowActions={renderRowActions}
            minWidth="1000px"
        />
    );
}
