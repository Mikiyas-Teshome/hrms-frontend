'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  useAllPayrollRuns,
  usePayslipsPaginated,
  useRegeneratePayslip,
} from '@/features/payroll/hooks/usePayroll';
import { PayslipFilterInput, PayslipListSortOrder } from '@/features/payroll/payroll.types';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { useToast } from '@/hooks/use-toast';
import { useClientHydrated } from '@/hooks/use-client-hydrated';
import { useSettingsCompany } from '@/features/settings/hooks/useSettingsCompany';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { formatIntlCurrency } from '@/lib/currency';
import { formatPayrollRunTitle } from '@/features/payroll/payroll-run.utils';
import { fetchPayslip } from '@/features/payroll/payroll.actions';
import {
  buildEmployeeNameMap,
  downloadPayslipPdf,
  enrichPayslipsWithEmployeeNames,
  PayslipTableRow,
  resolvePayrollDisplayCurrency,
} from '@/features/payroll/payslip.utils';
import { mapPayslipSortColumn } from '@/features/payroll/payroll-runs-page.utils';

export function usePayslipsPage() {
  const { t } = useTranslation(['payroll', 'dashboard']);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const companyId = profile?.companyId;
  const statsYear = new Date().getFullYear();
  const { company } = useSettingsCompany();
  const { currencyCode } = useDisplayCurrency();
  const { hasPermission } = usePermissions();

  const canReadPayrollRuns = hasPermission('payroll_runs:read');
  const canReadPayslips = hasPermission('payslips:read');
  const canCreatePayslips = hasPermission('payslips:create');
  const hydrated = useClientHydrated();

  const { data: runsResponse } = useAllPayrollRuns(
    canReadPayrollRuns ? companyId : undefined,
  );
  const runs = useMemo(() => runsResponse?.data ?? [], [runsResponse?.data]);
  const { data: employees = [] } = useEmployees();
  const runIdFromQuery = searchParams.get('runId') ?? '';
  const [userSelectedRunId, setUserSelectedRunId] = useState<string>('');

  const currentRunId = runIdFromQuery || userSelectedRunId || runs[0]?.id || '';
  const currentRun = runs.find((run) => run.id === currentRunId);

  const regeneratePayslip = useRegeneratePayslip();

  const payrollRunOptions = useMemo(
    () =>
      runs.map((run) => ({
        value: run.id,
        label: formatPayrollRunTitle(run.startDate, run.endDate),
      })),
    [runs],
  );

  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<PayslipFilterInput>({});
  const [sortColumn, setSortColumn] = useState('employeeName');
  const [sortDirection, setSortDirection] = useState<PayslipListSortOrder>(
    PayslipListSortOrder.DESC,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    const debounce = setTimeout(() => {
      setActiveFilter({
        search: searchValue.trim() || undefined,
        sortBy: mapPayslipSortColumn(sortColumn),
        sortOrder: sortDirection,
      });
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchValue, sortColumn, sortDirection]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setCurrentPage(1);
      setSelectedIds(new Set());
    });
    return () => cancelAnimationFrame(frame);
  }, [currentRunId]);

  const listFilter = useMemo(
    () => ({
      ...activeFilter,
      sortBy: mapPayslipSortColumn(sortColumn),
      sortOrder: sortDirection,
      ...(canReadPayrollRuns && currentRunId ? { payrollRunId: currentRunId } : {}),
    }),
    [activeFilter, sortColumn, sortDirection, canReadPayrollRuns, currentRunId],
  );

  const { data: payslipsResponse, isLoading, isFetching } = usePayslipsPaginated(
    companyId,
    listFilter,
    { page: currentPage, size: pageSize },
    canReadPayslips && (!canReadPayrollRuns || !!currentRunId),
  );

  const metaData = payslipsResponse?.metaData;
  const employeeNameById = useMemo(() => buildEmployeeNameMap(employees), [employees]);

  const tableRows = useMemo(
    (): PayslipTableRow[] =>
      enrichPayslipsWithEmployeeNames(payslipsResponse?.data ?? [], employeeNameById),
    [payslipsResponse?.data, employeeNameById],
  );

  const displayCurrency = resolvePayrollDisplayCurrency({
    companyCurrency: currencyCode,
    payslips: payslipsResponse?.data ?? [],
    summaryCurrency: payslipsResponse?.summary?.currency,
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) =>
        prev === PayslipListSortOrder.ASC
          ? PayslipListSortOrder.DESC
          : PayslipListSortOrder.ASC,
      );
    } else {
      setSortColumn(columnKey);
      setSortDirection(PayslipListSortOrder.ASC);
    }
    setCurrentPage(1);
  };

  const formatCurrency = (value: number) => {
    if (!displayCurrency) {
      return value.toLocaleString();
    }

    return formatIntlCurrency(value, displayCurrency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleRegenerate = (row: PayslipTableRow) => {
    if (!companyId) return;

    regeneratePayslip.mutate(
      {
        companyId,
        employeeId: row.employeeId,
        payrollRunId: row.payrollRunId,
      },
      {
        onSuccess: () => {
          toast({
            title: t('common.success', 'Success'),
            description: t('payrollData.success.payslipRegenerated', 'Payslip regenerated successfully'),
          });
        },
        onError: (error) => {
          toast({
            title: t('common.error', 'Error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      },
    );
  };

  const periodLabel = currentRun
    ? formatPayrollRunTitle(currentRun.startDate, currentRun.endDate)
    : t('payrollData.payslipsTitle', 'Payslips');

  const downloadRowsAsPdf = async (rows: PayslipTableRow[]) => {
    if (rows.length === 0) {
      toast({
        title: t('common.error', 'Error'),
        description: t('payrollData.errors.noPayslipsToDownload', 'No payslips to download'),
        variant: 'destructive',
      });
      return;
    }

    for (const row of rows) {
      const detail = await fetchPayslip(row.id);
      if (!detail) {
        continue;
      }
      const emp = employees.find((e) => e.id === detail.employeeId);
      downloadPayslipPdf(
        detail,
        row.employeeName,
        periodLabel,
        (value) => formatCurrency(value),
        {
          employeeNumber: emp?.employeeNumber,
          jobTitle: emp?.jobTitle,
          departmentName: emp?.orgUnit?.orgUnitName,
          hireDate: emp?.hireDate ? format(new Date(emp.hireDate), 'dd MMM yyyy') : undefined,
          companyName: company?.name,
          companyLogo: company?.logo || undefined,
        },
      );
    }
  };

  const handleBatchDownload = async () => {
    if (!companyId || selectedIds.size === 0) return;

    const rows = tableRows.filter((row) => selectedIds.has(row.id));
    if (!rows.length) return;

    void downloadRowsAsPdf(rows);
  };

  const handleRowDownload = (row: PayslipTableRow) => {
    void downloadRowsAsPdf([row]);
  };

  const payslipCount = metaData?.total ?? 0;
  const totalGrossPay = payslipsResponse?.summary?.totalGrossPay ?? 0;
  const totalNetPay = payslipsResponse?.summary?.totalNetPay ?? 0;
  const isBatchDownloadEnabled = selectedIds.size > 0;

  const handleRunChange = (value: string) => {
    setUserSelectedRunId(value);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    t,
    statsYear,
    employees,
    canReadPayrollRuns,
    canCreatePayslips,
    hydrated,
    runs,
    currentRunId,
    currentRun,
    payrollRunOptions,
    handleRunChange,
    searchValue,
    setSearchValue,
    sortColumn,
    sortDirection,
    currentPage,
    setCurrentPage,
    pageSize,
    handlePageSizeChange,
    selectedIds,
    setSelectedIds,
    tableRows,
    isLoading,
    isFetching,
    metaData,
    formatCurrency,
    handleSort,
    handleRegenerate,
    handleBatchDownload,
    handleRowDownload,
    payslipCount,
    totalGrossPay,
    totalNetPay,
    isBatchDownloadEnabled,
    isRegeneratePending: regeneratePayslip.isPending,
  };
}
