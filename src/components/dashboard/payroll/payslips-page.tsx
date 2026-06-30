"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Download,
  Eye,
  FileStack,
  FileText,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormSelect } from "@/components/ui/FormSelect";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import { PayslipTableRow } from "@/features/payroll/payslip.utils";
import { usePayslipsPage } from "@/features/payroll/hooks/usePayslipsPage";

export function PayslipsPage() {
  const router = useRouter();
  const {
    t,
    statsYear,
    employees,
    canReadPayrollRuns,
    canCreatePayslips,
    hydrated,
    runs,
    currentRunId,
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
  } = usePayslipsPage();

  const columns: ColumnConfig<PayslipTableRow>[] = [
    {
      key: "employeeName",
      label: t("payrollData.columns.employee", "Employee"),
      sortable: true,
      render: (item) => {
        const employee = employees.find((e) => e.id === item.employeeId);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-full border">
              <AvatarImage src="" alt={item.employeeName} />
              <AvatarFallback>
                {employee?.firstName?.charAt(0)}
                {employee?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">{item.employeeName}</span>
          </div>
        );
      },
    },
    {
      key: "id",
      label: t("payrollData.columns.payslipNumber", "Payslip number"),
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-xs text-muted-foreground uppercase">
          {item.id.split("-")[0]}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("payrollData.columns.payDate", "Pay date"),
      sortable: true,
      render: (item) => (
        <span className="text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
      ),
    },
    {
      key: "grossPay",
      label: t("payrollData.columns.grossPay", "Gross pay"),
      sortable: true,
      render: (item) => (
        <span className="text-muted-foreground">{formatCurrency(item.grossPay)}</span>
      ),
    },
    {
      key: "netPay",
      label: t("payrollData.columns.netPay", "Net pay"),
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-foreground">
          {formatCurrency(item.netPay)}
        </span>
      ),
    },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      render: () => (
        <Badge
          variant="outline"
          className="border rounded-[6px] px-2.5 py-1 text-[12px] font-medium gap-1.5 bg-primary/10 text-primary border-primary/25"
        >
          <RefreshCw className="w-3 h-3 text-primary" />
          {t("payrollData.status.generated", "Generated")}
        </Badge>
      ),
    },
  ];

  const renderRowActions = (item: PayslipTableRow) => (
    <TableActionMenu
      actions={[
        {
          label: t("payrollData.actions.view", "View"),
          icon: Eye,
          onClick: (e) => {
            e.stopPropagation();
            router.push(`/dashboard/payroll/payslips/${item.id}`);
          },
        },
        ...(canCreatePayslips
          ? [
              {
                label: t("payrollData.actions.generate", "Regenerate"),
                icon: RefreshCw,
                onClick: (e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  handleRegenerate(item);
                },
              },
            ]
          : []),
        {
          label: t("payrollData.actions.downloadPdf", "Download PDF"),
          icon: Download,
          onClick: (e) => {
            e.stopPropagation();
            handleRowDownload(item);
          },
        },
      ]}
    />
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[24px] font-bold text-foreground">
          {t("payrollData.payslipsTitle", "Payslips")}
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          {hydrated && canReadPayrollRuns && runs.length > 0 ? (
            <FormSelect
              id="payslip-payroll-run"
              label={t("payrollData.selectPayrollRun", "Payroll run")}
              value={currentRunId}
              onChange={handleRunChange}
              options={payrollRunOptions}
              className="w-full sm:w-60"
              containerClassName="w-full sm:w-60"
            />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SummaryStatCardSkeleton />
            <SummaryStatCardSkeleton />
            <SummaryStatCardSkeleton />
            <SummaryStatCardSkeleton />
          </>
        ) : (
          <>
            <SummaryStatCard
              title={t("payrollData.stats.totalPayslip", "Total payslip {{year}}", { year: statsYear })}
              value={payslipCount.toString()}
              icon={FileText}
              iconColor="#2865E3"
              iconBgColor="transparent"
              borderColor="#2865E380"
            />
            <SummaryStatCard
              title={t("payrollData.stats.totalGrossPay", "Total gross pay {{year}}", { year: statsYear })}
              value={formatCurrency(totalGrossPay)}
              icon={Wallet}
              iconColor="#22C55E"
              iconBgColor="transparent"
              borderColor="#22C55E80"
            />
            <SummaryStatCard
              title={t("payrollData.stats.totalPay", "Total net pay {{year}}", { year: statsYear })}
              value={formatCurrency(totalNetPay)}
              icon={Wallet}
              iconColor="#2865E3"
              iconBgColor="transparent"
              borderColor="#2865E380"
            />
            <SummaryStatCard
              title={t("payrollData.stats.generated", "Generated")}
              value={payslipCount.toString()}
              icon={FileStack}
              iconColor="#2865E3"
              iconBgColor="transparent"
              borderColor="#2865E380"
            />
          </>
        )}
      </div>

      <UniversalDataTable
        data={tableRows}
        columns={columns}
        isLoading={isLoading || isFetching}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t("payrollData.searchPayslips", "Search payslips")}
        showFilter={false}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        currentPage={currentPage}
        totalPages={Math.max(1, metaData?.totalPages ?? 1)}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        totalItems={metaData?.total ?? 0}
        renderRowActions={renderRowActions}
        renderHeaderActions={
          hydrated ? (
            <Button
              variant="outline"
              className="h-10 px-4 gap-2 text-primary border-primary/25 hover:bg-primary/10 hover:text-primary disabled:opacity-50"
              disabled={!isBatchDownloadEnabled}
              onClick={handleBatchDownload}
            >
              <Download className="w-4 h-4 rtl:ml-2" />
              {t("payrollData.batchDownloadPdf", "Download PDFs")}
            </Button>
          ) : null
        }
      />
    </div>
  );
}
