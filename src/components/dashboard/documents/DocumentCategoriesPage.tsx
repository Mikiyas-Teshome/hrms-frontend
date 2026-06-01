'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit, Trash2, RotateCcw } from 'lucide-react';
import { categoryStats } from '@/data/documents';
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
import { FormSelect } from '@/components/ui/FormSelect';
import AddCategorySheet from './AddCategorySheet';
import {
    fetchDocumentCategoryStatus,
    fetchDocumentCategoriesPaged,
    updateDocumentCategory,
    deleteDocumentCategory,
} from '@/features/documents/documents.actions';
import {
    DocumentCategory,
    DocumentCategoryAppliedTo,
    DocumentCategoryStats,
    DocumentCategoryFilterInput,
} from '@/features/documents/documents.types';

type CategoryFilterForm = {
    status: string;
    appliedTo: string;
    required: string;
    expiryRequired: string;
};

const DocumentCategoriesPage = () => {
    const { t } = useTranslation(['dashboard', 'document']);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState<DocumentCategoryStats>({
        total: 0,
        required: 0,
        expiryRequired: 0,
        active: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterAppliedTo, setFilterAppliedTo] = useState<DocumentCategoryAppliedTo | ''>('');
    const [filterRequired, setFilterRequired] = useState<string>('');
    const [filterExpiryRequired, setFilterExpiryRequired] = useState<string>('');
    const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
    const filterForm = useForm<CategoryFilterForm>({
        defaultValues: {
            status: '__all__',
            appliedTo: '__all__',
            required: '__all__',
            expiryRequired: '__all__',
        },
    });

    const allStatusValue = '__all__';
    const allAppliedToValue = '__all__';
    const allRequiredValue = '__all__';
    const allExpiryValue = '__all__';

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
                        item.status === 'active'
                        ? "bg-green-500/10 text-green-600 border-green-500/20" 
                        : "bg-muted text-muted-foreground border-border"
                    }
                >
                    <div className={item.status === 'active' ? "w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" : "w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"} />
                    {item.status === 'active'
                        ? t('documentCategories.status.active', { ns: 'document' })
                        : t('documentCategories.status.inactive', { ns: 'document' })}
                </Badge>
            )
        }
    ];

    const renderRowActions = (item: { id: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => {
                        const category = categories.find((entry) => entry.id === item.id);
                        if (!category) {
                            return;
                        }
                        setEditingCategory(category);
                        setIsAddSheetOpen(true);
                    }}
                >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{t('documentCategories.actions.view', { ns: 'document' })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => {
                        const category = categories.find((entry) => entry.id === item.id);
                        if (!category) {
                            return;
                        }
                        setEditingCategory(category);
                        setIsAddSheetOpen(true);
                    }}
                >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <span>{t('documentCategories.actions.edit', { ns: 'document' })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={async () => {
                        const category = categories.find((entry) => entry.id === item.id);
                        if (!category) {
                            return;
                        }
                        const nextStatus = category.status === 'active' ? 'inactive' : 'active';
                        const result = await updateDocumentCategory(category.id, { status: nextStatus });
                        if (!result.success) {
                            console.error(result.error);
                            return;
                        }
                        await loadCategories();
                    }}
                >
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <span>{t('documentCategories.actions.changeStatus', { ns: 'document' })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onClick={async () => {
                        const confirmed = window.confirm(t('documentCategories.actions.confirmDelete', { ns: 'document' }));
                        if (!confirmed) {
                            return;
                        }
                        const result = await deleteDocumentCategory(item.id);
                        if (!result.success) {
                            console.error(result.error);
                            return;
                        }
                        await loadCategories();
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('documentCategories.actions.delete', { ns: 'document' })}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const appliedToLabel = useCallback((value: DocumentCategoryAppliedTo) => {
        switch (value) {
            case DocumentCategoryAppliedTo.DEPARTMENT_SPECIFIC:
                return t('documentCategories.appliedTo.departmentSpecific', { ns: 'document' });
            case DocumentCategoryAppliedTo.FOREIGN_EMPLOYEE:
                return t('documentCategories.appliedTo.foreignEmployees', { ns: 'document' });
            case DocumentCategoryAppliedTo.ALL_EMPLOYEES:
            default:
                return t('documentCategories.appliedTo.allEmployees', { ns: 'document' });
        }
    }, [t]);

    const tableRows = useMemo(
        () =>
            categories.map((category) => ({
                id: category.id,
                categoryName: category.name,
                type: category.type ?? '-',
                required: category.required
                    ? t('documentCategories.filters.yes', { ns: 'document' })
                    : t('documentCategories.filters.no', { ns: 'document' }),
                expiryDateRequired: category.expiryRequired
                    ? t('documentCategories.filters.yes', { ns: 'document' })
                    : t('documentCategories.filters.no', { ns: 'document' }),
                appliedTo: appliedToLabel(category.appliedTo),
                status: category.status,
            })),
        [categories, t, appliedToLabel],
    );

    const buildFilters = useCallback((): DocumentCategoryFilterInput | undefined => {
        const trimmedSearch = searchValue.trim();
        const filter: DocumentCategoryFilterInput = {
            ...(trimmedSearch ? { search: trimmedSearch } : {}),
            ...(filterStatus ? { status: filterStatus } : {}),
            ...(filterAppliedTo ? { appliedTo: filterAppliedTo } : {}),
            ...(filterRequired ? { required: filterRequired === 'true' } : {}),
            ...(filterExpiryRequired ? { expiryRequired: filterExpiryRequired === 'true' } : {}),
        };
        return Object.keys(filter).length ? filter : undefined;
    }, [searchValue, filterStatus, filterAppliedTo, filterRequired, filterExpiryRequired]);

    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        const offset = Math.max(0, (currentPage - 1) * pageSize);
        const filter = buildFilters();
        const result = await fetchDocumentCategoriesPaged({
            limit: pageSize,
            offset,
            filter,
        });
        setCategories(result.data || []);
        setTotalItems(result.pagination?.total ?? 0);
        setIsLoading(false);
    }, [buildFilters, currentPage, pageSize]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const [statusResult] = await Promise.all([
                fetchDocumentCategoryStatus(),
            ]);
            if (!isMounted) {
                return;
            }
            setStats(statusResult);
        };
        load();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const refreshCategories = async () => {
        await Promise.all([loadCategories(), fetchDocumentCategoryStatus().then(setStats)]);
    };

    const clearFilters = () => {
        setFilterStatus('');
        setFilterAppliedTo('');
        setFilterRequired('');
        setFilterExpiryRequired('');
        filterForm.setValue('status', allStatusValue);
        filterForm.setValue('appliedTo', allAppliedToValue);
        filterForm.setValue('required', allRequiredValue);
        filterForm.setValue('expiryRequired', allExpiryValue);
        setCurrentPage(1);
    };

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
             <AddCategorySheet
                key={isAddSheetOpen ? (editingCategory?.id ? `edit-${editingCategory.id}` : 'create') : 'closed'}
                open={isAddSheetOpen}
                onOpenChange={(open) => {
                    setIsAddSheetOpen(open);
                    if (!open) {
                        setEditingCategory(null);
                    }
                }}
                onCreated={refreshCategories}
                category={editingCategory}
                mode={editingCategory ? 'edit' : 'create'}
            />

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
                    value:
                        stat.title === 'Total categories'
                            ? stats.total
                            : stat.title === 'Required categories'
                              ? stats.required
                              : stat.title === 'Expiry date required'
                                ? stats.expiryRequired
                                : stats.active,
                    icon: stat.icon,
                    iconBgColor: stat.bgColor,
                    iconColor: stat.color,
                    borderColor: stat.borderColor,
                }))}
            />

            <div className="w-full">
                <UniversalDataTable
                    data={tableRows}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={(value) => {
                        setSearchValue(value);
                        setCurrentPage(1);
                    }}
                    searchPlaceholder={t('documentCategories.filters.searchPlaceholder', { ns: 'document' })}
                    showFilter
                    onFilterClick={() => setFiltersOpen((prev) => !prev)}
                    renderFilterPanel={
                        filtersOpen ? (
                            <div className="rounded-[8px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="category-filter-status"
                                            label={t('documentCategories.filters.status', { ns: 'document' })}
                                            placeholder={t('documentCategories.filters.allStatuses', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="status"
                                            options={[
                                                { label: t('documentCategories.filters.allStatuses', { ns: 'document' }), value: allStatusValue },
                                                { label: t('documentCategories.status.active', { ns: 'document' }), value: 'active' },
                                                { label: t('documentCategories.status.inactive', { ns: 'document' }), value: 'inactive' },
                                            ]}
                                            t={t}
                                            onChange={(value) => {
                                                setFilterStatus(value === allStatusValue ? '' : value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="category-filter-applied-to"
                                            label={t('documentCategories.filters.appliedTo', { ns: 'document' })}
                                            placeholder={t('documentCategories.appliedTo.allEmployees', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="appliedTo"
                                            options={[
                                                { label: t('documentCategories.appliedTo.allEmployees', { ns: 'document' }), value: allAppliedToValue },
                                                { label: t('documentCategories.appliedTo.allEmployees', { ns: 'document' }), value: DocumentCategoryAppliedTo.ALL_EMPLOYEES },
                                                { label: t('documentCategories.appliedTo.departmentSpecific', { ns: 'document' }), value: DocumentCategoryAppliedTo.DEPARTMENT_SPECIFIC },
                                                { label: t('documentCategories.appliedTo.foreignEmployees', { ns: 'document' }), value: DocumentCategoryAppliedTo.FOREIGN_EMPLOYEE },
                                            ]}
                                            t={t}
                                            onChange={(value) => {
                                                setFilterAppliedTo(
                                                    value === allAppliedToValue
                                                        ? ''
                                                        : (value as DocumentCategoryAppliedTo),
                                                );
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="category-filter-required"
                                            label={t('documentCategories.filters.required', { ns: 'document' })}
                                            placeholder={t('common.all', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="required"
                                            options={[
                                                { label: t('common.all', { ns: 'document' }), value: allRequiredValue },
                                                { label: t('documentCategories.filters.yes', { ns: 'document' }), value: 'true' },
                                                { label: t('documentCategories.filters.no', { ns: 'document' }), value: 'false' },
                                            ]}
                                            t={t}
                                            onChange={(value) => {
                                                setFilterRequired(value === allRequiredValue ? '' : value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="category-filter-expiry"
                                            label={t('documentCategories.filters.expiryRequired', { ns: 'document' })}
                                            placeholder={t('common.all', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="expiryRequired"
                                            options={[
                                                { label: t('common.all', { ns: 'document' }), value: allExpiryValue },
                                                { label: t('documentCategories.filters.yes', { ns: 'document' }), value: 'true' },
                                                { label: t('documentCategories.filters.no', { ns: 'document' }), value: 'false' },
                                            ]}
                                            t={t}
                                            onChange={(value) => {
                                                setFilterExpiryRequired(value === allExpiryValue ? '' : value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button variant="outline" className="h-10" onClick={clearFilters}>
                                            {t('common.clearFilters', { ns: 'document' })}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    }
                    currentPage={currentPage}
                    totalPages={Math.max(1, Math.ceil(totalItems / pageSize))}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    renderRowActions={renderRowActions}
                    totalItems={totalItems}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default DocumentCategoriesPage;
