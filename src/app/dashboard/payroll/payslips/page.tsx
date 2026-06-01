"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Download, RefreshCw, FileText, Wallet, FileStack } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayrollRuns, usePayslipsByPayrollRun, useGeneratePayslip } from "@/features/payroll/hooks/usePayroll";
// import { mockPayrollRuns, mockPayslips } from "@/data/mock-payroll";
import { PayslipResponse } from "@/features/payroll/payroll.types";
import { format } from "date-fns";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useDisplayCurrency } from "@/features/settings/hooks/useDisplayCurrency";

export default function PayslipsPage() {
  const { t } = useTranslation("dashboard");
  const { data: runs = [] } = usePayrollRuns();
  // const runs = mockPayrollRuns as unknown as PayrollRunResponse[];
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const { mutate: generatePayslip } = useGeneratePayslip();

  const currentRunId = selectedRunId || (runs.length > 0 ? runs[0].id : "");

  const { data: payslips = [], isLoading } = usePayslipsByPayrollRun(currentRunId);
  
  // Mapping mock data to match UI expectations
  /*
  const payslips = (mockPayslips as any[]).map(ps => ({
    id: ps.id,
    employeeId: "emp-1",
    payrollRunId: selectedRunId || "run-1",
    basicSalary: 2000,
    totalAllowances: 500,
    totalDeductions: 100,
    grossPay: 2500,
    netPay: parseFloat(ps.totalPay.replace('$', '').replace(',', '')),
    createdAt: new Date(ps.payDate).toISOString(),
  })) as unknown as PayslipResponse[];

  const isLoading = false;
  */
  
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const { formatAmount } = useDisplayCurrency();

  const handleRegenerate = (item: PayslipResponse) => {
    generatePayslip({
      employeeId: item.employeeId,
      payrollRunId: item.payrollRunId,
    });
  };

  const columns: ColumnConfig<PayslipResponse>[] = [
    {
      key: "id",
      label: t("payrollData.columns.payslipNumber", "Payslip number"),
      sortable: true,
      render: (item) => <span className="font-semibold text-foreground text-xs uppercase">{item.id.split('-')[0]}</span>,
    },
    {
      key: "createdAt",
      label: t("payrollData.columns.payDate", "Created date"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>,
    },
    {
      key: "basicSalary",
      label: t("payrollData.columns.basicSalary", "Basic salary"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{formatAmount(item.basicSalary)}</span>,
    },
    {
      key: "totalPay",
      label: t("payrollData.columns.totalPay", "Net pay"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground font-semibold">{formatAmount(item.netPay)}</span>,
    },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: () => {
        // const isGenerated = true; // Backend doesn't have status for payslips yet, assuming generated
        const statusText = t("payrollData.status.generated", "Generated");
        return (
          <Badge
            variant="outline"
            className={`border rounded-[6px] px-2.5 py-1 text-[12px] font-medium gap-1.5 bg-primary/10 text-primary border-primary/25`}
          >
            <RefreshCw className="w-3 h-3 text-primary" />
            {statusText}
          </Badge>
        );
      },
    },
  ];

  const renderRowActions = (item: PayslipResponse) => (
    <TableActionMenu
      actions={[
        {
          label: t("payrollData.actions.generate", "Regenerate"),
          icon: RefreshCw,
          onClick: () => {
            handleRegenerate(item);
          },
        },
        {
          label: t("payrollData.actions.download", "Download"),
          icon: Download,
          onClick: () => {
            // Download logic usually involves a separate endpoint or Base64 content
          }
        },
      ]}
    />
  );

  const isBatchDownloadEnabled = selectedIds.size > 0;
  const totalNetPay = payslips.reduce((acc, curr) => acc + curr.netPay, 0);

  return (
    <ProtectedRoute module="payslips">
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-foreground">
          {t("payrollData.payslipsTitle", "Payslips")}
        </h1>
        {runs.length > 0 && (
          <Select value={currentRunId} onValueChange={setSelectedRunId}>
            <SelectTrigger className="w-60 h-10">
              <SelectValue placeholder="Select payroll run" />
            </SelectTrigger>
            <SelectContent>
              {runs.map(run => (
                <SelectItem key={run.id} value={run.id}>
                  {format(new Date(run.startDate), "MMM d")} - {format(new Date(run.endDate), "MMM d, yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SummaryStatCardSkeleton />
            <SummaryStatCardSkeleton />
            <SummaryStatCardSkeleton />
          </>
        ) : (
          <>
            <SummaryStatCard
              title={t("payrollData.stats.totalPayslip", "Total payslips")}
              value={payslips.length.toString()}
              icon={FileText}
              iconColor="#2865E3"
              iconBgColor="transparent"
              borderColor="#2865E380"
            />
            <SummaryStatCard
              title={t("payrollData.stats.totalPay", "Total net pay")}
              value={formatAmount(totalNetPay)}
              icon={Wallet}
              iconColor="#2865E3"
              iconBgColor="transparent"
              borderColor="#2865E380"
            />
            <SummaryStatCard
              title={t("payrollData.stats.generated", "Generated")}
              value={payslips.length.toString()}
              icon={FileStack}
              iconColor="#2865E3"
              iconBgColor="transparent"
              borderColor="#2865E380"
            />
          </>
        )}
      </div>

      <UniversalDataTable
        data={payslips}
        columns={columns}
        isLoading={isLoading}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t("payrollData.searchPlaceholder", "Search payslips")}
        showFilter={true}
        filterText={t("payrollData.filter1", "Filter")}
        currentPage={currentPage}
        totalPages={1}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        totalItems={payslips.length}
        renderRowActions={renderRowActions}
        renderHeaderActions={
          <Button
            variant="outline"
            className="h-10 px-4 gap-2 text-primary border-primary/25 hover:bg-primary/10 hover:text-primary disabled:opacity-50"
            disabled={!isBatchDownloadEnabled}
          >
            <Download className="w-4 h-4 rtl:ml-2" />
            {t("payrollData.batchDownload", "Batch download")}
          </Button>
        }
      />
      </div>
    </ProtectedRoute>
  );
}
