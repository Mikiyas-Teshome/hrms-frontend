'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Send, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import {
    fetchComplianceDashboardStats,
    fetchComplianceAlerts,
    fetchEmployeeComplianceList,
    sendComplianceReminder
} from '@/features/documents/documents.actions';
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormSelect } from '@/components/ui/FormSelect';

const ComplianceTrackingPage = () => {
    const { t } = useTranslation(['dashboard', 'document']);
    const { toast } = useToast();
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(true);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        complianceStatus: '',
        department: '',
    });
    const [departments, setDepartments] = useState<string[]>([]);
    const filterForm = useForm({
        defaultValues: {
            complianceStatus: '__all__',
            department: '__all__',
        },
    });

    const [statsData, setStatsData] = useState({
        fullyCompliant: 0,
        nonCompliant: 0,
        expiringSoon: 0,
        totalCompliance: '0%',
    });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [statsResponse, alertsResponse, listResponse] = await Promise.all([
                fetchComplianceDashboardStats(),
                fetchComplianceAlerts(),
                fetchEmployeeComplianceList({
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize,
                    search: searchValue,
                    complianceStatus: filters.complianceStatus || undefined,
                    department: filters.department || undefined,
                })
            ]);

            setStatsData({
                fullyCompliant: statsResponse.fullyCompliantEmployeesCount,
                nonCompliant: statsResponse.nonCompliantEmployeesCount,
                expiringSoon: statsResponse.expiringSoonDocumentsCount,
                totalCompliance: `${statsResponse.totalCompliancePercentage}%`,
            });

            setAlerts(alertsResponse.map(alert => ({
                id: alert.id,
                message: alert.message,
                date: new Date(alert.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
                type: alert.severity === 'CRITICAL' ? 'error' : 'warning',
            })));

            setTableData(listResponse.data.map(row => ({
                id: row.employeeId,
                employee: row.employeeName,
                department: row.department,
                missingDocument: row.missingDocuments.length > 0 ? row.missingDocuments.join(', ') : '-',
                expiryDocument: row.expiringDocuments.length > 0 ? row.expiringDocuments.join(', ') : '-',
                complianceStatus: row.complianceStatus === 'COMPLIANT'
                    ? t('complianceTracking.compliance.compliant', { ns: 'document' })
                    : t('complianceTracking.compliance.nonCompliant', { ns: 'document' }),
                lastReminder: row.lastReminderDate ? new Date(row.lastReminderDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
                rawMissing: row.missingDocuments,
            })));

            setTotalItems(listResponse.pagination.total);
        } catch (error) {
            console.error("Failed to load compliance data:", error);
            toast({
                variant: "destructive",
                title: t('complianceTracking.toasts.errorTitle', { ns: 'document' }),
                description: t('complianceTracking.toasts.fetchError', { ns: 'document' })
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchValue, filters, toast, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const getDepartments = async () => {
            try {
                const response = await fetchEmployeeComplianceList({ limit: 100 });
                const unique = Array.from(new Set(response.data.map(emp => emp.department).filter(Boolean))) as string[];
                setDepartments(unique);
            } catch (err) {
                console.error("Failed to load departments:", err);
            }
        };
        getDepartments();
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const handleComplianceStatusChange = (value: string) => {
        setFilters((prev) => ({ ...prev, complianceStatus: value === '__all__' ? '' : value }));
        setCurrentPage(1);
    };

    const handleDepartmentChange = (value: string) => {
        setFilters((prev) => ({ ...prev, department: value === '__all__' ? '' : value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            complianceStatus: '',
            department: '',
        });
        filterForm.setValue('complianceStatus', '__all__');
        filterForm.setValue('department', '__all__');
        setCurrentPage(1);
    };

    const handleSendReminder = async (employeeId: string, missingDocuments: string[]) => {
        if (missingDocuments.length === 0) {
            toast({
                title: t('complianceTracking.toasts.noMissingTitle', { ns: 'document' }),
                description: t('complianceTracking.toasts.noMissingDescription', { ns: 'document' })
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
                loadData();
            } else {
                toast({
                    variant: 'destructive',
                    title: t('complianceTracking.toasts.errorTitle', { ns: 'document' }),
                    description: result.error || t('complianceTracking.toasts.sendReminderError', { ns: 'document' }),
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

    const columns: ColumnConfig<any>[] = [
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
            render: (item) => (
                <Badge 
                    variant="outline" 
                    className={
                        item.complianceStatus === 'Compliant' 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                >
                    <div className={item.complianceStatus === 'Compliant' ? "w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" : "w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"} />
                    {item.complianceStatus}
                </Badge>
            )
        },
        {
            key: 'lastReminder',
            label: t('documentData.complianceTracking.table.lastReminder'),
            sortable: true,
        }
    ];

    const handleViewAffected = () => {
        setFilters((prev) => ({ ...prev, complianceStatus: 'NON_COMPLIANT' }));
        filterForm.setValue('complianceStatus', 'NON_COMPLIANT');
        setFiltersOpen(true);
        setCurrentPage(1);
    };

    const handleSendBulkReminders = async () => {
        const nonCompliantRows = tableData.filter(row => row.complianceStatus === t('complianceTracking.compliance.nonCompliant', { ns: 'document' }) && row.rawMissing && row.rawMissing.length > 0);
        if (nonCompliantRows.length === 0) {
            toast({
                title: t('complianceTracking.toasts.noRemindersTitle', { ns: 'document' }),
                description: t('complianceTracking.toasts.noRemindersDescription', { ns: 'document' })
            });
            return;
        }

        toast({
            title: t('complianceTracking.toasts.sendingRemindersTitle', { ns: 'document' }),
            description: t('complianceTracking.toasts.sendingRemindersDescription', { ns: 'document', count: nonCompliantRows.length }),
        });

        let successCount = 0;
        for (const row of nonCompliantRows) {
            try {
                const result = await sendComplianceReminder(row.id, row.rawMissing);
                if (result.success) {
                    successCount++;
                }
            } catch (error) {
                console.error(`Failed to send reminder to employee ${row.id}:`, error);
            }
        }

        toast({
            title: t('complianceTracking.toasts.remindersCompleteTitle', { ns: 'document' }),
            description: t('complianceTracking.toasts.remindersCompleteDescription', { ns: 'document', successCount, totalCount: nonCompliantRows.length })
        });
        loadData();
    };

    const handleGenerateReport = () => {
        if (tableData.length === 0) {
            toast({
                variant: "destructive",
                title: t('complianceTracking.toasts.noDataTitle', { ns: 'document' }),
                description: t('complianceTracking.toasts.noDataDescription', { ns: 'document' })
            });
            return;
        }

        const headers = [
            t('complianceTracking.report.employeeName', { ns: 'document' }),
            t('complianceTracking.report.department', { ns: 'document' }),
            t('complianceTracking.report.missingDocuments', { ns: 'document' }),
            t('complianceTracking.report.expiringDocuments', { ns: 'document' }),
            t('complianceTracking.report.complianceStatus', { ns: 'document' }),
            t('complianceTracking.report.lastReminderDate', { ns: 'document' }),
        ];
        const rows = tableData.map(row => [
            `"${row.employee}"`,
            `"${row.department}"`,
            `"${row.missingDocument}"`,
            `"${row.expiryDocument}"`,
            `"${row.complianceStatus}"`,
            `"${row.lastReminder}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `compliance_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: t('complianceTracking.toasts.reportGeneratedTitle', { ns: 'document' }),
            description: t('complianceTracking.toasts.reportGeneratedDescription', { ns: 'document' })
        });
    };

    const renderRowActions = (item: any) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{t('complianceTracking.actions.view', { ns: 'document' })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    className="gap-2 cursor-pointer"
                    onClick={() => handleSendReminder(item.id, item.rawMissing || [])}
                    disabled={!item.rawMissing || item.rawMissing.length === 0}
                >
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <span>{t('complianceTracking.actions.sendReminder', { ns: 'document' })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>{t('complianceTracking.actions.markResolved', { ns: 'document' })}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const statsList = [
        {
            title: t('documentData.complianceTracking.stats.fullyCompliant'),
            value: statsData.fullyCompliant.toString(),
            icon: CheckCircle2,
            bgColor: "rgba(34, 197, 94, 0.05)",
            color: "#22C55E",
            borderColor: "rgba(34, 197, 94, 0.5)",
        },
        {
            title: t('documentData.complianceTracking.stats.nonCompliant'),
            value: statsData.nonCompliant.toString(),
            icon: XCircle,
            bgColor: "rgba(239, 68, 68, 0.05)",
            color: "#EF4444",
            borderColor: "rgba(239, 68, 68, 0.5)",
        },
        {
            title: t('documentData.complianceTracking.stats.expiringSoon'),
            value: statsData.expiringSoon.toString(),
            icon: AlertTriangle,
            bgColor: "rgba(245, 158, 11, 0.05)",
            color: "#F59E0B",
            borderColor: "rgba(245, 158, 11, 0.5)",
        },
        {
            title: t('documentData.complianceTracking.stats.totalCompliance'),
            value: statsData.totalCompliance,
            icon: FileText,
            bgColor: "rgba(40, 101, 227, 0.05)",
            color: "#2865E3",
            borderColor: "rgba(40, 101, 227, 0.5)",
        },
    ];

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('documentData.complianceTracking.title')}
                </h1>
            </div>

            <SummaryStatList stats={statsList} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border border-border shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/50 bg-gray-50/30">
                        <CardTitle className="text-base font-semibold text-foreground">
                            {t('documentData.complianceTracking.riskAlerts')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {alerts.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                {t('complianceTracking.emptyRiskAlerts', { ns: 'document' })}
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-border/50">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-4 hover:bg-gray-50/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={alert.type === 'error' ? "text-red-500" : "text-amber-500"}>
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{alert.message}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{alert.date}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/50 bg-gray-50/30">
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
                                    className="p-0 h-auto text-primary text-sm font-medium hover:no-underline"
                                >
                                    {t('complianceTracking.quickActionItems.viewAffectedEmployees', { ns: 'document' })}
                                </Button>
                            </li>
                            <li>
                                <Button 
                                    variant="link" 
                                    onClick={handleSendBulkReminders}
                                    className="p-0 h-auto text-primary text-sm font-medium hover:no-underline"
                                >
                                    {t('complianceTracking.quickActionItems.sendReminder', { ns: 'document' })}
                                </Button>
                            </li>
                            <li>
                                <Button 
                                    variant="link" 
                                    onClick={handleGenerateReport}
                                    className="p-0 h-auto text-primary text-sm font-medium hover:no-underline"
                                >
                                    {t('complianceTracking.quickActionItems.generateReport', { ns: 'document' })}
                                </Button>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full">
                <UniversalDataTable
                    data={tableData}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder={t('complianceTracking.filters.searchPlaceholder', { ns: 'document' })}
                    showFilter
                    onFilterClick={() => setFiltersOpen((prev) => !prev)}
                    renderFilterPanel={
                        filtersOpen ? (
                            <div className="rounded-[8px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] mb-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="compliance-filter-status"
                                            label={t('complianceTracking.filters.complianceStatus', { ns: 'document' })}
                                            placeholder={t('complianceTracking.filters.allStatuses', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="complianceStatus"
                                            options={[
                                                { label: t('complianceTracking.filters.allStatuses', { ns: 'document' }), value: '__all__' },
                                                { label: t('complianceTracking.compliance.compliant', { ns: 'document' }), value: 'COMPLIANT' },
                                                { label: t('complianceTracking.compliance.nonCompliant', { ns: 'document' }), value: 'NON_COMPLIANT' },
                                            ]}
                                            t={t}
                                            onChange={handleComplianceStatusChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <FormSelect
                                            id="compliance-filter-department"
                                            label={t('complianceTracking.filters.department', { ns: 'document' })}
                                            placeholder={t('complianceTracking.filters.allDepartments', { ns: 'document' })}
                                            control={filterForm.control}
                                            name="department"
                                            options={[
                                                { label: t('complianceTracking.filters.allDepartments', { ns: 'document' }), value: '__all__' },
                                                ...departments.map((dept) => ({ label: dept, value: dept })),
                                            ]}
                                            t={t}
                                            onChange={handleDepartmentChange}
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <Button
                                            variant="outline"
                                            className="h-10 px-4 rounded-lg"
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

export default ComplianceTrackingPage;
