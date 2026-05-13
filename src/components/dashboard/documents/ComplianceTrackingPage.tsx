'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Eye, Send, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { complianceTrackingStats, mockComplianceTracking, complianceAlerts } from '@/data/documents';
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

const ComplianceTrackingPage = () => {
    const { t } = useTranslation(['dashboard']);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
                    <span>View</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <span>Send reminder</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>Mark as resolved</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('documentData.complianceTracking.title')}
                </h1>
            </div>

            <SummaryStatList
                stats={complianceTrackingStats.map((stat) => ({
                    title: t(`documentData.complianceTracking.stats.${
                        stat.title === 'Fully Compliant' ? 'fullyCompliant' : 
                        stat.title === 'Non-Compliant' ? 'nonCompliant' : 
                        stat.title === 'Expiring Soon' ? 'expiringSoon' : 'totalCompliance'
                    }`),
                    value: stat.value,
                    icon: stat.icon,
                    iconBgColor: stat.bgColor,
                    iconColor: stat.color,
                    borderColor: stat.borderColor,
                }))}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border border-border shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/50 bg-gray-50/30">
                        <CardTitle className="text-base font-semibold text-foreground">
                            {t('documentData.complianceTracking.riskAlerts')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col divide-y divide-border/50">
                            {complianceAlerts.map((alert) => (
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
                                <Button variant="link" className="p-0 h-auto text-primary text-sm font-medium hover:no-underline">
                                    View affected employees
                                </Button>
                            </li>
                            <li>
                                <Button variant="link" className="p-0 h-auto text-primary text-sm font-medium hover:no-underline">
                                    Send reminder
                                </Button>
                            </li>
                            <li>
                                <Button variant="link" className="p-0 h-auto text-primary text-sm font-medium hover:no-underline">
                                    Generate report
                                </Button>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full">
                <UniversalDataTable
                    data={mockComplianceTracking}
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
                    totalItems={mockComplianceTracking.length}
                />
            </div>
        </div>
    );
};

export default ComplianceTrackingPage;
