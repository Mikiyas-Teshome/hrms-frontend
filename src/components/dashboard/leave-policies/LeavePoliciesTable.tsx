'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LeavePolicy } from '@/types/leave-policies';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListFilter, CircleCheck, CircleX, MoreVertical, Eye, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useLeavePoliciesPaginated,
  useDeleteLeavePolicy,
  useLeavePolicy,
  useUpdateLeavePolicyStatus,
} from '@/features/leave-policy/hooks/useLeavePolicy';
import {
  formatEntitlementGrantMode,
  formatUsageLimitScope,
  mapListItemToTableRow,
  mapStatusFilterToApi,
} from '@/features/leave-policy/leave-policy.mappers';
import type { LeavePolicyDetail } from '@/features/leave-policy/leave-policy.types';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

interface LeavePoliciesTableProps {
  companyOuId?: string;
  onEdit?: (policy: LeavePolicyDetail) => void;
  onView?: (policyId: string) => void;
}

const renderStatusBadge = (status: LeavePolicy['status'], label: string) => {
  const isActive = status === 'Active';
  const Icon = isActive ? CircleCheck : CircleX;
  const colorClass = isActive ? 'text-[#22C55E]' : 'text-[#EF4444]';
  const borderClass = isActive ? 'border-[#22C55E]/30' : 'border-[#EF4444]/30';

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-0.5 w-fit bg-background border rounded-lg',
        borderClass,
      )}
    >
      <Icon className={cn('w-3 h-3', colorClass)} strokeWidth={2} />
      <span className="text-[12px] font-semibold text-foreground">{label}</span>
    </div>
  );
};

const LeavePoliciesTable = ({ companyOuId, onEdit, onView }: LeavePoliciesTableProps) => {
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({ status: 'all' });
  const [activeFilters, setActiveFilters] = useState({ status: 'all' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<LeavePolicy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const [editFetchId, setEditFetchId] = useState<string | null>(null);
  const { data: policyForEdit } = useLeavePolicy(editFetchId ?? '');

  const filter = useMemo(() => {
    const statusApi = mapStatusFilterToApi(activeFilters.status);
    return statusApi ? { status: statusApi } : undefined;
  }, [activeFilters]);

  const { data: connection, isLoading, isError } = useLeavePoliciesPaginated(companyOuId, filter, {
    page: 1,
    pageSize: 500,
  });

  const { mutateAsync: deleteLeavePolicy } = useDeleteLeavePolicy(companyOuId);
  const { mutateAsync: updateLeavePolicyStatus } = useUpdateLeavePolicyStatus(companyOuId);

  useEffect(() => {
    if (policyForEdit && editFetchId && onEdit) {
      onEdit(policyForEdit);
      setEditFetchId(null);
    }
  }, [policyForEdit, editFetchId, onEdit]);

  const policiesData: LeavePolicy[] = useMemo(() => {
    if (!connection?.items) return [];
    return connection.items.map(mapListItemToTableRow);
  }, [connection]);

  const filteredPolicies = useMemo(() => {
    if (!searchValue) return policiesData;
    const needle = searchValue.toLowerCase();
    return policiesData.filter(
      (policy) =>
        policy.policyName.toLowerCase().includes(needle) ||
        policy.code.toLowerCase().includes(needle),
    );
  }, [policiesData, searchValue]);

  const paginatedPolicies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPolicies.slice(start, start + pageSize);
  }, [filteredPolicies, currentPage, pageSize]);

  const totalFilteredCount = filteredPolicies.length;
  const totalPages = totalFilteredCount === 0 ? 0 : Math.ceil(totalFilteredCount / pageSize);

  const handleApplyFilters = () => {
    setActiveFilters({ ...pendingFilters });
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const reset = { status: 'all' };
    setPendingFilters(reset);
    setActiveFilters(reset);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (policy: LeavePolicy) => {
    setPolicyToDelete(policy);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (policy: LeavePolicy) => {
    const policyId = String(policy.id);
    const nextStatus = policy.status === 'Active' ? 'inactive' : 'active';

    setStatusUpdatingId(policyId);
    try {
      await updateLeavePolicyStatus({ id: policyId, status: nextStatus });
      toast({
        title: t('leavePolicies.statusUpdated'),
        description: t('leavePolicies.statusUpdatedDesc'),
        variant: 'success',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('leavePolicies.statusUpdateError');
      toast({
        title: t('leavePolicies.deleteError'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete?.id) return;
    setIsDeleting(true);
    try {
      await deleteLeavePolicy(policyToDelete.id);
      setIsDeleteModalOpen(false);
      setPolicyToDelete(null);
      toast({
        title: t('leavePolicies.deleteSuccess'),
        description: t('leavePolicies.deleteSuccessDesc'),
        variant: 'success',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('leavePolicies.deleteErrorDesc');
      toast({
        title: t('leavePolicies.deleteError'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const expandedFilters = showFilters ? (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/30 rounded-xl border border-border">
      <div className="flex-1 space-y-1.5">
        <label className="text-sm font-semibold text-foreground px-1">
          {t('leavePolicies.table.status')}
        </label>
        <Select
          value={pendingFilters.status}
          onValueChange={(v) => setPendingFilters((p) => ({ ...p, status: v }))}
        >
          <SelectTrigger className="h-10 bg-background rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('leavePolicies.filter.allStatus')}</SelectItem>
            <SelectItem value="Active">{t('leavePolicies.status.active')}</SelectItem>
            <SelectItem value="Inactive">{t('leavePolicies.status.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
        <Button onClick={handleApplyFilters} className="h-10 px-6 bg-primary text-white">
          {t('leavePolicies.filter.apply')}
        </Button>
        <Button onClick={handleResetFilters} variant="outline" className="h-10 px-6">
          {t('leavePolicies.filter.reset')}
        </Button>
      </div>
    </div>
  ) : undefined;

  const columns: ColumnConfig<LeavePolicy>[] = [
    {
      key: 'policyName',
      label: t('leavePolicies.table.policyName'),
      sortable: true,
      className: 'font-medium text-foreground',
    },
    { key: 'code', label: t('leavePolicies.table.code') },
    { key: 'maxDaysPerYear', label: t('leavePolicies.table.maxDays') },
    {
      key: 'entitlementGrantMode',
      label: t('leavePolicies.table.entitlementGrantMode'),
      render: (item) => (
        <span className="text-sm">{formatEntitlementGrantMode(item.entitlementGrantMode)}</span>
      ),
    },
    {
      key: 'usageLimitScope',
      label: t('leavePolicies.table.usageLimitScope'),
      render: (item) => (
        <span className="text-sm">{formatUsageLimitScope(item.usageLimitScope)}</span>
      ),
    },
    { key: 'carryForward', label: t('leavePolicies.table.carryForward') },
    {
      key: 'status',
      label: t('leavePolicies.table.status'),
      render: (item) =>
        renderStatusBadge(
          item.status,
          item.status === 'Active'
            ? t('leavePolicies.status.active')
            : t('leavePolicies.status.inactive'),
        ),
    },
  ];

  const renderRowActions = (item: LeavePolicy) => {
    const apiStatus = item.status === 'Active' ? 'active' : 'inactive';
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-lg">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 rounded-xl">
          {hasPermission('leave_policies:read') && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onView?.(String(item.id))}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t('leavePolicies.actions.view')}
            </DropdownMenuItem>
          )}
          {hasPermission('leave_policies:update') && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setEditFetchId(String(item.id))}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t('leavePolicies.actions.edit')}
            </DropdownMenuItem>
          )}
          {hasPermission('leave_policies:update') && (
            <DropdownMenuItem
              className="cursor-pointer"
              disabled={statusUpdatingId === String(item.id)}
              onClick={() => handleToggleStatus(item)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {apiStatus === 'active'
                ? t('leavePolicies.actions.deactivate')
                : t('leavePolicies.actions.activate')}
            </DropdownMenuItem>
          )}
          {hasPermission('leave_policies:delete') && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => handleDeleteClick(item)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('leavePolicies.actions.delete')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const filterButton = (
    <Button
      variant="outline"
      className={cn('h-10 gap-2 border-input', showFilters && 'bg-muted')}
      onClick={() => setShowFilters((v) => !v)}
    >
      <ListFilter className="h-4 w-4" />
      <span>{t('attendance.filter')}</span>
    </Button>
  );

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {t('leavePolicies.loadError', 'Failed to load leave policies. Please try again.')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UniversalDataTable
        data={paginatedPolicies}
        columns={columns}
        isLoading={isLoading || !companyOuId}
        enableSelection={false}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('leaveRequests.filter.search')}
        renderCustomFilter={filterButton}
        expandedFilters={expandedFilters}
        showImport={false}
        showExport={false}
        currentPage={currentPage}
        totalPages={totalPages || 1}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        totalItems={totalFilteredCount}
        renderRowActions={renderRowActions}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={t('leavePolicies.deleteConfirmTitle')}
        message={t('leavePolicies.deleteConfirmMessage', { name: policyToDelete?.policyName || '' })}
        onConfirm={handleConfirmDelete}
        confirmLabel={t('leavePolicies.actions.delete')}
        cancelLabel={t('attendance.cancel')}
        isLoading={isDeleting}
        variant="danger"
      />

    </div>
  );
};

export default LeavePoliciesTable;
