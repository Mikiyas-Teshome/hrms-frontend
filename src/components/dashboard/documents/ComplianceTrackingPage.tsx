'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Send, CheckCircle2, XCircle, AlertTriangle, FileText, ListFilter } from 'lucide-react';
import { sendComplianceReminder } from '@/features/documents/documents.actions';
import { useToast } from '@/hooks/use-toast';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { resolveDocumentError } from '@/features/documents/resolve-document-error';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { cn } from '@/lib/utils';
import ComplianceFilterSection from './ComplianceFilterSection';
import { getOrganizationHierarchy } from '@/features/organization/organization.actions';
import {
    collectOrganizationDepartments,
    resolveDepartmentDisplayName,
} from '@/features/organization/organization-unit-options.util';
import {
    EmployeeComplianceFilterInput,
    EmployeeComplianceSortBy,
    EmployeeDocumentSortOrder,
    ComplianceAlert,
} from '@/features/documents/documents.types';
import {
    complianceQueryKeys,
    useComplianceAlerts,
    useComplianceListPaged,
    useComplianceStats,
} from '@/features/documents/hooks/useComplianceTracking';

const defaultFilters: EmployeeComplianceFilterInput = {};

const mapColumnToSortBy = (column: string): EmployeeComplianceSortBy | null => {
    if (column === 'employee') return EmployeeComplianceSortBy.EMPLOYEE_NAME;
    if (column === 'department') return EmployeeComplianceSortBy.DEPARTMENT;
    if (column === 'missingDocument') return EmployeeComplianceSortBy.MISSING_DOCUMENT;
    if (column === 'expiryDocument') return EmployeeComplianceSortBy.EXPIRING_DOCUMENT;
    if (column === 'complianceStatus') return EmployeeComplianceSortBy.COMPLIANCE_STATUS;
    if (column === 'lastReminder') return EmployeeComplianceSortBy.LAST_REMINDER;
    return null;
};

type ComplianceTableRow = {
    id: string;
    employee: string;
    department: string;
    missingDocument: string;
    expiryDocument: string;
    complianceStatusRaw: string;
    complianceStatus: string;
    lastReminder: string;
    rawMissing: string[];
};

const ComplianceTrackingPage = () => {
    const { t, i18n } = useTranslation(['dashboard', 'document']);
    const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    const { hasPermission } = usePermissions();
    const canUpdateCompliance = hasPermission('compliance:update');
    const { toast } = useToast();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<EmployeeComplianceFilterInput>(defaultFilters);
    const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string>('employee');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
    const tableSectionRef = useRef<HTMLDivElement>(null);

    const departmentNameById = useMemo(
        () => new Map(departments.map((department) => [department.id, department.name])),
        [departments],
    );

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
            sortBy: mapColumnToSortBy(sortColumn) ?? EmployeeComplianceSortBy.EMPLOYEE_NAME,
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

    const statsQuery = useComplianceStats();
    const alertsQuery = useComplianceAlerts();
    const listQuery = useComplianceListPaged(listParams);

    const statsData = useMemo(
        () => ({
            fullyCompliant: statsQuery.data?.fullyCompliantEmployeesCount ?? 0,
            nonCompliant: statsQuery.data?.nonCompliantEmployeesCount ?? 0,
            expiringSoon: statsQuery.data?.expiringSoonDocumentsCount ?? 0,
            totalCompliance: statsQuery.data
                ? `${statsQuery.data.totalCompliancePercentage}%`
                : '0%',
        }),
        [statsQuery.data],
    );

    const alerts = useMemo(
        () =>
            (alertsQuery.data ?? []).map((alert: ComplianceAlert) => ({
                id: alert.id,
                message: alert.message,
                type: alert.type,
                documentCategoryName: alert.documentCategoryName,
                date: new Date(alert.date).toLocaleDateString(dateLocale, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                }),
                typeStyle: alert.severity === 'CRITICAL' ? 'error' : 'warning',
            })),
        [alertsQuery.data, dateLocale],
    );

    const tableData = useMemo<ComplianceTableRow[]>(
        () =>
            (listQuery.data?.data ?? []).map((row) => ({
                id: row.employeeId,
                employee: row.employeeName,
                department: resolveDepartmentDisplayName(row.department, departmentNameById),
                missingDocument: row.missingDocuments.length > 0 ? row.missingDocuments.join(', ') : '-',
                expiryDocument: row.expiringDocuments.length > 0 ? row.expiringDocuments.join(', ') : '-',
                complianceStatusRaw: row.complianceStatus,
                complianceStatus:
                    row.complianceStatus === 'COMPLIANT'
                        ? t('complianceTracking.compliance.compliant', { ns: 'document' })
                        : t('complianceTracking.compliance.nonCompliant', { ns: 'document' }),
                lastReminder: row.lastReminderDate
                    ? new Date(row.lastReminderDate).toLocaleDateString(dateLocale, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                      })
                    : '-',
                rawMissing: row.missingDocuments,
            })),
        [listQuery.data, t, dateLocale, departmentNameById],
    );

    const totalItems = listQuery.data?.metaData.total ?? 0;
    const totalPages = listQuery.data?.metaData.totalPages ?? 0;

    const activeFilterCount = useMemo(
        () =>
            Object.entries(activeFilters).filter(
                ([key, value]) =>
                    key !== 'search' &&
                    key !== 'sortBy' &&
                    key !== 'sortOrder' &&
                    value !== undefined &&
                    value !== '' &&
                    value !== false,
            ).length,
        [activeFilters],
    );

    const buildAlertFilter = useCallback((alert: (typeof alerts)[number]): EmployeeComplianceFilterInput => {
        if (alert.type === 'MISSING_DOCUMENT' && alert.documentCategoryName) {
            return { missingCategoryName: alert.documentCategoryName };
        }
        if (alert.type === 'EXPIRING_SOON') {
            return { hasExpiringDocuments: true };
        }
        if (alert.type === 'FULLY_NON_COMPLIANT') {
            return { noUploadedDocuments: true };
        }
        return {};
    }, []);

    const invalidateComplianceQueries = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: complianceQueryKeys.stats });
        queryClient.invalidateQueries({ queryKey: complianceQueryKeys.alerts });
        queryClient.invalidateQueries({ queryKey: ['compliance-list-paged'] });
    }, [queryClient]);

    useEffect(() => {
        let isMounted = true;
        Promise.resolve().then(async () => {
            const hierarchy = await getOrganizationHierarchy({ maxDepth: 10 });
            if (isMounted) {
                setDepartments(collectOrganizationDepartments(hierarchy));
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    const handleApplyFilters = (filters: EmployeeComplianceFilterInput) => {
        setActiveAlertId(null);
        setActiveFilters(filters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchValue('');
        setDebouncedSearch('');
        setActiveAlertId(null);
        setActiveFilters(defaultFilters);
        setCurrentPage(1);
    };

    const handleAlertClick = (alert: (typeof alerts)[number]) => {
        if (activeAlertId === alert.id) {
            handleResetFilters();
            return;
        }

        setActiveAlertId(alert.id);
        setActiveFilters(buildAlertFilter(alert));
        setSearchValue('');
        setDebouncedSearch('');
        setCurrentPage(1);
        tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const handleSendReminder = async (employeeId: string, missingDocuments: string[]) => {
        if (missingDocuments.length === 0) {
            toast({
                title: t('complianceTracking.toasts.noMissingTitle', { ns: 'document' }),
                description: t('complianceTracking.toasts.noMissingDescription', { ns: 'document' }),
            });
            return;
        }

        try {
            const result = await sendComplianceReminder(employeeId, missingDocuments);
            if (result.success) {
                toast({
                    title: t('complianceTracking.toasts.reminderSentTitle', { ns: 'document' }),
                    description: t('complianceTracking.toasts.reminderSentDescription', {
                        ns: 'document',
                        docs: missingDocuments.join(', '),
                    }),
                });
                invalidateComplianceQueries();
            } else {
                toast({
                    variant: 'destructive',
                    title: t('complianceTracking.toasts.errorTitle', { ns: 'document' }),
                    description: resolveDocumentError(result.error, i18n.getFixedT(i18n.language, 'document')),
                });
            }
        } catch {
            toast({
                variant: 'destructive',
                title: t('complianceTracking.toasts.errorTitle', { ns: 'document' }),
                description: t('complianceTracking.toasts.unexpectedSendReminderError', { ns: 'document' }),
            });
        }
    };

    const handleViewEmployeeDocuments = (employeeId: string, employeeName: string) => {
        const params = new URLSearchParams({ name: employeeName });
        router.push(`/dashboard/documents/employee-documents/${employeeId}?${params.toString()}`);
    };

    const handleViewAffected = () => {
        setActiveAlertId(null);
        setActiveFilters({ complianceStatus: 'NON_COMPLIANT' });
        setShowFilters(true);
        setCurrentPage(1);
        tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSendBulkReminders = async () => {
        const nonCompliantRows = tableData.filter(
            (row) => row.complianceStatusRaw !== 'COMPLIANT' && row.rawMissing.length > 0,
        );
        if (nonCompliantRows.length === 0) {
            toast({
                title: t('complianceTracking.toasts.noRemindersTitle', { ns: 'document' }),
                description: t('complianceTracking.toasts.noRemindersDescription', { ns: 'document' }),
            });
            return;
        }

        toast({
            title: t('complianceTracking.toasts.sendingRemindersTitle', { ns: 'document' }),
            description: t('complianceTracking.toasts.sendingRemindersDescription', {
                ns: 'document',
                count: nonCompliantRows.length,
            }),
        });

        let successCount = 0;
        for (const row of nonCompliantRows) {
            try {
                const result = await sendComplianceReminder(row.id, row.rawMissing);
                if (result.success) {
                    successCount += 1;
                }
            } catch (error) {
                console.error(`Failed to send reminder to employee ${row.id}:`, error);
            }
        }

        toast({
            title: t('complianceTracking.toasts.remindersCompleteTitle', { ns: 'document' }),
            description: t('complianceTracking.toasts.remindersCompleteDescription', {
                ns: 'document',
                successCount,
                totalCount: nonCompliantRows.length,
            }),
        });
        invalidateComplianceQueries();
    };

    const columns: ColumnConfig<ComplianceTableRow>[] = [
        {
            key: 'employee',
            label: t('documentData.complianceTracking.table.employee'),
            sortable: true,
        },
        {
            key: 'department',
            label: t('documentData.complianceTracking.table.department'),
            sortable: true,
        },
        {
            key: 'missingDocument',
            label: t('documentData.complianceTracking.table.missingDocument'),
            sortable: true,
        },
        {
            key: 'expiryDocument',
            label: t('documentData.complianceTracking.table.expiryDocument'),
            sortable: true,
        },
        {
            key: 'complianceStatus',
            label: t('documentData.complianceTracking.table.complianceStatus'),
            sortable: true,
            render: (item) => (
                <Badge
                    variant="outline"
                    className={
                        item.complianceStatusRaw === 'COMPLIANT'
                            ? 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                    }
                >
                    <div
                        className={
                            item.complianceStatusRaw === 'COMPLIANT'
                                ? 'mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500'
                                : 'mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500'
                        }
                    />
                    {item.complianceStatus}
                </Badge>
            ),
        },
        {
            key: 'lastReminder',
            label: t('documentData.complianceTracking.table.lastReminder'),
            sortable: true,
        },
    ];

    const renderRowActions = (item: ComplianceTableRow) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => handleViewEmployeeDocuments(item.id, item.employee)}
                >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{t('complianceTracking.actions.view', { ns: 'document' })}</span>
                </DropdownMenuItem>
                {canUpdateCompliance && (
                    <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        onClick={() => handleSendReminder(item.id, item.rawMissing)}
                        disabled={item.rawMissing.length === 0}
                    >
                        <Send className="h-4 w-4 text-muted-foreground" />
                        <span>{t('complianceTracking.actions.sendReminder', { ns: 'document' })}</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const statsList = [
        {
            title: t('documentData.complianceTracking.stats.fullyCompliant'),
            value: statsData.fullyCompliant.toString(),
            icon: CheckCircle2,
            bgColor: 'rgba(34, 197, 94, 0.05)',
            color: '#22C55E',
            borderColor: 'rgba(34, 197, 94, 0.5)',
        },
        {
            title: t('documentData.complianceTracking.stats.nonCompliant'),
            value: statsData.nonCompliant.toString(),
            icon: XCircle,
            bgColor: 'rgba(239, 68, 68, 0.05)',
            color: '#EF4444',
            borderColor: 'rgba(239, 68, 68, 0.5)',
        },
        {
            title: t('documentData.complianceTracking.stats.expiringSoon'),
            value: statsData.expiringSoon.toString(),
            icon: AlertTriangle,
            bgColor: 'rgba(245, 158, 11, 0.05)',
            color: '#F59E0B',
            borderColor: 'rgba(245, 158, 11, 0.5)',
        },
        {
            title: t('documentData.complianceTracking.stats.totalCompliance'),
            value: statsData.totalCompliance,
            icon: FileText,
            bgColor: 'rgba(40, 101, 227, 0.05)',
            color: '#2865E3',
            borderColor: 'rgba(40, 101, 227, 0.5)',
        },
    ];

    return (
        <div className="flex w-full flex-col gap-8 duration-500 animate-in fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold leading-8 tracking-tight text-foreground">
                    {t('documentData.complianceTracking.title')}
                </h1>
            </div>

            {statsQuery.isLoading ? (
                <SummaryStatListSkeleton count={statsList.length} />
            ) : (
                <SummaryStatList stats={statsList} />
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="border border-border shadow-sm lg:col-span-2">
                    <CardHeader className="border-b border-border/50 bg-card-header-background pb-3">
                        <CardTitle className="text-base font-semibold text-foreground">
                            {t('documentData.complianceTracking.riskAlerts')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {alertsQuery.isLoading ? (
                            <div className="flex flex-col gap-3 p-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Skeleton key={index} className="h-12 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                {t('complianceTracking.emptyRiskAlerts', { ns: 'document' })}
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-border/50">
                                {alerts.map((alert) => (
                                    <button
                                        key={alert.id}
                                        type="button"
                                        onClick={() => handleAlertClick(alert)}
                                        className={cn(
                                            'flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-muted/30',
                                            activeAlertId === alert.id && 'bg-primary/5 hover:bg-primary/10',
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={
                                                    alert.typeStyle === 'error' ? 'text-red-500' : 'text-amber-500'
                                                }
                                            >
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{alert.message}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{alert.date}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border border-border shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-card-header-background pb-3">
                        <CardTitle className="text-base font-semibold text-foreground">
                            {t('documentData.complianceTracking.quickActions')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ul className="flex flex-col gap-4">
                            <li>
                                <Button
                                    variant="link"
                                    onClick={handleViewAffected}
                                    className="h-auto cursor-pointer p-0 text-sm font-medium text-primary hover:no-underline"
                                >
                                    {t('complianceTracking.quickActionItems.viewAffectedEmployees', { ns: 'document' })}
                                </Button>
                            </li>
                            {canUpdateCompliance && (
                                <li>
                                    <Button
                                        variant="link"
                                        onClick={handleSendBulkReminders}
                                        className="h-auto cursor-pointer p-0 text-sm font-medium text-primary hover:no-underline"
                                    >
                                        {t('complianceTracking.quickActionItems.sendReminder', { ns: 'document' })}
                                    </Button>
                                </li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div ref={tableSectionRef} className="w-full scroll-mt-6">
                <UniversalDataTable
                    data={tableData}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder={t('complianceTracking.filters.searchPlaceholder', { ns: 'document' })}
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
                        <ComplianceFilterSection
                            isVisible={showFilters}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            initialFilters={activeFilters}
                            departments={departments}
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

export default ComplianceTrackingPage;
