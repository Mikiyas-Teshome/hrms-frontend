'use client';

import { LeaveRequest } from '@/types/leave-requests';
import React, { useMemo, useState } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Button } from '@/components/ui/button';
import { ListFilter, CircleCheck, Sun, CircleX, Plus } from 'lucide-react';
import CreateLeaveRequestSheet from './CreateLeaveRequestSheet';
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
import { useLeaveRequestsPaginated } from '@/features/leave-request/hooks/useLeaveRequest';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { LeaveRequestFilterInput } from '@/features/leave-request/leave-request.types';
import { mapDisplayStatusToApiStatus, mapListItemToLeaveRequest } from './leave-request.util';

const renderStatusBadge = (status: LeaveRequest['status'], label: string) => {
  let Icon = CircleCheck;
  let iconClass = 'text-[#22C55E]';

  if (status === 'Manager approved' || status === 'HR approved') {
    Icon = Sun;
    iconClass = 'text-[#D97706]';
  } else if (status === 'Pending') {
    Icon = Sun;
    iconClass = 'text-muted-foreground';
  } else if (status === 'Rejected' || status === 'Cancelled') {
    Icon = CircleX;
    iconClass = 'text-[#EF4444]';
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit bg-background border border-border rounded-lg">
      <Icon className={`w-3.5 h-3.5 ${iconClass}`} strokeWidth={1.5} />
      <span className="text-xs font-semibold text-[#0A0A0A] dark:text-foreground">{label}</span>
    </div>
  );
};

const renderRequestTypeBadge = (type: string) => {
  let bgClass = 'bg-[#F1F5F9] text-[#475569]';

  if (type.toLowerCase().includes('annual')) {
    bgClass = 'bg-[#E0F2FE] text-[#0369A1]';
  } else if (type.toLowerCase().includes('sick')) {
    bgClass = 'bg-[#FEE2E2] text-[#B91C1C]';
  } else if (type.toLowerCase().includes('maternity')) {
    bgClass = 'bg-[#F3F4F6] text-[#1F2937]';
  }

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', bgClass)}>{type}</span>
  );
};

interface LeaveRequestsTableProps {
  companyOuId?: string;
}

const LeaveRequestsTable = ({ companyOuId }: LeaveRequestsTableProps) => {
  const { t, i18n } = useTranslation('dashboard');
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('leave_requests:read');
  const canApprove = hasPermission('leave_requests:approve');
  const canCreate = hasPermission('leave_requests:create');
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ status: 'all' });
  const [pendingFilters, setPendingFilters] = useState({ status: 'all' });
  const activeCount = Object.values(activeFilters).filter((v) => v !== 'all').length;
  const [isReviewSheetOpen, setIsReviewSheetOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const apiFilter = useMemo((): LeaveRequestFilterInput | undefined => {
    const filter: LeaveRequestFilterInput = {};
    if (searchValue.trim()) {
      filter.search = searchValue.trim();
    }
    if (activeFilters.status !== 'all') {
      const apiStatus = mapDisplayStatusToApiStatus(activeFilters.status);
      if (apiStatus) {
        filter.status = apiStatus;
      }
    }
    return Object.keys(filter).length > 0 ? filter : undefined;
  }, [searchValue, activeFilters]);

  const { data: connection, isLoading, isError } = useLeaveRequestsPaginated(companyOuId, apiFilter, {
    page: currentPage,
    pageSize,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const displayData = useMemo(() => {
    const items = (connection?.items ?? []).map((item) =>
      mapListItemToLeaveRequest(item, i18n.language),
    );
    if (activeFilters.status === 'Manager approved') {
      return items.filter((item) => item.status === 'Manager approved');
    }
    if (activeFilters.status === 'HR approved') {
      return items.filter((item) => item.status === 'HR approved');
    }
    return items;
  }, [connection?.items, activeFilters.status, i18n.language]);

  const handleReviewClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsReviewSheetOpen(true);
  };

  const handleApply = () => {
    setActiveFilters(pendingFilters);
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handleReset = () => {
    const defaultFilters = { status: 'all' };
    setPendingFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setCurrentPage(1);
  };

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
        <label className="text-sm font-semibold text-foreground px-1">
          {t('leaveRequests.filter.status', 'Status')}
        </label>
        <Select
          value={pendingFilters.status}
          onValueChange={(v) => setPendingFilters((p) => ({ ...p, status: v }))}
        >
          <SelectTrigger className="h-10 bg-background rounded-lg">
            <SelectValue placeholder={t('leaveRequests.filter.allStatus', 'All status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('leaveRequests.filter.allStatus', 'All statuses')}</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="HR approved">HR approved</SelectItem>
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
      label: t('leaveRequests.table.requestType', 'Leave type'),
      render: (item) => renderRequestTypeBadge(item.requestType),
    },
    {
      key: 'duration',
      label: t('leaveRequests.table.duration', 'Duration'),
    },
    {
      key: 'status',
      label: t('leaveRequests.table.status', 'Status'),
      render: (item) => renderStatusBadge(item.status, item.status),
    },
    {
      key: 'appliedOn',
      label: t('leaveRequests.table.appliedOn', 'Applied on'),
    },
  ];

  const renderRowActions = (item: LeaveRequest) => {
    if (!canRead) {
      return null;
    }

    return (
      <Button
        variant="ghost"
        className="text-primary hover:text-primary/90 font-medium text-xs rounded-lg px-3 py-1 h-8 w-fit shrink-0 bg-transparent hover:bg-primary/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleReviewClick(item);
        }}
      >
        {canApprove
          ? t('leaveRequests.actions.reviewRequest', 'Review request')
          : t('leaveRequests.actions.view', 'View details')}
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      <UniversalDataTable
        data={isError ? [] : displayData}
        columns={columns}
        isLoading={isLoading || !companyOuId}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          setCurrentPage(1);
        }}
        searchPlaceholder={t('leaveRequests.filter.search', 'Search for employees')}
        renderCustomFilter={filterButton}
        renderHeaderActions={
          canCreate ? (
            <Button
              className="h-10 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 shrink-0"
              onClick={() => setIsCreateSheetOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium text-sm">{t('leaveRequests.requestLeave')}</span>
            </Button>
          ) : undefined
        }
        renderFilterPanel={filterPanel}
        showImport={false}
        showExport={false}
        currentPage={currentPage}
        totalPages={connection?.totalPages ?? 1}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        totalItems={connection?.totalCount ?? 0}
        renderRowActions={renderRowActions}
        onRowClick={() => {}}
      />

      <ReviewRequestSheet
        open={isReviewSheetOpen}
        onOpenChange={setIsReviewSheetOpen}
        request={selectedRequest}
      />

      <CreateLeaveRequestSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onSuccess={() => setIsCreateSheetOpen(false)}
      />
    </div>
  );
};

export default LeaveRequestsTable;
