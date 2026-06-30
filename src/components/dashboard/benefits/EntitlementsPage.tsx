'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Trash2, PencilLine, RefreshCw, ListFilter } from 'lucide-react';
import { entitlementStats } from '@/data/benefits';
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
import { FormSelect } from '@/components/ui/FormSelect';
import AddEntitlementSheet from './AddEntitlementSheet';
import EntitlementDetailSheet from './EntitlementDetailSheet';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import {
  useBenefitEntitlements,
  useBenefitEntitlementStats,
  useDeleteBenefitEntitlement,
  useUpdateBenefitEntitlementStatus,
} from '@/features/entitlements/hooks/useEntitlements';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { BenefitEntitlement } from '@/features/entitlements/entitlements.types';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatEntitlementValue = (item: BenefitEntitlement) => {
  const definition = item.valueDefinition?.toUpperCase();
  if (definition === 'PERCENTAGE' && item.amount !== undefined) {
    return `${item.amount}%`;
  }
  if (item.amount !== undefined && item.amount !== null) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: item.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(item.amount);
  }
  return formatLabel(item.valueDefinition || '');
};

const EntitlementsPage = () => {
  const { t } = useTranslation(['entitlement', 'dashboard']);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canManageEntitlements = hasPermission('benefits_entitlements:update');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedEntitlement, setSelectedEntitlement] = useState<BenefitEntitlement | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entitlementToDelete, setEntitlementToDelete] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    status?: string;
    type?: string;
    assignment?: string;
  }>({});

  const form = useForm({
    defaultValues: {
      ouId: '',
    },
  });
  const filterForm = useForm({
    defaultValues: {
      status: 'all',
      type: 'all',
      assignment: 'all',
    },
  });

  const selectedOuId = useWatch({
    control: form.control,
    name: 'ouId',
  });

  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

  useEffect(() => {
    if (companiesData?.length && !form.getValues('ouId')) {
      form.setValue('ouId', companiesData[0].id);
    }
  }, [companiesData, form]);

  const { data, isLoading } = useBenefitEntitlements({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    ouId: selectedOuId || undefined,
    sortBy: mapEntitlementSortBy(sortColumn) ?? 'createdAt',
    sortOrder: sortDirection === 'asc' ? 'ASC' : 'DESC',
    status: appliedFilters.status,
    type: appliedFilters.type as any,
    assignment: appliedFilters.assignment as any,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const { data: statsData } = useBenefitEntitlementStats(selectedOuId || undefined);

  const deleteMutation = useDeleteBenefitEntitlement();
  const updateStatusMutation = useUpdateBenefitEntitlementStatus();

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  const dynamicStats = entitlementStats.map((stat) => {
    let value = stat.value;

    if (statsData) {
      switch (stat.id) {
        case 'numEntitlements':
          value = statsData.totalEntitlements.toString();
          break;
        case 'activeEntitlements':
          value = statsData.activeEntitlements.toString();
          break;
        case 'assignedToAll':
          value = statsData.assignedToAll.toString();
          break;
        case 'monthlySpending':
          value = formatCurrency(statsData.monthlySpending);
          break;
      }
    }

    return { ...stat, value };
  });

  const handleEdit = (entitlement: BenefitEntitlement) => {
    if (!canManageEntitlements) return;
    setSelectedEntitlement(entitlement);
    setIsAddSheetOpen(true);
  };

  const handleView = (entitlement: BenefitEntitlement) => {
    setSelectedEntitlement(entitlement);
    setIsDetailSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!canManageEntitlements) return;
    setEntitlementToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateStatus = (entitlement: BenefitEntitlement) => {
    if (!canManageEntitlements) return;
    const isActive = entitlement.status.toLowerCase() === 'active';
    const nextStatus = isActive ? 'inactive' : 'active';

    updateStatusMutation.mutate(
      { id: entitlement.id, input: { status: nextStatus } },
      {
        onSuccess: (result) => {
          if (result && !result.success) {
            toast({
              title: t('actions.statusUpdateError', { defaultValue: 'Failed to update status' }),
              description: result.error,
              variant: 'destructive',
            });
            return;
          }
          toast({
            title: t('actions.statusUpdateSuccess', { defaultValue: 'Status updated successfully' }),
          });
        },
        onError: () => {
          toast({
            title: t('actions.statusUpdateError', { defaultValue: 'Failed to update status' }),
            variant: 'destructive',
          });
        },
      },
    );
  };

  const handleConfirmDelete = async () => {
    if (!entitlementToDelete) return;
    try {
      const result = await deleteMutation.mutateAsync(entitlementToDelete);
      if (result && !result.success) {
        toast({
          title: t('delete.error', { defaultValue: 'Failed to delete entitlement' }),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: t('delete.success', { defaultValue: 'Entitlement deleted successfully' }),
      });
    } catch {
      toast({
        title: t('delete.error', { defaultValue: 'Failed to delete entitlement' }),
        variant: 'destructive',
      });
    } finally {
      setIsDeleteModalOpen(false);
      setEntitlementToDelete(null);
    }
  };

  const columns: ColumnConfig<BenefitEntitlement>[] = [
    {
      key: 'name',
      label: t('table.entitlementName', { defaultValue: 'Entitlement name' }),
      sortable: true,
    },
    {
      key: 'type',
      label: t('table.type', { defaultValue: 'Type' }),
      sortable: true,
      render: (item) => formatLabel(item.type),
    },
    {
      key: 'amount',
      label: t('table.value', { defaultValue: 'Value' }),
      sortable: true,
      render: (item) => formatEntitlementValue(item),
    },
    {
      key: 'assignment',
      label: t('table.assignedTo', { defaultValue: 'Assigned to' }),
      sortable: true,
      render: (item) => formatLabel(item.assignment),
    },
    {
      key: 'frequency',
      label: t('table.frequency', { defaultValue: 'Frequency' }),
      sortable: true,
      render: (item) => formatLabel(item.frequency),
    },
    {
      key: 'status',
      label: t('table.status', { defaultValue: 'Status' }),
      render: (item) => (
        <Badge
          variant="outline"
          className={
            item.status.toLowerCase() === 'active'
              ? 'bg-green-500/10 text-green-600 border-green-500/20'
              : 'bg-muted text-muted-foreground border-border'
          }
        >
          <div
            className={
              item.status.toLowerCase() === 'active'
                ? 'w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5'
                : 'w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5'
            }
          />
          {formatLabel(item.status)}
        </Badge>
      ),
    },
  ];

  const applyFilters = filterForm.handleSubmit((values) => {
    setAppliedFilters({
      status: values.status === 'all' ? undefined : values.status,
      type: values.type === 'all' ? undefined : values.type,
      assignment: values.assignment === 'all' ? undefined : values.assignment,
    });
    setCurrentPage(1);
  });

  const resetFilters = () => {
    filterForm.reset({
      status: 'all',
      type: 'all',
      assignment: 'all',
    });
    setAppliedFilters({});
    setCurrentPage(1);
  };

  const renderRowActions = (item: BenefitEntitlement) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleView(item)}>
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>{t('actions.view', { defaultValue: 'View' })}</span>
        </DropdownMenuItem>
        {canManageEntitlements ? (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEdit(item)}>
              <PencilLine className="h-4 w-4 text-muted-foreground" />
              <span>{t('actions.edit', { defaultValue: 'Edit' })}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              disabled={updateStatusMutation.isPending}
              onClick={() => handleUpdateStatus(item)}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span>
                {item.status.toLowerCase() === 'active'
                  ? t('actions.markInactive', { defaultValue: 'Mark as inactive' })
                  : t('actions.markActive', { defaultValue: 'Mark as active' })}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('actions.delete', { defaultValue: 'Delete' })}</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      <AddEntitlementSheet
        open={isAddSheetOpen}
        onOpenChange={(open) => {
          setIsAddSheetOpen(open);
          if (!open) setSelectedEntitlement(null);
        }}
        entitlement={selectedEntitlement}
      />

      <EntitlementDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) setSelectedEntitlement(null);
        }}
        entitlement={selectedEntitlement}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={t('delete.title', { defaultValue: 'Delete entitlement' })}
        message={t('delete.message', { defaultValue: 'Are you sure you want to delete this entitlement? This action cannot be undone.' })}
        confirmLabel={t('delete.confirm', { defaultValue: 'Delete' })}
        cancelLabel={t('cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
          {t('title', { defaultValue: 'Entitlements' })}
        </h1>
        <div className="flex items-center gap-4">
          <FormSelect
            id="company-selector"
            placeholder={
              isLoadingCompanies
                ? t('setup.loadingCompanies', { defaultValue: 'Loading...' })
                : 'Filter by Company'
            }
            control={form.control}
            name="ouId"
            options={
              companiesData?.map((company) => ({ label: company.name, value: company.id })) || []
            }
            t={t}
            containerClassName="w-[200px]"
            onChange={() => setCurrentPage(1)}
          />
          {canManageEntitlements ? (
            <Button
              onClick={() => {
                setSelectedEntitlement(null);
                setIsAddSheetOpen(true);
              }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 h-9 rounded-lg transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>{t('addEntitlement', { defaultValue: 'Add entitlement' })}</span>
            </Button>
          ) : null}
        </div>
      </div>

      <SummaryStatList
        stats={dynamicStats.map((stat) => ({
          title: t(`stats.${stat.id}`, { defaultValue: stat.title }),
          value: stat.value,
          icon: stat.icon,
          iconBgColor: stat.bgColor,
          iconColor: stat.color,
          borderColor: stat.borderColor,
        }))}
      />

      <div className="w-full">
        <UniversalDataTable
          data={data?.data || []}
          columns={columns}
          enableSelection
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder={t('searchPlaceholder', { defaultValue: 'Search entitlements...' })}
          currentPage={currentPage}
          totalPages={data?.pagination?.totalPages || 1}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          renderRowActions={renderRowActions}
          totalItems={data?.pagination?.total || 0}
          isLoading={isLoading}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          renderCustomFilter={(
            <Button
              variant="outline"
              size="default"
              className="h-10 gap-2 border-input"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <ListFilter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          )}
          renderFilterPanel={
            showFilters ? (
              <form onSubmit={applyFilters} className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg p-4 sm:p-6 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormSelect
                    id="entitlement-filter-status"
                    label={t('table.status', { defaultValue: 'Status' })}
                    control={filterForm.control}
                    name="status"
                    options={[
                      { label: 'All', value: 'all' },
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
                    ]}
                    t={t}
                  />
                  <FormSelect
                    id="entitlement-filter-type"
                    label={t('table.type', { defaultValue: 'Type' })}
                    control={filterForm.control}
                    name="type"
                    options={[
                      { label: 'All', value: 'all' },
                      { label: 'Bonus', value: 'BONUS' },
                      { label: 'Allowance', value: 'ALLOWANCE' },
                      { label: 'Stipend', value: 'STIPEND' },
                      { label: 'Equity', value: 'EQUITY' },
                    ]}
                    t={t}
                  />
                  <FormSelect
                    id="entitlement-filter-assignment"
                    label={t('table.assignedTo', { defaultValue: 'Assigned to' })}
                    control={filterForm.control}
                    name="assignment"
                    options={[
                      { label: 'All', value: 'all' },
                      { label: 'All Employees', value: 'ALL_EMPLOYEES' },
                      { label: 'Individual', value: 'INDIVIDUAL' },
                      { label: 'Department Based', value: 'DEPARTMENT_BASED' },
                      { label: 'Role Based', value: 'ROLE_BASED' },
                    ]}
                    t={t}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={resetFilters}>Reset</Button>
                  <Button type="submit">Apply filters</Button>
                </div>
              </form>
            ) : undefined
          }
        />
      </div>
    </div>
  );
};

export default EntitlementsPage;

function mapEntitlementSortBy(column: string):
  | 'createdAt'
  | 'name'
  | 'type'
  | 'assignment'
  | 'frequency'
  | 'status'
  | 'amount'
  | null {
  if (column === 'name') return 'name';
  if (column === 'type') return 'type';
  if (column === 'assignment') return 'assignment';
  if (column === 'frequency') return 'frequency';
  if (column === 'status') return 'status';
  if (column === 'amount') return 'amount';
  if (column === 'createdAt') return 'createdAt';
  return null;
}
