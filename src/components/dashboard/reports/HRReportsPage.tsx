/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Users, UserPlus } from 'lucide-react';
// No mock data imports needed
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
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart } from 'recharts';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmployeeSalaryHistory } from '@/features/payroll/hooks/usePayroll';
import { useEmployeeTransferHistory } from '@/features/employee/hooks/useEmployee';
import { useAuditLogs } from '@/features/audit/hooks/useAudit';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { useHrReport, useHrReportFilterOptions } from '@/features/reports/reports.hooks';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ExportButton } from './ExportButton';

const headcountConfig = {
    headcount: {
        label: 'Headcount',
        color: '#2865E3',
    },
} satisfies ChartConfig;

const attendanceConfig = {
    present: {
        label: 'Present',
        color: '#8A38F5',
    },
    absent: {
        label: 'Absent',
        color: '#0D9488',
    },
    onLeave: {
        label: 'On leave',
        color: '#4F46E5',
    },
} satisfies ChartConfig;

const HRReportsPage = () => {
    const { t } = useTranslation(['dashboard']);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<string>(
        format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    );
    const [dateTo, setDateTo] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [companyOuId, setCompanyOuId] = useState<string>('');
    const [divisionOuId, setDivisionOuId] = useState<string>('');
    const [subDivisionOuId, setSubDivisionOuId] = useState<string>('');
    const [employeeType, setEmployeeType] = useState<any>('ALL');

    const { data: profile } = useProfile();
    const { data: employees = [] } = useEmployees();
    const { data: filterOptions } = useHrReportFilterOptions();

    const { data: reportData, isLoading: isLoadingReport } = useHrReport({
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo).toISOString(),
        companyOuId: companyOuId || undefined,
        divisionOuId: divisionOuId || undefined,
        subDivisionOuId: subDivisionOuId || undefined,
        employeeType,
        page: currentPage,
        limit: pageSize,
        search: searchValue || undefined,
    });

    const { data: salaryHistory = [], isLoading: isLoadingSalary } = useEmployeeSalaryHistory(
        selectedEmployeeId === 'all' ? '' : selectedEmployeeId,
    );
    const { data: transferHistory = [], isLoading: isLoadingTransfers } =
        useEmployeeTransferHistory(selectedEmployeeId === 'all' ? '' : selectedEmployeeId);
    const { data: auditLogs = [], isLoading: isLoadingAudit } = useAuditLogs({
        companyId: profile?.companyId,
    });

    const columns: ColumnConfig<any>[] = [
        {
            key: 'firstName',
            label: 'Name',
            sortable: true,
            render: (item) => (
                <span>
                    {item.firstName} {item.lastName}
                </span>
            ),
        },
        {
            key: 'jobTitle',
            label: 'Job Title',
            sortable: true,
        },
        {
            key: 'businessEmail',
            label: 'Email',
            sortable: true,
        },
        {
            key: 'status',
            label: 'Status',
            render: (item) => (
                <Badge
                    variant="outline"
                    className={
                        item.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                    }
                >
                    <div
                        className={
                            item.status === 'ACTIVE'
                                ? 'w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5'
                                : 'w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5'
                        }
                    />
                    {item.status}
                </Badge>
            ),
        },
    ];

    const salaryHistoryColumns: ColumnConfig<any>[] = [
        {
            key: 'effectiveDate',
            label: 'Effective Date',
            render: (item) => format(new Date(item.effectiveDate), 'PPP'),
        },
        {
            key: 'oldBasicSalary',
            label: 'Old Salary',
            render: (item) => `$${item.oldBasicSalary.toLocaleString()}`,
        },
        {
            key: 'newBasicSalary',
            label: 'New Salary',
            render: (item) => `$${item.newBasicSalary.toLocaleString()}`,
        },
        { key: 'changeReason', label: 'Reason' },
        { key: 'processedBy', label: 'Processed By' },
    ];

    const transferHistoryColumns: ColumnConfig<any>[] = [
        {
            key: 'transferDate',
            label: 'Transfer Date',
            render: (item) => format(new Date(item.transferDate), 'PPP'),
        },
        { key: 'fromDepartmentId', label: 'From Dept' },
        { key: 'toDepartmentId', label: 'To Dept' },
        { key: 'reason', label: 'Reason' },
        { key: 'processedBy', label: 'Processed By' },
    ];

    const auditLogColumns: ColumnConfig<any>[] = [
        {
            key: 'createdAt',
            label: 'Date',
            render: (item) => format(new Date(item.createdAt), 'PPP p'),
        },
        {
            key: 'action',
            label: 'Action',
            render: (item) => <Badge variant="secondary">{item.action}</Badge>,
        },
        { key: 'entityType', label: 'Type' },
        { key: 'userId', label: 'User ID' },
        { key: 'ipAddress', label: 'IP Address' },
    ];

    const exportColumns = {
        overview: [
            { header: 'First Name', key: 'firstName' },
            { header: 'Last Name', key: 'lastName' },
            { header: 'Job Title', key: 'jobTitle' },
            { header: 'Email', key: 'businessEmail' },
            { header: 'Status', key: 'status' },
        ],
        salaryHistory: [
            {
                header: 'Effective Date',
                key: 'effectiveDate',
                render: (item: any) => format(new Date(item.effectiveDate), 'PPP'),
            },
            {
                header: 'Old Salary',
                key: 'oldBasicSalary',
                render: (item: any) => `$${item.oldBasicSalary.toLocaleString()}`,
            },
            {
                header: 'New Salary',
                key: 'newBasicSalary',
                render: (item: any) => `$${item.newBasicSalary.toLocaleString()}`,
            },
            { header: 'Reason', key: 'changeReason' },
            { header: 'Processed By', key: 'processedBy' },
        ],
        transferHistory: [
            {
                header: 'Transfer Date',
                key: 'transferDate',
                render: (item: any) => format(new Date(item.transferDate), 'PPP'),
            },
            { header: 'From Dept', key: 'fromDepartmentId' },
            { header: 'To Dept', key: 'toDepartmentId' },
            { header: 'Reason', key: 'reason' },
            { header: 'Processed By', key: 'processedBy' },
        ],
        auditLogs: [
            {
                header: 'Date',
                key: 'createdAt',
                render: (item: any) => format(new Date(item.createdAt), 'PPP p'),
            },
            { header: 'Action', key: 'action' },
            { header: 'Type', key: 'entityType' },
            { header: 'User ID', key: 'userId' },
            { header: 'IP Address', key: 'ipAddress' },
        ],
    };

    const renderRowActions = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>View</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('reports.hr.title')}
                </h1>
            </div>

            {/* Filters */}
            <Card className="border border-border shadow-sm p-4 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            From
                        </label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="h-10"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            To
                        </label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="h-10"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Division
                        </label>
                        <Select value={divisionOuId} onValueChange={setDivisionOuId}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select division" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All divisions</SelectItem>
                                {filterOptions?.divisions?.map((div) => (
                                    <SelectItem key={div.id} value={div.id}>
                                        {div.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Sub-division
                        </label>
                        <Select value={subDivisionOuId} onValueChange={setSubDivisionOuId}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select sub-division" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All sub-divisions</SelectItem>
                                {filterOptions?.subDivisions?.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Employee
                        </label>
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All employee</SelectItem>
                                {employees.map((emp: any) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button
                            variant="outline"
                            className="h-10 flex-1"
                            onClick={() => {
                                setSelectedEmployeeId('all');
                                setDivisionOuId('');
                                setSubDivisionOuId('');
                            }}
                        >
                            Reset
                        </Button>
                        <Button className="h-10 flex-1 bg-primary">Apply</Button>
                    </div>
                </div>
            </Card>

            <SummaryStatList
                stats={[
                    {
                        title: t('reports.hr.stats.totalEmployees'),
                        value: reportData?.summary.totalEmployees.toString() || '0',
                        icon: Users,
                        iconBgColor: 'rgba(40, 101, 227, 0.05)',
                        iconColor: '#2865E3',
                        borderColor: 'rgba(40, 101, 227, 0.5)',
                    },
                    {
                        title: t('reports.hr.stats.newHires'),
                        value: reportData?.summary.newHires.toString() || '0',
                        icon: UserPlus,
                        iconBgColor: 'rgba(217, 119, 6, 0.05)',
                        iconColor: '#D97706',
                        borderColor: 'rgba(217, 119, 6, 0.5)',
                    },
                    {
                        title: t('reports.hr.stats.attendanceRate'),
                        value: `${reportData?.summary.attendanceRate || 0}%`,
                        icon: Users,
                        iconBgColor: 'rgba(138, 56, 245, 0.05)',
                        iconColor: '#8A38F5',
                        borderColor: 'rgba(138, 56, 245, 0.5)',
                    },
                    {
                        title: t('reports.hr.stats.complianceRate'),
                        value: `${reportData?.summary.complianceRate || 0}%`,
                        icon: UserPlus,
                        iconBgColor: 'rgba(34, 197, 94, 0.05)',
                        iconColor: '#22C55E',
                        borderColor: 'rgba(34, 197, 94, 0.5)',
                    },
                ]}
            />

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-lg mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="salary-history">Salary History</TabsTrigger>
                    <TabsTrigger value="transfer-history">Transfer History</TabsTrigger>
                    <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border border-border shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-semibold">
                                    {t('reports.hr.charts.headcountTrend')}
                                </CardTitle>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={headcountConfig} className="h-62.5 w-full">
                                    <AreaChart
                                        data={reportData?.headcountTrend || []}
                                        margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="fillHeadcount"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-headcount)"
                                                    stopOpacity={0.4}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-headcount)"
                                                    stopOpacity={0.01}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            stroke="#E5E5E5"
                                        />
                                        <XAxis
                                            dataKey="label"
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
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Area
                                            dataKey="value"
                                            type="natural"
                                            fill="url(#fillHeadcount)"
                                            stroke="var(--color-headcount)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card className="border border-border shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-semibold">
                                    {t('reports.hr.charts.attendanceOverview')}
                                </CardTitle>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={attendanceConfig} className="h-62.5 w-full">
                                    <BarChart
                                        data={reportData?.attendanceOverview || []}
                                        margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            stroke="#E5E5E5"
                                        />
                                        <XAxis
                                            dataKey="label"
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
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Bar
                                            dataKey="present"
                                            fill="var(--color-present)"
                                            radius={[2, 2, 0, 0]}
                                            barSize={12}
                                        />
                                        <Bar
                                            dataKey="absent"
                                            fill="var(--color-absent)"
                                            radius={[2, 2, 0, 0]}
                                            barSize={12}
                                        />
                                        <Bar
                                            dataKey="onLeave"
                                            fill="var(--color-onLeave)"
                                            radius={[2, 2, 0, 0]}
                                            barSize={12}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="w-full">
                        <UniversalDataTable
                            data={reportData?.rows || []}
                            columns={columns}
                            enableSelection
                            searchValue={searchValue}
                            onSearchChange={setSearchValue}
                            searchPlaceholder="Search for employees"
                            showFilter
                            currentPage={currentPage}
                            totalPages={reportData?.pagination.totalPages || 1}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                            isLoading={isLoadingReport}
                            renderRowActions={renderRowActions}
                            renderHeaderActions={
                                <ExportButton
                                    data={reportData?.rows || []}
                                    columns={exportColumns.overview}
                                    filename="HR_Overview_Report"
                                />
                            }
                            totalItems={reportData?.pagination.total || 0}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="salary-history">
                    <UniversalDataTable
                        data={salaryHistory}
                        columns={salaryHistoryColumns}
                        isLoading={isLoadingSalary}
                        searchPlaceholder="Search salary changes"
                        currentPage={1}
                        totalPages={1}
                        pageSize={10}
                        onPageChange={() => {}}
                        onPageSizeChange={() => {}}
                        renderHeaderActions={
                            <ExportButton
                                data={salaryHistory}
                                columns={exportColumns.salaryHistory}
                                filename="Salary_History_Report"
                            />
                        }
                        totalItems={salaryHistory.length}
                    />
                </TabsContent>

                <TabsContent value="transfer-history">
                    <UniversalDataTable
                        data={transferHistory}
                        columns={transferHistoryColumns}
                        isLoading={isLoadingTransfers}
                        searchPlaceholder="Search transfer records"
                        currentPage={1}
                        totalPages={1}
                        pageSize={10}
                        onPageChange={() => {}}
                        onPageSizeChange={() => {}}
                        renderHeaderActions={
                            <ExportButton
                                data={transferHistory}
                                columns={exportColumns.transferHistory}
                                filename="Transfer_History_Report"
                            />
                        }
                        totalItems={transferHistory.length}
                    />
                </TabsContent>

                <TabsContent value="audit-logs">
                    <UniversalDataTable
                        data={auditLogs}
                        columns={auditLogColumns}
                        isLoading={isLoadingAudit}
                        searchPlaceholder="Search audit logs"
                        currentPage={1}
                        totalPages={1}
                        pageSize={10}
                        onPageChange={() => {}}
                        onPageSizeChange={() => {}}
                        renderHeaderActions={
                            <ExportButton
                                data={auditLogs}
                                columns={exportColumns.auditLogs}
                                filename="Audit_Logs_Report"
                            />
                        }
                        totalItems={auditLogs.length}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default HRReportsPage;
