'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Trash2, RotateCcw, ListFilter, Pencil } from 'lucide-react';
import { categoryStats } from '@/data/documents';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';
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
import DocumentCategoryFilterSection from './DocumentCategoryFilterSection';
import { cn } from '@/lib/utils';
import {
    useDeleteDocumentCategory,
    useDocumentCategoriesPaged,
    useDocumentCategoryStats,
    useUpdateDocumentCategory,
} from '@/features/documents/hooks/useDocumentCategories';
import {
    DocumentCategory,
    DocumentCategoryAppliedTo,
    DocumentCategoryFilterInput,
    DocumentCategorySortBy,
    DocumentCategorySortOrder,
} from '@/features/documents/documents.types';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';

const defaultFilters: DocumentCategoryFilterInput = {};

const mapColumnToSortBy = (column: string): DocumentCategorySortBy | null => {
    if (column === 'categoryName') return DocumentCategorySortBy.NAME;
    if (column === 'type') return DocumentCategorySortBy.TYPE;
    if (column === 'required') return DocumentCategorySortBy.REQUIRED;
    if (column === 'expiryDateRequired') return DocumentCategorySortBy.EXPIRY_REQUIRED;
    if (column === 'appliedTo') return DocumentCategorySortBy.APPLIED_TO;
    if (column === 'status') return DocumentCategorySortBy.STATUS;
    return null;
};

const resolveDeleteCategoryError = (
    t: (key: string, options?: { ns?: string }) => string,
    error?: string,
    code?: string,
): string => {
    const token = code || error || '';
    if (token === 'DOCUMENT_CATEGORY_IN_USE' || token === 'FOREIGN_KEY_VIOLATION') {
        return t('documentCategories.deleteInUseError', { ns: 'document' });
    }
    if (error && !/^[A-Z0-9_]{3,}$/.test(error)) {
        return error;
    }
    return t('documentCategories.deleteErrorDesc', { ns: 'document' });
};

const DocumentCategoriesPage = () => {
    const { t } = useTranslation(['dashboard', 'document']);
    const { toast } = useToast();
    const { hasPermission } = usePermissions();
    const canCreateCategory = hasPermission('document_categories:create');
    const canUpdateCategory = hasPermission('document_categories:update');
    const canDeleteCategory = hasPermission('document_categories:delete');
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<DocumentCategoryFilterInput>(defaultFilters);
    const [sortColumn, setSortColumn] = useState<string>('categoryName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<DocumentCategory | null>(null);

    const updateCategoryMutation = useUpdateDocumentCategory();
    const deleteCategoryMutation = useDeleteDocumentCategory();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue.trim());
            setCurrentPage(1);
        }, 350);

        return () => clearTimeout(timer);
    }, [searchValue]);

    const effectiveFilter = useMemo(
        () => ({
            ...activeFilters,
            search: debouncedSearch || undefined,
            sortBy: mapColumnToSortBy(sortColumn) ?? DocumentCategorySortBy.NAME,
            sortOrder: (sortDirection === 'asc' ? 'ASC' : 'DESC') as DocumentCategorySortOrder,
        }),
        [activeFilters, debouncedSearch, sortColumn, sortDirection],
    );

    const listParams = useMemo(
        () => ({
            page: currentPage,
            size: pageSize,
            filter: effectiveFilter,
        }),
        [currentPage, pageSize, effectiveFilter],
    );

    const statsQuery = useDocumentCategoryStats();
    const listQuery = useDocumentCategoriesPaged(listParams);

    const categories = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data]);
    const totalItems = listQuery.data?.metaData.total ?? 0;
    const totalPages = listQuery.data?.metaData.totalPages ?? 0;
    const stats = statsQuery.data ?? {
        total: 0,
        required: 0,
        expiryRequired: 0,
        active: 0,
    };

    const activeFilterCount = useMemo(
        () =>
            Object.entries(activeFilters).filter(
                ([key, value]) => key !== 'search' && value !== undefined && value !== '',
            ).length,
        [activeFilters],
    );

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

    const typeLabel = useCallback((value?: string | null) => {
        const normalized = (value ?? '').trim().toLowerCase();
        if (normalized === 'employment') {
            return t('addCategorySheet.typeOptions.employment', { ns: 'document' });
        }
        if (normalized === 'educational') {
            return t('addCategorySheet.typeOptions.educational', { ns: 'document' });
        }
        if (normalized === 'identification') {
            return t('addCategorySheet.typeOptions.identification', { ns: 'document' });
        }
        return value ?? '-';
    }, [t]);

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
                type: typeLabel(category.type),
                required: category.required
                    ? t('documentCategories.filters.yes', { ns: 'document' })
                    : t('documentCategories.filters.no', { ns: 'document' }),
                expiryDateRequired: category.expiryRequired
                    ? t('documentCategories.filters.yes', { ns: 'document' })
                    : t('documentCategories.filters.no', { ns: 'document' }),
                appliedTo: appliedToLabel(category.appliedTo),
                status: category.status,
            })),
        [categories, t, appliedToLabel, typeLabel],
    );

    const handleStatusChange = (category: DocumentCategory) => {
        const nextStatus = category.status === 'active' ? 'inactive' : 'active';
        updateCategoryMutation.mutate(
            {
                id: category.id,
                input: { status: nextStatus },
                listParams,
                previous: category,
            },
            {
                onSuccess: () => {
                    toast({
                        title: t('documentCategories.statusUpdateSuccess', { ns: 'document' }),
                        description: t('documentCategories.statusUpdateSuccessDesc', {
                            ns: 'document',
                            name: category.name,
                            status: t(`documentCategories.status.${nextStatus}`, { ns: 'document' }),
                        }),
                    });
                },
                onError: (error) => {
                    toast({
                        title: t('documentCategories.statusUpdateError', { ns: 'document' }),
                        description: error.message,
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleApplyFilters = (filters: DocumentCategoryFilterInput) => {
        setActiveFilters(filters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchValue('');
        setDebouncedSearch('');
        setActiveFilters(defaultFilters);
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

    const handleDeleteClick = (category: DocumentCategory) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!categoryToDelete?.id) {
            return;
        }

        deleteCategoryMutation.mutate(
            {
                id: categoryToDelete.id,
                deleted: categoryToDelete,
                listParams,
            },
            {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
                    toast({
                        title: t('documentCategories.deleteSuccess', { ns: 'document' }),
                        description: t('documentCategories.deleteSuccessDesc', { ns: 'document' }),
                        variant: 'success',
                    });
                },
                onError: (error) => {
                    toast({
                        title: t('documentCategories.deleteError', { ns: 'document' }),
                        description: resolveDeleteCategoryError(t, error.message),
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const renderRowActions = (item: { id: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {canUpdateCategory && (
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
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                        <span>{t('documentCategories.actions.edit', { ns: 'document' })}</span>
                    </DropdownMenuItem>
                )}
                {canUpdateCategory && (
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => {
                            const category = categories.find((entry) => entry.id === item.id);
                            if (!category) {
                                return;
                            }
                            handleStatusChange(category);
                        }}
                    >
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <span>{t('documentCategories.actions.changeStatus', { ns: 'document' })}</span>
                    </DropdownMenuItem>
                )}
                {canDeleteCategory && (
                    <DropdownMenuItem
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => {
                            const category = categories.find((entry) => entry.id === item.id);
                            if (!category) {
                                return;
                            }
                            handleDeleteClick(category);
                        }}
                    >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('documentCategories.actions.delete', { ns: 'document' })}</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

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
                listParams={listParams}
                category={editingCategory}
                mode={editingCategory ? 'edit' : 'create'}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={(open) => {
                    setIsDeleteModalOpen(open);
                    if (!open) {
                        setCategoryToDelete(null);
                    }
                }}
                title={t('documentCategories.deleteConfirmTitle', { ns: 'document' })}
                message={t('documentCategories.deleteConfirmMessage', {
                    ns: 'document',
                    name: categoryToDelete?.name ?? '',
                })}
                confirmLabel={t('documentCategories.actions.delete', { ns: 'document' })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteCategoryMutation.isPending}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('documentData.documentCategories.title')}
                </h1>
                {canCreateCategory && (
                    <Button
                        onClick={() => setIsAddSheetOpen(true)}
                        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-white transition-all hover:bg-primary/90 active:scale-95 sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="truncate">{t('documentData.documentCategories.addCategory')}</span>
                    </Button>
                )}
            </div>

            {statsQuery.isLoading ? (
                <SummaryStatListSkeleton count={4} />
            ) : (
                <SummaryStatList
                    stats={categoryStats.map((stat) => {
                        const values: Record<string, number> = {
                            total: stats.total,
                            required: stats.required,
                            expiryRequired: stats.expiryRequired,
                            active: stats.active,
                        };

                        return {
                            title: t(`documentData.documentCategories.stats.${stat.key}`),
                            value: values[stat.key] ?? 0,
                            icon: stat.icon,
                            iconBgColor: stat.bgColor,
                            iconColor: stat.color,
                            borderColor: stat.borderColor,
                        };
                    })}
                />
            )}

            <div className="w-full">
                <UniversalDataTable
                    data={tableRows}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder={t('documentCategories.filters.searchPlaceholder', { ns: 'document' })}
                    renderCustomFilter={(
                        <Button
                            variant="outline"
                            size="default"
                            className={cn('h-10 gap-2 border-input', showFilters && 'bg-black/5 dark:bg-white/5')}
                            onClick={() => setShowFilters((prev) => !prev)}
                        >
                            <ListFilter className="h-4 w-4" />
                            <span>{t('attendance.filter', { ns: 'dashboard', defaultValue: 'Filter' })}</span>
                            {activeFilterCount > 0 ? (
                                <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-semibold">
                                    {activeFilterCount}
                                </span>
                            ) : null}
                        </Button>
                    )}
                    renderFilterPanel={(
                        <DocumentCategoryFilterSection
                            isVisible={showFilters}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            initialFilters={activeFilters}
                        />
                    )}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    currentPage={currentPage}
                    totalPages={Math.max(1, totalPages)}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    renderRowActions={renderRowActions}
                    totalItems={totalItems}
                    isLoading={listQuery.isLoading}
                />
            </div>
        </div>
    );
};

export default DocumentCategoriesPage;
