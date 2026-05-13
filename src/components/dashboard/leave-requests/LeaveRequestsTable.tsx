'use client';
import { LeaveRequest } from '@/types/leave-requests';
import React, { useState } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Button } from '@/components/ui/button';
import { ListFilter, CircleCheck, Sun, CircleX } from 'lucide-react';
import { mockLeaveRequestsData } from '@/data/leave-requests';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ReviewRequestSheet from './ReviewRequestSheet';
import { useLeaveRequestsByCompany } from '@/features/leave-request/hooks/useLeaveRequest';
import { useLeaveTypes } from '@/features/leave-type/hooks/useLeaveType';
import { LeaveRequestResponse } from '@/features/leave-request/leave-request.types';
import { LeaveTypeResponse } from '@/features/leave-type/leave-type.types';

const renderStatusBadge = (status: LeaveRequest['status'], label: string) => {
    let Icon = CircleCheck;
    let iconClass = 'text-[#22C55E]';

    if (status === 'Manager approved') {
        Icon = Sun;
        iconClass = 'text-[#D97706]';
    } else if (status === 'Pending') {
        Icon = Sun; // Using Sun as a proxy for the pending icon in design
        iconClass = 'text-muted-foreground';
    } else if (status === 'Rejected') {
        Icon = CircleX;
        iconClass = 'text-[#EF4444]';
    }

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit bg-background border border-border rounded-lg">
            <Icon className={`w-3.5 h-3.5 ${iconClass}`} strokeWidth={1.5} />
            <span className="text-xs font-semibold text-[#0A0A0A]">{label}</span>
        </div>
    );
};

const renderRequestTypeBadge = (type: string) => {
    let bgClass = 'bg-[#F1F5F9] text-[#475569]'; // Default
    
    if (type === 'Annual leave') {
        bgClass = 'bg-[#E0F2FE] text-[#0369A1]';
    } else if (type === 'Sick leave') {
        bgClass = 'bg-[#FEE2E2] text-[#B91C1C]';
    } else if (type === 'Maternity leave') {
        bgClass = 'bg-[#F3F4F6] text-[#1F2937]';
    }

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", bgClass)}>
            {type}
        </span>
    );
};

const LeaveRequestsTable = () => {
    const { t } = useTranslation('dashboard');
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filters
    const [activeFilters, setActiveFilters] = useState({ status: 'all' });
    const [pendingFilters, setPendingFilters] = useState({ status: 'all' });
    const activeCount = Object.values(activeFilters).filter((v) => v !== 'all').length;

    const [isReviewSheetOpen, setIsReviewSheetOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

    const handleReviewClick = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setIsReviewSheetOpen(true);
    };

    const handleApply = () => {
        setActiveFilters(pendingFilters);
        setShowFilters(false);
    };

    const handleReset = () => {
        const defaultFilters = { status: 'all' };
        setPendingFilters(defaultFilters);
        setActiveFilters(defaultFilters);
    };

    const { data: apiData, isLoading: isRequestsLoading, isError } = useLeaveRequestsByCompany();
    const { data: leaveTypes, isLoading: isLeaveTypesLoading } = useLeaveTypes();
    
    const mappedApiData: LeaveRequest[] = (apiData || []).map((req: LeaveRequestResponse) => {
        const leaveType = leaveTypes?.find((lt: LeaveTypeResponse) => lt.id === req.leaveTypeId);
        return {
            id: req.id,
            employeeName: `Emp-${req.employeeId.substring(0, 4)}`, // mapped from id since user details aren't included
            requestType: leaveType ? leaveType.name : 'Unknown Leave',
            leaveFrom: new Date(req.startDate).toLocaleDateString(),
            leaveTo: new Date(req.endDate).toLocaleDateString(),
            duration: `${req.totalDays} Days`,
            reason: req.reason,
            status: (req.status.charAt(0).toUpperCase() + req.status.slice(1).toLowerCase()) as LeaveRequest['status']
        };
    });

    const displayData = (isRequestsLoading || isLeaveTypesLoading) ? [] : (isError ? mockLeaveRequestsData : mappedApiData);
    const isLoading = isRequestsLoading || isLeaveTypesLoading;

    // Filter local data
    const filteredData = displayData.filter((item) => {
        const matchSearch = item.employeeName.toLowerCase().includes(searchValue.toLowerCase());
        const matchStatus = activeFilters.status === 'all' || item.status === activeFilters.status;
        return matchSearch && matchStatus;
    });

    const filterButton = (
        <Button
            variant="outline"
            size="default"
            className={cn('h-10 gap-2 border-input', showFilters && 'bg-black/5 dark:bg-white/5')}
            onClick={() => setShowFilters((v) => !v)}
        >
            <ListFilter className="h-4 w-4" />
            <span>{t('attendance.filter', 'Filter')}</span>
            {activeCount > 0 && (
                <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white font-semibold">
                    {activeCount}
                </span>
            )}
        </Button>
    );

    const filterPanel = showFilters ? (
        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-border flex flex-col lg:flex-row lg:items-end gap-4 overflow-hidden">
            <div className="flex-1 space-y-1.5">
                <label className="text-sm font-semibold text-foreground px-1">{t('leaveRequests.filter.status', 'Status')}</label>
                <Select value={pendingFilters.status} onValueChange={(v) => setPendingFilters((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="h-10 bg-background rounded-lg">
                        <SelectValue placeholder={t('leaveRequests.filter.allStatus', 'All status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('leaveRequests.filter.allStatus', 'All statuses')}</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Manager approved">Manager approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                <Button
                    onClick={handleApply}
                    className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-sm transition-colors"
                >
                    {t('leaveRequests.filter.apply', 'Apply filters')}
                </Button>
                <Button
                    onClick={handleReset}
                    variant="outline"
                    className="h-10 px-6 rounded-lg bg-white border-border hover:bg-muted font-medium shadow-sm transition-colors"
                >
                    {t('leaveRequests.filter.reset', 'Reset filters')}
                </Button>
            </div>
        </div>
    ) : undefined;

    const columns: ColumnConfig<LeaveRequest>[] = [
        {
            key: 'employeeName',
            label: t('leaveRequests.table.employee', 'Employee'),
            sortable: true,
            className: 'font-medium',
        },
        {
            key: 'requestType',
            label: t('leaveRequests.table.requestType', 'Request type'),
            render: (item) => renderRequestTypeBadge(item.requestType)
        },
        {
            key: 'leaveFrom',
            label: t('leaveRequests.table.leaveFrom', 'Leave from'),
        },
        {
            key: 'leaveTo',
            label: t('leaveRequests.table.leaveTo', 'Leave to'),
        },
        {
            key: 'duration',
            label: t('leaveRequests.table.duration', 'Duration'),
        },
        {
            key: 'status',
            label: t('leaveRequests.table.status', 'Status'),
            render: (item) => renderStatusBadge(item.status, item.status)
        },
    ];

    const handleRowClick = (item: LeaveRequest) => {
    };

    const renderRowActions = (item: LeaveRequest) => (
        <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/90 font-medium text-xs rounded-lg px-3 py-1 h-8 w-fit shrink-0 bg-transparent hover:bg-primary/10 transition-colors"
            onClick={(e) => {
                e.stopPropagation();
                handleReviewClick(item);
            }}
        >
            {t('actions.reviewRequest', 'Review request')}
        </Button>
    );

    return (
        <div className="space-y-4">
            <UniversalDataTable
                data={filteredData}
                columns={columns}
                isLoading={isLoading}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder={t('leaveRequests.filter.search', 'Search for employees')}
                renderCustomFilter={filterButton}
                renderFilterPanel={filterPanel}
                showImport={false}
                showExport={false}
                currentPage={currentPage}
                totalPages={1}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                totalItems={filteredData.length}
                renderRowActions={renderRowActions}
                onRowClick={handleRowClick}
            />

            <ReviewRequestSheet
                open={isReviewSheetOpen}
                onOpenChange={setIsReviewSheetOpen}
                request={selectedRequest}
            />
        </div>
    );
};

export default LeaveRequestsTable;
