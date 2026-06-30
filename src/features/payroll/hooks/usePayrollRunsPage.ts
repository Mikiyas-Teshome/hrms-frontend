'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  usePayrollRunsPaginated,
  useAllPayrollRuns,
  useCreatePayrollRun,
  useDeletePayrollRun,
  useFinalizePayrollRun,
  useMarkPayrollRunPaid,
  usePayrollConfig,
} from '@/features/payroll/hooks/usePayroll';
import {
  PayrollRunFilterInput,
  PayrollRunListSortOrder,
  PayrollRunResponse,
} from '@/features/payroll/payroll.types';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { formatIntlCurrency } from '@/lib/currency';
import {
  findPayrollRunForPeriod,
} from '@/features/payroll/payroll-run.utils';
import {
  countActivePayrollRunFilters,
  defaultPayrollRunFilterDraft,
  mapPayrollRunDraftToFilter,
  mapPayrollRunFilterToDraft,
  mapPayrollRunSortColumn,
  PAYROLL_RUN_ALL_FILTER_VALUE,
  PayrollRunFilterDraft,
} from '@/features/payroll/payroll-runs-page.utils';

export type PayrollRunDateRange = {
  from: Date | null;
  to: Date | null;
};

export type PayrollRunStatusAction = {
  type: 'finalize' | 'markPaid';
  run: PayrollRunResponse;
};

export function usePayrollRunsPage() {
  const { t } = useTranslation(['payroll', 'dashboard']);
  const { data: profile } = useProfile();
  const { currencyCode } = useDisplayCurrency();
  const companyId = profile?.companyId;
  const statsYear = new Date().getFullYear();

  const { data: allRunsResponse } = useAllPayrollRuns(companyId);
  const allPayrollRuns = useMemo(
    () => allRunsResponse?.data ?? [],
    [allRunsResponse?.data],
  );
  const { data: payrollConfig } = usePayrollConfig(companyId);
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canApprovePayrollRuns = hasPermission('payroll_runs:approve');
  const canProcessPayrollRuns = hasPermission('payroll_runs:process');
  const createRun = useCreatePayrollRun();
  const deleteRun = useDeletePayrollRun();
  const finalizeRun = useFinalizePayrollRun();
  const markRunPaid = useMarkPayrollRunPaid();

  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<PayrollRunFilterInput>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterForm = useForm<PayrollRunFilterDraft>({ defaultValues: defaultPayrollRunFilterDraft });
  const [sortColumn, setSortColumn] = useState('title');
  const [sortDirection, setSortDirection] = useState<PayrollRunListSortOrder>(
    PayrollRunListSortOrder.DESC,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRunRange, setNewRunRange] = useState<PayrollRunDateRange>({ from: null, to: null });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [runToDelete, setRunToDelete] = useState<PayrollRunResponse | null>(null);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [runToReplace, setRunToReplace] = useState<PayrollRunResponse | null>(null);
  const [statusAction, setStatusAction] = useState<PayrollRunStatusAction | null>(null);

  const formatCurrency = (value: number) =>
    formatIntlCurrency(value, currencyCode, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  useEffect(() => {
    const debounce = setTimeout(() => {
      setActiveFilter((prev) => ({
        ...prev,
        search: searchValue.trim() || undefined,
        sortBy: mapPayrollRunSortColumn(sortColumn),
        sortOrder: sortDirection,
      }));
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchValue, sortColumn, sortDirection, statsYear]);

  const listFilter = useMemo(
    () => ({
      ...activeFilter,
      sortBy: mapPayrollRunSortColumn(sortColumn),
      sortOrder: sortDirection,
    }),
    [activeFilter, sortColumn, sortDirection],
  );

  const { data: runsResponse, isLoading, isFetching } = usePayrollRunsPaginated(
    companyId,
    listFilter,
    { page: currentPage, size: pageSize },
  );

  const tableRuns = runsResponse?.data ?? [];
  const metaData = runsResponse?.metaData;
  const summary = runsResponse?.summary;

  const stats = useMemo(
    () => ({
      total: summary?.totalRuns ?? 0,
      completed: summary?.completedRuns ?? 0,
      pending: summary?.pendingRuns ?? 0,
      totalGrossPay: summary?.totalGrossPay ?? 0,
    }),
    [summary],
  );

  const activeFilterCount = countActivePayrollRunFilters(activeFilter);

  const handleApplyFilters = () => {
    const draft = filterForm.getValues();
    setActiveFilter(
      mapPayrollRunDraftToFilter(
        draft,
        searchValue.trim() || undefined,
        mapPayrollRunSortColumn(sortColumn),
        sortDirection,
      ),
    );
    setCurrentPage(1);
    setFiltersOpen(false);
  };

  const handleResetFilters = () => {
    filterForm.reset(defaultPayrollRunFilterDraft);
    setActiveFilter({
      search: searchValue.trim() || undefined,
      sortBy: mapPayrollRunSortColumn(sortColumn),
      sortOrder: sortDirection,
    });
    setCurrentPage(1);
  };

  const handleOpenFilters = () => {
    filterForm.reset(mapPayrollRunFilterToDraft(activeFilter));
    setFiltersOpen((open) => !open);
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) =>
        prev === PayrollRunListSortOrder.ASC
          ? PayrollRunListSortOrder.DESC
          : PayrollRunListSortOrder.ASC,
      );
    } else {
      setSortColumn(columnKey);
      setSortDirection(PayrollRunListSortOrder.ASC);
    }
    setCurrentPage(1);
  };

  const yearFilterOptions = useMemo(() => {
    const years = new Set<number>([statsYear]);
    for (const run of allPayrollRuns) {
      years.add(new Date(run.startDate).getFullYear());
    }
    return Array.from(years)
      .sort((a, b) => b - a)
      .map((year) => ({ value: String(year), label: String(year) }));
  }, [allPayrollRuns, statsYear]);

  const handleOpenCreate = () => {
    setNewRunRange({ from: null, to: null });
    setIsCreateDialogOpen(true);
  };

  const submitCreateRun = (replaceExisting?: boolean) => {
    if (!companyId || !newRunRange.from || !newRunRange.to) {
      return;
    }
    createRun.mutate(
      {
        companyId,
        startDate: newRunRange.from.toISOString(),
        endDate: newRunRange.to.toISOString(),
        replaceExisting,
      },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          setReplaceConfirmOpen(false);
          setRunToReplace(null);
          setNewRunRange({ from: null, to: null });
          toast({
            title: t('common.success', 'Success'),
            description: replaceExisting
              ? t('payrollData.success.runRegenerated', 'Payroll run regenerated successfully')
              : t('payrollData.success.runCreated', 'Payroll run created successfully'),
          });
        },
        onError: (error) => {
          const message = error.message ?? '';
          if (message.includes('PAYROLL_RUN_EXISTS')) {
            const existing = findPayrollRunForPeriod(
              allPayrollRuns,
              newRunRange.from!,
              newRunRange.to!,
            );
            if (existing?.status.toLowerCase() === 'draft') {
              setRunToReplace(existing);
              setReplaceConfirmOpen(true);
              return;
            }
          }
          if (message.includes('PAYROLL_RUN_NOT_DRAFT')) {
            toast({
              title: t('common.error', 'Error'),
              description: t(
                'payrollData.errors.runExistsNotDraft',
                'A payroll run for this period already exists and cannot be replaced because it is no longer a draft.',
              ),
              variant: 'destructive',
            });
            return;
          }
          toast({
            title: t('common.error', 'Error'),
            description: message || t('payrollData.errors.createFailed', 'Failed to create payroll run'),
            variant: 'destructive',
          });
        },
      },
    );
  };

  const handleCreateRun = () => {
    if (!companyId) {
      toast({
        title: t('common.error', 'Error'),
        description: t('payrollData.errors.noCompany', 'Company ID not found.'),
        variant: 'destructive',
      });
      return;
    }
    if (!newRunRange.from || !newRunRange.to) {
      toast({
        title: t('common.error', 'Error'),
        description: t('payrollData.errors.selectDates', 'Please select a date range'),
        variant: 'destructive',
      });
      return;
    }
    const existing = findPayrollRunForPeriod(allPayrollRuns, newRunRange.from, newRunRange.to);
    if (existing) {
      if (existing.status.toLowerCase() !== 'draft') {
        toast({
          title: t('common.error', 'Error'),
          description: t(
            'payrollData.errors.runExistsNotDraft',
            'A payroll run for this period already exists and cannot be replaced because it is no longer a draft.',
          ),
          variant: 'destructive',
        });
        return;
      }
      setRunToReplace(existing);
      setReplaceConfirmOpen(true);
      return;
    }
    submitCreateRun();
  };

  const confirmReplaceRun = () => {
    submitCreateRun(true);
  };

  const handleDelete = (run: PayrollRunResponse) => {
    setRunToDelete(run);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!runToDelete) return;
    deleteRun.mutate(runToDelete.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setRunToDelete(null);
        toast({
          title: t('common.success', 'Success'),
          description: t('payrollData.success.runDeleted', 'Payroll run deleted successfully'),
        });
      },
      onError: (error) => {
        toast({
          title: t('common.error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const confirmStatusAction = () => {
    if (!statusAction) return;

    const onSuccess = () => {
      setStatusAction(null);
      toast({
        title: t('common.success', 'Success'),
        description:
          statusAction.type === 'finalize'
            ? t('payrollData.success.runFinalized', 'Payroll run finalized successfully')
            : t('payrollData.success.runMarkedPaid', 'Payroll run marked as paid'),
      });
    };

    const onError = (error: Error) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message,
        variant: 'destructive',
      });
    };

    if (statusAction.type === 'finalize') {
      finalizeRun.mutate(statusAction.run.id, { onSuccess, onError });
      return;
    }

    markRunPaid.mutate(statusAction.run.id, { onSuccess, onError });
  };

  const statusActionPending = finalizeRun.isPending || markRunPaid.isPending;

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    t,
    companyId,
    statsYear,
    payrollConfig,
    allPayrollRuns,
    canApprovePayrollRuns,
    canProcessPayrollRuns,
    isCreatePending: createRun.isPending,
    isDeletePending: deleteRun.isPending,
    statusActionPending,
    searchValue,
    setSearchValue,
    activeFilter,
    filtersOpen,
    setFiltersOpen,
    filterForm,
    sortColumn,
    sortDirection,
    currentPage,
    setCurrentPage,
    pageSize,
    handlePageSizeChange,
    selectedIds,
    setSelectedIds,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newRunRange,
    setNewRunRange,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    runToDelete,
    replaceConfirmOpen,
    setReplaceConfirmOpen,
    runToReplace,
    setRunToReplace,
    statusAction,
    setStatusAction,
    formatCurrency,
    tableRuns,
    isLoading,
    isFetching,
    metaData,
    stats,
    activeFilterCount,
    allFilterValue: PAYROLL_RUN_ALL_FILTER_VALUE,
    handleApplyFilters,
    handleResetFilters,
    handleOpenFilters,
    handleSort,
    yearFilterOptions,
    handleOpenCreate,
    handleCreateRun,
    confirmReplaceRun,
    handleDelete,
    confirmDelete,
    confirmStatusAction,
  };
}
