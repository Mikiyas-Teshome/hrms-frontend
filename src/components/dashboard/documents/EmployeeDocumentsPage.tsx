'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, ListFilter } from 'lucide-react';
import { documentStats } from '@/data/documents';
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
import UploadEmployeeDocumentSheet from './UploadEmployeeDocumentSheet';
import EmployeeDocumentFilterSection from './EmployeeDocumentFilterSection';
import { formatDateString } from '@/lib/date-utils';
import { fetchDocumentCategories } from '@/features/documents/documents.actions';
import {
    DocumentComplianceStatus,
    EmployeeDocumentOwnerFilterInput,
    EmployeeDocumentOwnerSortBy,
    EmployeeDocumentSortOrder,
    DocumentCategory,
} from '@/features/documents/documents.types';
import { fetchEmployeeDirectory } from '@/features/employee/employee.actions';
import { EmployeeDirectoryEntry } from '@/features/employee/employee.types';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
    employeeDocumentQueryKeys,
    useEmployeeDocumentOwnersPaged,
    useEmployeeDocumentStats,
} from '@/features/documents/hooks/useEmployeeDocuments';
import {
    canCreateEmployeeDocument,
    canUploadDocumentsForOthers,
    isDocumentsOwnScopeOnly,
} from '@/features/documents/document-permission.util';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import EmployeeDocumentsByOwnerPage from './EmployeeDocumentsByOwnerPage';
import EmployeeDocumentsSelfViewLoading from './EmployeeDocumentsSelfViewLoading';

const defaultFilters: EmployeeDocumentOwnerFilterInput = {};

const mapColumnToSortBy = (column: string): EmployeeDocumentOwnerSortBy | null => {
    if (column === 'employee') return EmployeeDocumentOwnerSortBy.OWNER_NAME;
    if (column === 'documentCount') return EmployeeDocumentOwnerSortBy.DOCUMENT_COUNT;
    if (column === 'compliance') return EmployeeDocumentOwnerSortBy.OVERALL_COMPLIANCE;
    if (column === 'pendingApprovals') return EmployeeDocumentOwnerSortBy.PENDING_APPROVAL_COUNT;
    if (column === 'nearestExpiry') return EmployeeDocumentOwnerSortBy.NEAREST_EXPIRY;
    return null;
};

const EmployeeDocumentsPage = () => {
    const { t, i18n } = useTranslation(['dashboard', 'document']);
    const router = useRouter();
    const queryClient = useQueryClient();
    const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadSessionKey, setUploadSessionKey] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<EmployeeDocumentOwnerFilterInput>(defaultFilters);
    const [sortColumn, setSortColumn] = useState<string>('employee');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [employees, setEmployees] = useState<EmployeeDirectoryEntry[]>([]);
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [selectedOwnerIds, setSelectedOwnerIds] = useState<Set<string | number>>(new Set());
    const { canSelectTenantCompany, hasPermission, hasScope, isSystemAdmin } = usePermissions();
    const canCreateDocument = canCreateEmployeeDocument(hasPermission, hasScope, isSystemAdmin);
    const isOwnScopeOnly = isDocumentsOwnScopeOnly(hasScope, isSystemAdmin);
    const canUploadForOthers = canUploadDocumentsForOthers(hasScope, isSystemAdmin);
    const profileQuery = useMyEmployeeProfile({ enabled: isOwnScopeOnly });
    const selfUploadProfileQuery = useMyEmployeeProfile({
        enabled: canCreateDocument && !canUploadForOthers && !isOwnScopeOnly,
    });

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
            sortBy: mapColumnToSortBy(sortColumn) ?? EmployeeDocumentOwnerSortBy.OWNER_NAME,
            sortOrder: (sortDirection === 'asc' ? 'ASC' : 'DESC') as EmployeeDocumentSortOrder,
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

    const statsQuery = useEmployeeDocumentStats({
        enabled: canSelectTenantCompany && !isOwnScopeOnly,
    });
    const listQuery = useEmployeeDocumentOwnersPaged(listParams, { enabled: !isOwnScopeOnly });

    const owners = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data]);
    const totalItems = listQuery.data?.metaData.total ?? 0;
    const totalPages = listQuery.data?.metaData.totalPages ?? 0;
    const stats = statsQuery.data ?? {
        compliant: 0,
        expired: 0,
        missing: 0,
        nearExpire: 0,
    };

    const activeFilterCount = useMemo(
        () =>
            Object.entries(activeFilters).filter(
                ([key, value]) => key !== 'search' && value !== undefined && value !== '',
            ).length,
        [activeFilters],
    );

    const refreshList = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: employeeDocumentQueryKeys.ownersPaged(listParams) });
        queryClient.invalidateQueries({ queryKey: employeeDocumentQueryKeys.stats });
    }, [queryClient, listParams]);

    useEffect(() => {
        if (isOwnScopeOnly) {
            let isMounted = true;
            void fetchDocumentCategories().then((categoryResult) => {
                if (isMounted) {
                    setCategories(categoryResult);
                }
            });
            return () => {
                isMounted = false;
            };
        }

        let isMounted = true;
        Promise.resolve().then(async () => {
            const [employeeResult, categoryResult] = await Promise.all([
                fetchEmployeeDirectory(),
                fetchDocumentCategories(),
            ]);
            if (isMounted) {
                setEmployees(employeeResult);
                setCategories(categoryResult);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [isOwnScopeOnly]);

    const handleApplyFilters = (filters: EmployeeDocumentOwnerFilterInput) => {
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

    const handleOpenOwnerPage = (ownerId: string, ownerName: string) => {
        const params = new URLSearchParams({ name: ownerName });
        router.push(`/dashboard/documents/employee-documents/${ownerId}?${params.toString()}`);
    };

    const tableRows = useMemo(
        () =>
            owners.map((owner) => ({
                id: owner.ownerId,
                employee: owner.ownerName,
                documentCount: owner.documentCount,
                complianceStatus: owner.overallCompliance,
                compliance: getComplianceMeta(owner.overallCompliance).label,
                pendingApprovals: owner.pendingApprovalCount,
                nearestExpiry: owner.nearestExpiryDate
                    ? formatDateString(owner.nearestExpiryDate, dateLocale)
                    : '-',
            })),
        [owners, getComplianceMeta, dateLocale],
    );

    const columns: ColumnConfig<(typeof tableRows)[number]>[] = [
        {
            key: 'employee',
            label: t('documentData.employeeDocuments.table.employee'),
            sortable: true,
        },
        {
            key: 'documentCount',
            label: t('documentData.employeeDocuments.table.documentCount'),
            sortable: true,
        },
        {
            key: 'compliance',
            label: t('documentData.employeeDocuments.table.compliance'),
            sortable: true,
            render: (item) => {
                const meta = getComplianceMeta(item.complianceStatus);
                return (
                    <Badge variant="outline" className={meta.className}>
                        <div className={`mr-1.5 h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
                        {meta.label}
                    </Badge>
                );
            },
        },
        {
            key: 'pendingApprovals',
            label: t('documentData.employeeDocuments.table.pendingApprovals'),
            sortable: true,
        },
        {
            key: 'nearestExpiry',
            label: t('documentData.employeeDocuments.table.expiryDate'),
            sortable: true,
        },
    ];

    if (isOwnScopeOnly) {
        if (profileQuery.isLoading) {
            return <EmployeeDocumentsSelfViewLoading showUploadButton={canCreateDocument} />;
        }

        if (!profileQuery.data?.id) {
            return (
                <div className="flex w-full flex-col gap-8 duration-500 animate-in fade-in">
                    <UploadEmployeeDocumentSheet
                        key={uploadSessionKey}
                        open={isUploadModalOpen}
                        onOpenChange={setIsUploadModalOpen}
                        onUploaded={() => profileQuery.refetch()}
                    />
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <h1 className="text-2xl font-bold leading-8 tracking-tight text-foreground">
                            {t('employeeDocuments.myDocuments.title', { ns: 'document' })}
                        </h1>
                        {canCreateDocument && (
                            <Button
                                onClick={() => {
                                    setUploadSessionKey((current) => current + 1);
                                    setIsUploadModalOpen(true);
                                }}
                                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-white transition-all hover:bg-primary/90 active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                <span>
                                    {t('employeeDocuments.myDocuments.uploadDocument', { ns: 'document' })}
                                </span>
                            </Button>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t('employeeDocuments.myDocuments.empty', { ns: 'document' })}
                    </p>
                </div>
            );
        }

        const ownerDisplayName =
            `${profileQuery.data.firstName} ${profileQuery.data.lastName}`.trim();

        return (
            <EmployeeDocumentsByOwnerPage
                ownerId={profileQuery.data.id}
                isSelfView
                ownerDisplayName={ownerDisplayName}
            />
        );
    }

    const renderRowActions = (item: (typeof tableRows)[number]) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => handleOpenOwnerPage(item.id, item.employee)}
                >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{t('employeeDocuments.actions.viewDocuments', { ns: 'document' })}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex w-full flex-col gap-8 duration-500 animate-in fade-in">
            <UploadEmployeeDocumentSheet
                key={uploadSessionKey}
                open={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                onUploaded={refreshList}
                defaultOwnerId={
                    !canUploadForOthers ? selfUploadProfileQuery.data?.id : undefined
                }
            />

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold leading-8 tracking-tight text-foreground">
                    {t('documentData.employeeDocuments.title')}
                </h1>
                {canCreateDocument && (
                    <Button
                        onClick={() => {
                            setUploadSessionKey((current) => current + 1);
                            setIsUploadModalOpen(true);
                        }}
                        className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-white transition-all hover:bg-primary/90 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        <span>{t('documentData.employeeDocuments.uploadDocument')}</span>
                    </Button>
                )}
            </div>

            {canSelectTenantCompany && (
                statsQuery.isLoading ? (
                    <SummaryStatListSkeleton count={documentStats.length} />
                ) : (
                    <SummaryStatList
                        stats={documentStats.map((stat) => {
                            const values: Record<string, number> = {
                                compliant: stats?.compliant ?? 0,
                                missing: stats?.missing ?? 0,
                                expired: stats?.expired ?? 0,
                                nearExpiry: stats?.nearExpire ?? 0,
                            };

                            return {
                                title: t(`documentData.employeeDocuments.stats.${stat.key}`),
                                value: values[stat.key] ?? 0,
                                icon: stat.icon,
                                iconBgColor: stat.bgColor,
                                iconColor: stat.color,
                                borderColor: stat.borderColor,
                            };
                        })}
                    />
                )
            )}

            <div className="w-full">
                <UniversalDataTable
                    data={tableRows}
                    columns={columns}
                    enableSelection
                    selectedIds={selectedOwnerIds}
                    onSelectionChange={setSelectedOwnerIds}
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder={t('employeeDocuments.filters.searchPlaceholder', { ns: 'document' })}
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
                                <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                                    {activeFilterCount}
                                </span>
                            ) : null}
                        </Button>
                    )}
                    renderFilterPanel={(
                        <EmployeeDocumentFilterSection
                            isVisible={showFilters}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            initialFilters={activeFilters}
                            employees={employees}
                            categories={categories}
                        />
                    )}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onRowClick={(item) => handleOpenOwnerPage(item.id, item.employee)}
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

export default EmployeeDocumentsPage;
