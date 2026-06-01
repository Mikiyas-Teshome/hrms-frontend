'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Edit, Trash2, Download, Check, ChevronsUpDown, CalendarIcon } from 'lucide-react';
import { documentStats } from '@/data/documents';
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
import { formatDateString } from '@/lib/date-utils';
import {
        fetchEmployeeDocuments,
        fetchEmployeeDocumentStats,
    fetchDocumentCategories,
    fetchDocumentDownloadUrl,
    deleteEmployeeDocument,
    updateEmployeeDocument,
} from '@/features/documents/documents.actions';
import {
        DocumentComplianceStatus,
        DocumentApprovalState,
        EmployeeDocumentRow,
        EmployeeDocumentStats,
    DocumentCategory,
} from '@/features/documents/documents.types';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { fetchEmployeeDirectory } from '@/features/employee/employee.actions';
import { EmployeeDirectoryEntry } from '@/features/employee/employee.types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/FormSelect';

type DocumentFiltersState = {
    ownerId: string;
    categoryId: string;
    status: DocumentComplianceStatus | '';
    approvalState: DocumentApprovalState | '';
};

type DocumentModalState = {
    selectedDocId: string | null;
    open: boolean;
    mode: 'view' | 'edit';
    form: {
        categoryId: string;
        expiryDate: string;
        approvalState: DocumentApprovalState | '';
    };
};

const defaultFilters: DocumentFiltersState = {
    ownerId: '',
    categoryId: '',
    status: '',
    approvalState: '',
};

const defaultModalState: DocumentModalState = {
    selectedDocId: null,
    open: false,
    mode: 'view',
    form: {
        categoryId: '',
        expiryDate: '',
        approvalState: '',
    },
};

const EmployeeDocumentsPage = () => {
    const { t } = useTranslation(['dashboard', 'document']);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [documents, setDocuments] = useState<EmployeeDocumentRow[]>([]);
    const [stats, setStats] = useState<EmployeeDocumentStats | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [employees, setEmployees] = useState<EmployeeDirectoryEntry[]>([]);
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [employeeFilterOpen, setEmployeeFilterOpen] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [filters, setFilters] = useState<DocumentFiltersState>(defaultFilters);
    const [modalState, setModalState] = useState<DocumentModalState>(defaultModalState);
    const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string | number>>(new Set());
    const allCategoryValue = '__all__';
    const allStatusValue = '__all__';
    const allApprovalValue = '__all__';
    const filterForm = useForm({
        defaultValues: {
            categoryId: allCategoryValue,
            status: allStatusValue,
            approvalState: allApprovalValue,
        },
    });
    const modalForm = useForm<{ approvalState: string; categoryId: string }>({
        defaultValues: { approvalState: '__none__', categoryId: '' },
    });

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
        filterForm.setValue('categoryId', allCategoryValue);
        filterForm.setValue('status', allStatusValue);
        filterForm.setValue('approvalState', allApprovalValue);
        setCurrentPage(1);
    };

    const handleCategoryChange = (value: string) => {
        setFilters((prev) => ({ ...prev, categoryId: value === allCategoryValue ? '' : value }));
        setCurrentPage(1);
    };

    const handleStatusChange = (value: string) => {
        setFilters((prev) => ({ ...prev, status: value === allStatusValue ? '' : (value as DocumentComplianceStatus) }));
        setCurrentPage(1);
    };

    const handleApprovalChange = (value: string) => {
        setFilters((prev) => ({ ...prev, approvalState: value === allApprovalValue ? '' : (value as DocumentApprovalState) }));
        setCurrentPage(1);
    };

    const handleEmployeeFilterOpenChange = (open: boolean) => {
        setEmployeeFilterOpen(open);
        if (!open) {
            setEmployeeSearch('');
        }
    };

    const loadStats = useCallback(async () => {
        const result = await fetchEmployeeDocumentStats();
        setStats(result);
    }, []);

    const loadFilterOptions = useCallback(async () => {
        const [employeeResult, categoryResult] = await Promise.all([
            fetchEmployeeDirectory(),
            fetchDocumentCategories(),
        ]);
        setEmployees(employeeResult);
        setCategories(categoryResult);
    }, []);

    const loadDocuments = useCallback(async () => {
        setIsLoading(true);
        const trimmedSearch = searchValue.trim();
        const offset = Math.max(0, (currentPage - 1) * pageSize);
        const filter = {
            ...(trimmedSearch ? { search: trimmedSearch } : {}),
            ...(filters.ownerId ? { ownerId: filters.ownerId } : {}),
            ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.approvalState ? { approvalState: filters.approvalState } : {}),
        };
        const result = await fetchEmployeeDocuments({
            limit: pageSize,
            offset,
            filter: Object.keys(filter).length ? filter : undefined,
        });
        setDocuments(result.data || []);
        setTotalItems(result.pagination?.total ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 1);
        setIsLoading(false);
    }, [currentPage, pageSize, searchValue, filters]);

    useEffect(() => {
        let isMounted = true;
        Promise.resolve().then(() => {
            if (isMounted) {
                loadStats();
            }
        });
        return () => {
            isMounted = false;
        };
    }, [loadStats]);

    useEffect(() => {
        let isMounted = true;
        Promise.resolve().then(() => {
            if (isMounted) {
                loadFilterOptions();
            }
        });
        return () => {
            isMounted = false;
        };
    }, [loadFilterOptions]);

    useEffect(() => {
        let isMounted = true;
        Promise.resolve().then(() => {
            if (isMounted) {
                loadDocuments();
            }
        });
        return () => {
            isMounted = false;
        };
    }, [loadDocuments]);

    const getComplianceMeta = useCallback((status?: DocumentComplianceStatus) => {
        switch (status) {
            case DocumentComplianceStatus.COMPLIANT:
                return {
                    label: t('employeeDocuments.compliance.compliant', { ns: 'document' }),
                    className: 'bg-green-500/10 text-green-600 border-green-500/20',
                    dotClassName: 'bg-green-500',
                };
            case DocumentComplianceStatus.NEAR_EXPIRE:
                return {
                    label: t('employeeDocuments.compliance.nearExpiry', { ns: 'document' }),
                    className: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
                    dotClassName: 'bg-amber-500',
                };
            case DocumentComplianceStatus.MISSING:
                return {
                    label: t('employeeDocuments.compliance.missing', { ns: 'document' }),
                    className: 'bg-red-500/10 text-red-600 border-red-500/20',
                    dotClassName: 'bg-red-500',
                };
            case DocumentComplianceStatus.EXPIRED:
            default:
                return {
                    label: t('employeeDocuments.compliance.expired', { ns: 'document' }),
                    className: 'bg-red-500/10 text-red-600 border-red-500/20',
                    dotClassName: 'bg-red-500',
                };
        }
    }, [t]);

    const employeeOptions = useMemo(
        () =>
            employees.map((employee) => ({
                id: employee.id,
                label: `${employee.firstName} ${employee.lastName}`.trim(),
            })),
        [employees],
    );

    const visibleEmployeeOptions = useMemo(() => {
        const query = employeeSearch.trim().toLowerCase();
        if (!query) {
            return employeeOptions.slice(0, 5);
        }
        return employeeOptions.filter((employee) => employee.label.toLowerCase().includes(query));
    }, [employeeOptions, employeeSearch]);

    const selectedEmployeeLabel = useMemo(
        () => employeeOptions.find((employee) => employee.id === filters.ownerId)?.label,
        [employeeOptions, filters.ownerId],
    );

    const tableRows = useMemo(
        () =>
            documents.map((doc) => ({
                id: doc.id,
                employee: doc.ownerName,
                category: doc.categoryName,
                documentName: doc.documentName,
                expiryDate: doc.expiryDate ? formatDateString(doc.expiryDate) : '-',
                compliance: getComplianceMeta(doc.compliance).label,
                complianceStatus: doc.compliance,
                approvalState: doc.approvalState,
                uploadedBy: doc.uploadedBy,
            })),
        [documents, getComplianceMeta],
    );

    const documentById = useMemo(() => {
        const map = new Map<string, EmployeeDocumentRow>();
        for (const doc of documents) {
            map.set(doc.id, doc);
        }
        return map;
    }, [documents]);

    // State initialization is handled directly inside row action handlers to avoid cascading render effects.

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
            render: (item) => (
                <div className="max-w-57.5 truncate" title={item.documentName}>
                    {item.documentName}
                </div>
            ),
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
                (() => {
                    const meta = getComplianceMeta(item.complianceStatus);
                    return (
                <Badge 
                    variant="outline" 
                    className={meta.className}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${meta.dotClassName} mr-1.5`} />
                    {meta.label}
                </Badge>
                    );
                })()
            )
        },
        {
            key: 'approvalState',
            label: t('employeeDocuments.table.approval', { ns: 'document' }),
            render: (item) => <span className="capitalize">{item.approvalState || '-'}</span>,
            sortable: true,
        },
        {
            key: 'uploadedBy',
            label: t('documentData.employeeDocuments.table.uploadedBy'),
            sortable: true,
        }
    ];

    const handleDownload = async (id: string) => {
        const result = await fetchDocumentDownloadUrl(id);
        if (!result.success) {
            console.error(result.error);
            return;
        }
        window.open(result.data, '_blank', 'noopener,noreferrer');
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(t('employeeDocuments.actions.confirmDelete', { ns: 'document' }));
        if (!confirmed) {
            return;
        }
        const result = await deleteEmployeeDocument(id);
        if (!result.success) {
            console.error(result.error);
            return;
        }
        await loadDocuments();
        await loadStats();
    };

    const renderRowActions = (item: { id: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleOpenView(item.id)}>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{t('employeeDocuments.actions.view', { ns: 'document' })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleOpenEdit(item.id)}>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <span>{t('employeeDocuments.actions.edit', { ns: 'document' })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleDownload(item.id)}>
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span>{t('employeeDocuments.actions.download', { ns: 'document' })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span>{t('employeeDocuments.actions.delete', { ns: 'document' })}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const handleOpenView = (id: string) => {
        const doc = documentById.get(id);
        if (!doc) {
            return;
        }
        setModalState({
            selectedDocId: id,
            open: true,
            mode: 'view',
            form: {
                categoryId: doc.categoryId || '',
                expiryDate: doc.expiryDate ?? '',
                approvalState: (doc as any).approvalState || '',
            },
        });
        modalForm.setValue('categoryId', doc.categoryId || '');
        modalForm.setValue('approvalState', (doc as any).approvalState || '__none__');
    };

    const handleOpenEdit = (id: string) => {
        const doc = documentById.get(id);
        if (!doc) {
            return;
        }
        setModalState({
            selectedDocId: id,
            open: true,
            mode: 'edit',
            form: {
                categoryId: doc.categoryId || '',
                expiryDate: doc.expiryDate ?? '',
                approvalState: (doc as any).approvalState || '',
            },
        });
        modalForm.setValue('categoryId', doc.categoryId || '');
        modalForm.setValue('approvalState', (doc as any).approvalState || '__none__');
    };

    const handleModalSave = async (id: string, input: any) => {
        const result = await updateEmployeeDocument(id, input);
        if (!result.success) {
            console.error(result.error);
            return false;
        }
        await loadDocuments();
        await loadStats();
        return true;
    };

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <UploadDocumentModal
                open={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                onUploaded={() => {
                    loadStats();
                    loadDocuments();
                }}
            />

            <Sheet open={modalState.open} onOpenChange={(open) => setModalState((prev) => ({ ...prev, open }))}>
                <SheetContent className="sm:max-w-150 overflow-y-auto p-0">
                    <SheetHeader className="p-6 pb-2">
                        <SheetTitle>{modalState.mode === 'view' ? t('employeeDocuments.modal.viewTitle', { ns: 'document' }) : t('employeeDocuments.modal.editTitle', { ns: 'document' })}</SheetTitle>
                        <SheetDescription />
                    </SheetHeader>
                    {modalState.selectedDocId ? (() => {
                        const doc = documentById.get(modalState.selectedDocId);
                        if (!doc) return <div>{t('employeeDocuments.modal.notFound', { ns: 'document' })}</div>;
                        if (modalState.mode === 'view') {
                            return (
                                <>
                                    <div className="grid gap-4 px-6 pb-6 pt-2">
                                        <div>
                                            <div className="text-sm font-medium">{t('employeeDocuments.modal.fields.name', { ns: 'document' })}</div>
                                            <div>{doc.documentName}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{t('employeeDocuments.modal.fields.employee', { ns: 'document' })}</div>
                                            <div>{doc.ownerName}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{t('employeeDocuments.modal.fields.category', { ns: 'document' })}</div>
                                            <div>{doc.categoryName}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{t('employeeDocuments.modal.fields.expiry', { ns: 'document' })}</div>
                                            <div>{doc.expiryDate ? formatDateString(doc.expiryDate) : '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{t('employeeDocuments.modal.fields.compliance', { ns: 'document' })}</div>
                                            <div>{doc.compliance}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{t('employeeDocuments.modal.fields.approval', { ns: 'document' })}</div>
                                            <div>{doc.approvalState || '-'}</div>
                                        </div>
                                    </div>
                                    <SheetFooter className="px-6 pb-8 bg-transparent flex flex-row justify-end gap-3">
                                        <Button variant="ghost" onClick={() => setModalState((prev) => ({ ...prev, open: false }))}>{t('common.close', { ns: 'document' })}</Button>
                                    </SheetFooter>
                                </>
                            );
                        }

                        // edit mode
                        return (
                            <>
                                <div className="grid gap-4 px-6 pb-6 pt-2">
                                    <div>
                                        <div className="text-sm font-medium">{t('employeeDocuments.modal.fields.name', { ns: 'document' })}</div>
                                        <div>{doc.documentName}</div>
                                    </div>
                                    <div>
                                        <FormSelect
                                            id="modal-category"
                                            label={t('employeeDocuments.modal.fields.category', { ns: 'document' })}
                                            control={modalForm.control}
                                            name="categoryId"
                                            options={categories.map((c) => ({ value: c.id, label: c.name }))}
                                            t={t}
                                            onChange={(value) => setModalState((prev) => ({ ...prev, form: { ...prev.form, categoryId: value } }))}
                                            containerClassName="flex flex-col gap-1.5"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{t('employeeDocuments.modal.fields.expiry', { ns: 'document' })}</div>
                                        <div className="relative">
                                            <Input
                                                value={modalState.form.expiryDate ?? ''}
                                                onChange={(event) => setModalState((prev) => ({ ...prev, form: { ...prev.form, expiryDate: event.target.value } }))}
                                                type="date"
                                                className="h-10 pl-10"
                                            />
                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div>
                                        <FormSelect
                                            id="modal-approval-state"
                                            label={t('employeeDocuments.modal.fields.approval', { ns: 'document' })}
                                            control={modalForm.control}
                                            name="approvalState"
                                            options={[
                                                { value: '__none__', label: t('common.none', { ns: 'document' }) },
                                                { value: DocumentApprovalState.PENDING, label: t('employeeDocuments.approval.pending', { ns: 'document' }) },
                                                { value: DocumentApprovalState.APPROVED, label: t('employeeDocuments.approval.approved', { ns: 'document' }) },
                                                { value: DocumentApprovalState.REJECTED, label: t('employeeDocuments.approval.rejected', { ns: 'document' }) },
                                            ]}
                                            t={t}
                                            onChange={(value) => {
                                                setModalState((prev) => ({ ...prev, form: { ...prev.form, approvalState: value === '__none__' ? '' : (value as DocumentApprovalState) } }));
                                            }}
                                            containerClassName="flex flex-col gap-1.5"
                                        />
                                    </div>
                                </div>
                                <SheetFooter className="px-6 pb-8 bg-transparent flex flex-row justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setModalState((prev) => ({ ...prev, open: false }))}>{t('common.cancel', { ns: 'document' })}</Button>
                                    <Button onClick={async () => {
                                        if (!modalState.selectedDocId) return;
                                        const input: any = {};
                                        if (modalState.form.categoryId) input.categoryId = modalState.form.categoryId;
                                        if (modalState.form.expiryDate) input.expiryDate = modalState.form.expiryDate;
                                        if (modalState.form.approvalState) input.approvalState = modalState.form.approvalState;
                                        const ok = await handleModalSave(modalState.selectedDocId, input);
                                        if (ok) setModalState((prev) => ({ ...prev, open: false }));
                                    }}>{t('common.save', { ns: 'document' })}</Button>
                                </SheetFooter>
                            </>
                        );
                    })() : null}
                </SheetContent>
            </Sheet>

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
                stats={documentStats.map((stat) => {
                    const statKey =
                        stat.title === 'Compliant employees'
                            ? 'compliant'
                            : stat.title === 'Employee missing documents'
                            ? 'missing'
                            : stat.title === 'Expired documents'
                            ? 'expired'
                            : 'nearExpire';
                    const values: Record<string, number> = {
                        compliant: stats?.compliant ?? 0,
                        missing: stats?.missing ?? 0,
                        expired: stats?.expired ?? 0,
                        nearExpire: stats?.nearExpire ?? 0,
                    };

                    return {
                        title: t(`documentData.employeeDocuments.stats.${
                            statKey === 'compliant'
                                ? 'compliant'
                                : statKey === 'missing'
                                ? 'missing'
                                : statKey === 'expired'
                                ? 'expired'
                                : 'nearExpiry'
                        }`),
                        value: values[statKey],
                        icon: stat.icon,
                        iconBgColor: stat.bgColor,
                        iconColor: stat.color,
                        borderColor: stat.borderColor,
                    };
                })}
            />

            <div className="w-full">
                <UniversalDataTable
                    data={tableRows}
                    columns={columns}
                    enableSelection
                    selectedIds={selectedDocumentIds}
                    onSelectionChange={setSelectedDocumentIds}
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder={t('employeeDocuments.filters.searchPlaceholder', { ns: 'document' })}
                    showFilter
                    onFilterClick={() => setFiltersOpen((prev) => !prev)}
                    renderFilterPanel={
                        filtersOpen ? (
                            <div className="rounded-[8px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-foreground">{t('employeeDocuments.filters.employee', { ns: 'document' })}</span>
                                        <Popover open={employeeFilterOpen} onOpenChange={handleEmployeeFilterOpenChange}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={employeeFilterOpen}
                                                    className={cn(
                                                        'w-full justify-between font-normal h-10 px-4 rounded-[8px] bg-background border border-input',
                                                        !filters.ownerId && 'text-muted-foreground',
                                                    )}
                                                >
                                                    {selectedEmployeeLabel || t('employeeDocuments.filters.allEmployees', { ns: 'document' })}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                <Command>
                                                    <CommandInput
                                                        placeholder={t('employeeDocuments.filters.searchEmployee', { ns: 'document' })}
                                                        value={employeeSearch}
                                                        onValueChange={setEmployeeSearch}
                                                    />
                                                    <CommandList className="max-h-60">
                                                        <CommandEmpty>{t('employeeDocuments.filters.noEmployeeFound', { ns: 'document' })}</CommandEmpty>
                                                        <CommandGroup>
                                                            <CommandItem
                                                                value={t('employeeDocuments.filters.allEmployees', { ns: 'document' })}
                                                                onSelect={() => {
                                                                    setFilters((prev) => ({ ...prev, ownerId: '' }));
                                                                    setEmployeeFilterOpen(false);
                                                                    setCurrentPage(1);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        !filters.ownerId ? 'opacity-100' : 'opacity-0',
                                                                    )}
                                                                />
                                                                {t('employeeDocuments.filters.allEmployees', { ns: 'document' })}
                                                            </CommandItem>
                                                            {visibleEmployeeOptions.map((employee) => (
                                                                <CommandItem
                                                                    key={employee.id}
                                                                    value={employee.label}
                                                                    onSelect={() => {
                                                                        setFilters((prev) => ({ ...prev, ownerId: employee.id }));
                                                                        setEmployeeFilterOpen(false);
                                                                        setCurrentPage(1);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4',
                                                                            filters.ownerId === employee.id ? 'opacity-100' : 'opacity-0',
                                                                        )}
                                                                    />
                                                                    {employee.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="employee-documents-filter-category"
                                            label={t('employeeDocuments.filters.category', { ns: 'document' })}
                                            placeholder={t('employeeDocuments.filters.allCategories', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="categoryId"
                                            options={[
                                                { label: t('employeeDocuments.filters.allCategories', { ns: 'document' }), value: allCategoryValue },
                                                ...categories.map((category) => ({ label: category.name, value: category.id })),
                                            ]}
                                            t={t as (key: string) => string}
                                            onChange={handleCategoryChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="employee-documents-filter-status"
                                            label={t('employeeDocuments.filters.status', { ns: 'document' })}
                                            placeholder={t('employeeDocuments.filters.allStatuses', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="status"
                                            options={[
                                                { label: t('employeeDocuments.filters.allStatuses', { ns: 'document' }), value: allStatusValue },
                                                { label: t('employeeDocuments.compliance.compliant', { ns: 'document' }), value: DocumentComplianceStatus.COMPLIANT },
                                                { label: t('employeeDocuments.compliance.nearExpiry', { ns: 'document' }), value: DocumentComplianceStatus.NEAR_EXPIRE },
                                                { label: t('employeeDocuments.compliance.missing', { ns: 'document' }), value: DocumentComplianceStatus.MISSING },
                                                { label: t('employeeDocuments.compliance.expired', { ns: 'document' }), value: DocumentComplianceStatus.EXPIRED },
                                            ]}
                                            t={t as (key: string) => string}
                                            onChange={handleStatusChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="employee-documents-filter-approval"
                                            label={t('employeeDocuments.filters.approval', { ns: 'document' })}
                                            placeholder={t('common.all', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="approvalState"
                                            options={[
                                                { label: t('common.all', { ns: 'document' }), value: allApprovalValue },
                                                { label: t('employeeDocuments.approval.pending', { ns: 'document' }), value: DocumentApprovalState.PENDING },
                                                { label: t('employeeDocuments.approval.approved', { ns: 'document' }), value: DocumentApprovalState.APPROVED },
                                                { label: t('employeeDocuments.approval.rejected', { ns: 'document' }), value: DocumentApprovalState.REJECTED },
                                            ]}
                                            t={t as (key: string) => string}
                                            onChange={handleApprovalChange}
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <Button
                                            variant="outline"
                                            className="h-10"
                                            onClick={clearFilters}
                                        >
                                            {t('common.clearFilters', { ns: 'document' })}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : null
                    }
                    currentPage={currentPage}
                    totalPages={totalPages}
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

export default EmployeeDocumentsPage;
