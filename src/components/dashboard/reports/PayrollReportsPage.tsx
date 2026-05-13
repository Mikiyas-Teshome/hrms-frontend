/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import {
    payrollReportStats,
    payrollTrendData,
    deductionsBreakdownData,
    mockPayrollReportData,
} from '@/data/reports';
import { ExportButton } from './ExportButton';
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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const payrollConfig = {
    cost: {
        label: 'Payroll Cost',
        color: '#2865E3',
    },
} satisfies ChartConfig;

const deductionsConfig = {
    tax: {
        label: 'Tax',
        color: '#EA580C',
    },
    insurance: {
        label: 'Insurance',
        color: '#0D9488',
    },
    penalties: {
        label: 'Penalties',
        color: '#0F172A',
    },
    unpaidLeave: {
        label: 'Unpaid leave',
        color: '#F59E0B',
    },
} satisfies ChartConfig;

const PayrollReportsPage = () => {
    const { t } = useTranslation(['dashboard']);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const columns: ColumnConfig<any>[] = [
        {
            key: 'employee',
            label: 'Employee',
            sortable: true,
        },
        {
            key: 'salary',
            label: 'Salary (gross)',
            sortable: true,
        },
        {
            key: 'allowance',
            label: 'Allowance',
            sortable: true,
        },
        {
            key: 'deductions',
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
        { header: 'Employee', key: 'employee' },
        { header: 'Salary (gross)', key: 'salary' },
        { header: 'Allowance', key: 'allowance' },
        { header: 'Deductions', key: 'deductions' },
        { header: 'Net Pay', key: 'netPay' },
        { header: 'Status', key: 'status' },
    ];

    const renderRowActions = (item: any) => (
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
                    {t('reports.payroll.title')}
                </h1>
            </div>

            {/* Filters */}
            <Card className="border border-border shadow-sm p-4 bg-card">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Pay period
                        </label>
                        <Select defaultValue="may">
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="May" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="may">May</SelectItem>
                                <SelectItem value="april">April</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Company
                        </label>
                        <Select defaultValue="abc">
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="ABC trading" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="abc">ABC trading</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Employee
                        </label>
                        <Select defaultValue="all">
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="All employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All employee</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                            Payroll status
                        </label>
                        <Select defaultValue="active">
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Active" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button variant="outline" className="h-10 flex-1">
                            Reset filters
                        </Button>
                        <Button className="h-10 flex-1 bg-primary">Apply filters</Button>
                    </div>
                </div>
            </Card>

            <SummaryStatList
                stats={payrollReportStats.map((stat) => ({
                    title: t(
                        `reports.payroll.stats.${
                            stat.title === 'Total Payroll Cost'
                                ? 'totalCost'
                                : stat.title === 'Net pay'
                                  ? 'netPay'
                                  : stat.title === 'Total Deductions'
                                    ? 'totalDeductions'
                                    : 'overtimeCost'
                        }`,
                    ),
                    value: stat.value,
                    icon: stat.icon,
                    iconBgColor: stat.bgColor,
                    iconColor: stat.color,
                    borderColor: stat.borderColor,
                }))}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                            {t('reports.payroll.charts.payrollTrend')}
                        </CardTitle>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={payrollConfig} className="h-75 w-full">
                            <AreaChart
                                data={payrollTrendData}
                                margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="fillPayroll" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-cost)"
                                            stopOpacity={0.4}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-cost)"
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
                                    domain={[0, 400]}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
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
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <ChartContainer config={deductionsConfig} className="h-60 w-full">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
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
                    data={mockPayrollReportData}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Search for employees"
                    showFilter
                    currentPage={currentPage}
                    totalPages={1}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    renderRowActions={renderRowActions}
                    renderHeaderActions={
                        <ExportButton
                            data={mockPayrollReportData}
                            columns={exportColumns}
                            filename="Payroll_Report"
                        />
                    }
                    totalItems={mockPayrollReportData.length}
                />
            </div>
        </div>
    );
};

export default PayrollReportsPage;
