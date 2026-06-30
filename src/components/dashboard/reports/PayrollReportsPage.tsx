'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CircleDollarSign, Clock, MinusCircle, MoreVertical, Wallet } from 'lucide-react';
import { ExportButton } from './ExportButton';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { FormSelect } from '@/components/ui/FormSelect';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
    useExportPayrollReport,
    usePayrollReport,
    usePayrollReportFilterOptions,
} from '@/features/reports/reports.hooks';
import { PayrollReportFiltersInput } from '@/features/reports/reports.types';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import { useToast } from '@/hooks/use-toast';

const payrollConfig = {
    cost: {
        label: 'Payroll Cost',
        color: '#2865E3',
    },
} satisfies ChartConfig;

const DEDUCTION_COLORS: Record<string, string> = {
    Tax: '#EA580C',
    Insurance: '#0D9488',
    Penalties: '#0F172A',
    'Unpaid leave': '#F59E0B',
};

const deductionsConfig = {
    tax: { label: 'Tax', color: '#EA580C' },
    insurance: { label: 'Insurance', color: '#0D9488' },
    penalties: { label: 'Penalties', color: '#0F172A' },
    unpaidLeave: { label: 'Unpaid leave', color: '#F59E0B' },
} satisfies ChartConfig;

const SORTABLE_COLUMNS: Record<string, PayrollReportFiltersInput['sortBy']> = {
    employeeName: 'employeeName',
    basicSalary: 'basicSalary',
    totalAllowances: 'totalAllowances',
    totalDeductions: 'totalDeductions',
    netPay: 'netPay',
};

const formatCurrency = (value: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const formatStatusLabel = (status?: string) => {
    if (!status) return '—';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const PayrollReportsPage = () => {
    const { t } = useTranslation(['dashboard']);
    const { toast } = useToast();
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState<PayrollReportFiltersInput['sortBy']>('createdAt');
    const [sortOrder, setSortOrder] = useState<PayrollReportFiltersInput['sortOrder']>('desc');
    const [payrollRunId, setPayrollRunId] = useState('');
    const [employeeId, setEmployeeId] = useState('all');
    const [payrollStatus, setPayrollStatus] = useState<'all' | 'active' | 'terminated'>('all');
    const [appliedFilters, setAppliedFilters] = useState({
        payrollRunId: '',
        employeeId: 'all',
        payrollStatus: 'all' as 'all' | 'active' | 'terminated',
    });

    const { roleName } = usePermissions();
    const requiresCompanyOuForReport = roleName === 'SYSTEM_ADMIN';

    const { canSelectCompany, companyOuId, derivedCompanyOuId, companyForm, companiesData, isLoadingCompanies } =
        useLeaveCompanyOuId();
    const effectiveCompanyOuId = companyOuId || derivedCompanyOuId || undefined;

    const { data: filterOptions } = usePayrollReportFilterOptions(effectiveCompanyOuId);
    const exportPayrollReportMutation = useExportPayrollReport();

    const latestPayrollRunId = filterOptions?.payPeriods?.[0]?.id ?? '';
    const payPeriodsKey = filterOptions?.payPeriods?.map((period) => period.id).join(',') ?? '';
    const [trackedPayPeriodsKey, setTrackedPayPeriodsKey] = useState('');
    const [trackedCompanyOuId, setTrackedCompanyOuId] = useState<string | undefined>(undefined);

    if (payPeriodsKey && payPeriodsKey !== trackedPayPeriodsKey) {
        setTrackedPayPeriodsKey(payPeriodsKey);
        setPayrollRunId((prev) => prev || latestPayrollRunId);
        setAppliedFilters((prev) => ({
            ...prev,
            payrollRunId: prev.payrollRunId || latestPayrollRunId,
        }));
    }

    if (companyOuId !== trackedCompanyOuId) {
        setTrackedCompanyOuId(companyOuId);
        setPayrollRunId(latestPayrollRunId);
        setEmployeeId('all');
        setAppliedFilters({
            payrollRunId: latestPayrollRunId,
            employeeId: 'all',
            payrollStatus: 'all',
        });
    }

    const reportFilters: PayrollReportFiltersInput = useMemo(
        () => ({
            payrollRunId: appliedFilters.payrollRunId,
            companyOuId: canSelectCompany ? effectiveCompanyOuId : undefined,
            employeeId: appliedFilters.employeeId === 'all' ? undefined : appliedFilters.employeeId,
            payrollStatus: appliedFilters.payrollStatus,
            page: currentPage,
            limit: pageSize,
            search: searchValue || undefined,
            sortBy,
            sortOrder,
        }),
        [
            appliedFilters,
            canSelectCompany,
            effectiveCompanyOuId,
            currentPage,
            pageSize,
            searchValue,
            sortBy,
            sortOrder,
        ],
    );

    const { data: reportData, isLoading: isLoadingReport, isError: isReportError } = usePayrollReport(
        reportFilters,
        (!requiresCompanyOuForReport || !!effectiveCompanyOuId) && !!appliedFilters.payrollRunId,
    );

    useEffect(() => {
        if (!isReportError) return;
        toast({
            variant: 'destructive',
            title: 'Failed to load payroll report',
            description: 'Could not fetch report data. Try applying filters again.',
        });
    }, [isReportError, toast]);

    const currency = reportData?.summary.currency || 'USD';

    const payrollStats = useMemo(
        () => [
            {
                title: t('reports.payroll.stats.totalCost'),
                value: formatCurrency(reportData?.summary.totalPayrollCost ?? 0, currency),
                icon: CircleDollarSign,
                color: '#2865E3',
                borderColor: 'rgba(40, 101, 227, 0.5)',
                bgColor: 'rgba(40, 101, 227, 0.05)',
            },
            {
                title: t('reports.payroll.stats.netPay'),
                value: formatCurrency(reportData?.summary.netPay ?? 0, currency),
                icon: Wallet,
                color: '#2865E3',
                borderColor: 'rgba(40, 101, 227, 0.5)',
                bgColor: 'rgba(40, 101, 227, 0.05)',
            },
            {
                title: t('reports.payroll.stats.totalDeductions'),
                value: formatCurrency(reportData?.summary.totalDeductions ?? 0, currency),
                icon: MinusCircle,
                color: '#D97706',
                borderColor: 'rgba(217, 119, 6, 0.5)',
                bgColor: 'rgba(217, 119, 6, 0.05)',
            },
            {
                title: t('reports.payroll.stats.overtimeCost'),
                value: formatCurrency(reportData?.summary.overtimeCost ?? 0, currency),
                icon: Clock,
                color: '#22C55E',
                borderColor: 'rgba(34, 197, 94, 0.5)',
                bgColor: 'rgba(217, 119, 6, 0.05)',
            },
        ],
        [reportData?.summary, currency, t],
    );

    const payrollTrendData = useMemo(
        () =>
            (reportData?.payrollTrend ?? []).map((point) => ({
                month: point.label,
                cost: point.value,
            })),
        [reportData?.payrollTrend],
    );

    const deductionsBreakdownData = useMemo(
        () =>
            (reportData?.deductionsBreakdown ?? []).map((point) => ({
                name: point.name,
                value: point.value,
                color: DEDUCTION_COLORS[point.name] ?? '#64748B',
            })),
        [reportData?.deductionsBreakdown],
    );

    const trendMax = useMemo(() => {
        const max = Math.max(...payrollTrendData.map((point) => point.cost), 0);
        return max > 0 ? Math.ceil(max * 1.2) : 100;
    }, [payrollTrendData]);

    const tableRows = useMemo(
        () =>
            (reportData?.rows ?? []).map((row) => ({
                id: row.id,
                employeeName: row.employeeName,
                basicSalary: formatCurrency(row.basicSalary, row.currency || currency),
                totalAllowances: formatCurrency(row.totalAllowances, row.currency || currency),
                totalDeductions: formatCurrency(row.totalDeductions, row.currency || currency),
                netPay: formatCurrency(row.netPay, row.currency || currency),
                status: formatStatusLabel(row.status),
                _raw: row,
            })),
        [reportData?.rows, currency],
    );

    const handleSort = (column: string) => {
        const field = SORTABLE_COLUMNS[column];
        if (!field) return;
        if (sortBy === field) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setCurrentPage(1);
    };

    const handleApplyFilters = () => {
        setAppliedFilters({
            payrollRunId,
            employeeId,
            payrollStatus,
        });
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        const defaultRunId = filterOptions?.payPeriods?.[0]?.id ?? '';
        setPayrollRunId(defaultRunId);
        setEmployeeId('all');
        setPayrollStatus('all');
        setSearchValue('');
        setAppliedFilters({
            payrollRunId: defaultRunId,
            employeeId: 'all',
            payrollStatus: 'all',
        });
        setCurrentPage(1);
    };

    const handleServerExport = async (format: 'csv' | 'pdf' | 'xlsx') => {
        try {
            const result = await exportPayrollReportMutation.mutateAsync({
                format,
                filters: {
                    ...reportFilters,
                    page: 1,
                    limit: 10000,
                },
            });
            const binary = atob(result.content);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i += 1) {
                bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: result.mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.fileName;
            link.click();
            URL.revokeObjectURL(url);
            toast({
                title: 'Export successful',
                description: `${result.fileName} has been downloaded.`,
            });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Export failed',
                description: 'Unable to export the full payroll report.',
            });
        }
    };

    const columns: ColumnConfig<(typeof tableRows)[number]>[] = [
        {
            key: 'employeeName',
            label: 'Employee',
            sortable: true,
        },
        {
            key: 'basicSalary',
            label: 'Salary (gross)',
            sortable: true,
        },
        {
            key: 'totalAllowances',
            label: 'Allowance',
            sortable: true,
        },
        {
            key: 'totalDeductions',
            label: 'Deductions',
            sortable: true,
        },
        {
            key: 'netPay',
            label: 'Net pay',
            sortable: true,
        },
        {
            key: 'status',
            label: 'Status',
            render: (item) => (
                <Badge
                    variant="outline"
                    className={
                        item.status === 'Active'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                    }
                >
                    <div
                        className={
                            item.status === 'Active'
                                ? 'w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5'
                                : 'w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5'
                        }
                    />
                    {item.status}
                </Badge>
            ),
        },
    ];

    const exportColumns = [
        { header: 'Employee', key: 'employeeName' },
        { header: 'Salary (gross)', key: 'basicSalary' },
        { header: 'Allowance', key: 'totalAllowances' },
        { header: 'Deductions', key: 'totalDeductions' },
        { header: 'Net Pay', key: 'netPay' },
        { header: 'Status', key: 'status' },
    ];

    const renderRowActions = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>View</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('reports.payroll.title')}
                </h1>
            </div>

            <Card className="border border-border shadow-sm p-4 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Pay period
                        </label>
                        <Select value={payrollRunId} onValueChange={setPayrollRunId}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select pay period" />
                            </SelectTrigger>
                            <SelectContent>
                                {(filterOptions?.payPeriods ?? []).map((period) => (
                                    <SelectItem key={period.id} value={period.id}>
                                        {period.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {canSelectCompany && (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">
                                Company
                            </label>
                            <FormSelect<{ companyId: string }>
                                id="payroll-report-company"
                                placeholder={
                                    isLoadingCompanies ? 'Loading companies...' : 'Select company'
                                }
                                control={companyForm.control}
                                name="companyId"
                                t={t}
                                options={
                                    companiesData?.map((company) => ({
                                        label: company.name,
                                        value: company.id,
                                    })) || []
                                }
                                containerClassName="w-full"
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Employee
                        </label>
                        <Select value={employeeId} onValueChange={setEmployeeId}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All employee</SelectItem>
                                {(filterOptions?.employees ?? []).map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                        {employee.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Payroll status
                        </label>
                        <Select
                            value={payrollStatus}
                            onValueChange={(value) =>
                                setPayrollStatus(value as 'all' | 'active' | 'terminated')
                            }
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button variant="outline" className="h-10 flex-1" onClick={handleResetFilters}>
                            Reset filters
                        </Button>
                        <Button className="h-10 flex-1 bg-primary" onClick={handleApplyFilters}>
                            Apply filters
                        </Button>
                    </div>
                </div>
            </Card>

            {isLoadingReport ? (
                <SummaryStatListSkeleton count={4} />
            ) : (
                <SummaryStatList stats={payrollStats} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                            {t('reports.payroll.charts.payrollTrend')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={payrollConfig} className="h-75 w-full">
                            <AreaChart
                                data={payrollTrendData}
                                margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="fillPayroll" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-cost)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--color-cost)" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E5E5" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fill: '#737373', fontSize: 12 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fill: '#737373', fontSize: 12 }}
                                    domain={[0, trendMax]}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Area
                                    dataKey="cost"
                                    type="natural"
                                    fill="url(#fillPayroll)"
                                    stroke="var(--color-cost)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="border border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                            {t('reports.payroll.charts.deductionsBreakdown')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <ChartContainer config={deductionsConfig} className="h-60 w-full">
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                    data={deductionsBreakdownData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={50}
                                    strokeWidth={5}
                                >
                                    {deductionsBreakdownData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

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
                    searchPlaceholder="Search for employees"
                    showFilter
                    currentPage={currentPage}
                    totalPages={reportData?.pagination.totalPages ?? 1}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                    onSort={handleSort}
                    sortColumn={Object.entries(SORTABLE_COLUMNS).find(([, field]) => field === sortBy)?.[0]}
                    sortDirection={sortOrder}
                    isLoading={isLoadingReport}
                    renderRowActions={renderRowActions}
                    renderHeaderActions={
                        <ExportButton
                            data={tableRows}
                            columns={exportColumns}
                            filename="Payroll_Report"
                            onServerExport={handleServerExport}
                            serverExportLabel="Export full report"
                        />
                    }
                    totalItems={reportData?.pagination.total ?? 0}
                />
            </div>
        </div>
    );
};

export default PayrollReportsPage;
