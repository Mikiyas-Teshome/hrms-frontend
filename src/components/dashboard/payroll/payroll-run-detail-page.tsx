"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import ConfirmationModal from "@/components/dashboard/shared/ConfirmationModal";
import { PayrollRunDetailSkeleton } from "@/components/payroll/payroll-run-detail-skeleton";
import {
  usePayrollRun,
  usePayrollConfig,
  usePayslipsPaginated,
  useGeneratePayrollRunPayslips,
  useRegeneratePayslip,
  useFinalizePayrollRun,
  useMarkPayrollRunPaid,
} from "@/features/payroll/hooks/usePayroll";
import {
  PayslipFilterInput,
  PayslipListSortOrder,
  PayslipSortBy,
} from "@/features/payroll/payroll.types";
import { useProfile } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useEmployees } from "@/features/employee/hooks/useEmployee";
import { useDisplayCurrency } from "@/features/settings/hooks/useDisplayCurrency";
import { formatIntlCurrency } from "@/lib/currency";
import { resolvePayrollDisplayCurrency } from "@/features/payroll/payslip.utils";
import { useToast } from "@/hooks/use-toast";
import {
  formatPayPeriodRange,
  formatPayrollCycleLabel,
  formatPayrollRunStatusLabel,
  formatPayrollRunTitle,
  getPayrollRunStatusBadgeClass,
  getPayrollRunStatusTranslationKey,
  normalizePayrollRunStatus,
  resolvePayrollPayDate,
} from "@/features/payroll/payroll-run.utils";
import {
  buildEmployeeNameMap,
  enrichPayslipsWithEmployeeNames,
  PayslipTableRow,
} from "@/features/payroll/payslip.utils";

type RunStatusActionType = "finalize" | "markPaid";

function mapPayslipSortColumn(columnKey: string): PayslipSortBy {
  switch (columnKey) {
    case "employeeName":
      return PayslipSortBy.EMPLOYEE_NAME;
    case "grossPay":
      return PayslipSortBy.GROSS_PAY;
    case "netPay":
      return PayslipSortBy.NET_PAY;
    default:
      return PayslipSortBy.CREATED_AT;
  }
}

export function PayrollRunDetailPage({ runId }: { runId: string }) {
  const { t } = useTranslation(["payroll", "dashboard"]);
  const router = useRouter();
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { hasPermission } = usePermissions();
  const canApprovePayrollRuns = hasPermission("payroll_runs:approve");
  const canProcessPayrollRuns = hasPermission("payroll_runs:process");
  const companyId = profile?.companyId;
  const { currencyCode } = useDisplayCurrency();
  const { data: run, isLoading: runLoading } = usePayrollRun(runId);
  const { data: payrollConfig } = usePayrollConfig(companyId);
  const generateRunPayslips = useGeneratePayrollRunPayslips();
  const regeneratePayslip = useRegeneratePayslip();
  const finalizeRun = useFinalizePayrollRun();
  const markRunPaid = useMarkPayrollRunPaid();
  const [statusAction, setStatusAction] = useState<RunStatusActionType | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<PayslipFilterInput>({});
  const [sortColumn, setSortColumn] = useState("employeeName");
  const [sortDirection, setSortDirection] = useState<PayslipListSortOrder>(
    PayslipListSortOrder.DESC,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const listFilter = useMemo(
    () => ({
      ...activeFilter,
      sortBy: mapPayslipSortColumn(sortColumn),
      sortOrder: sortDirection,
      payrollRunId: runId,
    }),
    [activeFilter, sortColumn, sortDirection, runId],
  );

  const { data: payslipsResponse, isLoading: payslipsLoading, isFetching } =
    usePayslipsPaginated(companyId, listFilter, { page: currentPage, size: pageSize }, !!companyId);

  const metaData = payslipsResponse?.metaData;
  const { data: employees = [] } = useEmployees();

  const employeeNameById = useMemo(() => buildEmployeeNameMap(employees), [employees]);
  const tableRows = useMemo(
    () => enrichPayslipsWithEmployeeNames(payslipsResponse?.data ?? [], employeeNameById),
    [payslipsResponse?.data, employeeNameById],
  );

  const displayCurrency = resolvePayrollDisplayCurrency({
    companyCurrency: currencyCode,
    payslips: payslipsResponse?.data ?? [],
    summaryCurrency: payslipsResponse?.summary?.currency,
  });

  const runStatusKey = run ? normalizePayrollRunStatus(run.status) : null;
  const canGeneratePayslips = runStatusKey === "draft";

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

  const formatCurrency = (value: number) =>
    formatIntlCurrency(value, displayCurrency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const handleGenerateAll = () => {
    if (!companyId) return;

    generateRunPayslips.mutate(
      { companyId, payrollRunId: runId },
      {
        onSuccess: (result) => {
          toast({
            title: t("common.success", "Success"),
            description: t(
              "payrollData.success.payslipsGenerated",
              "Generated {{count}} payslip(s). {{skipped}} already existed.",
              { count: result.generatedCount, skipped: result.skippedCount },
            ),
          });
        },
        onError: (error) => {
          toast({
            title: t("common.error", "Error"),
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const statusActionPending = finalizeRun.isPending || markRunPaid.isPending;

  const confirmStatusAction = () => {
    if (!statusAction) return;

    const onSuccess = () => {
      setStatusAction(null);
      toast({
        title: t("common.success", "Success"),
        description:
          statusAction === "finalize"
            ? t("payrollData.success.runFinalized", "Payroll run finalized successfully")
            : t("payrollData.success.runMarkedPaid", "Payroll run marked as paid"),
      });
    };

    const onError = (error: Error) => {
      toast({
        title: t("common.error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    };

    if (statusAction === "finalize") {
      finalizeRun.mutate(runId, { onSuccess, onError });
      return;
    }

    markRunPaid.mutate(runId, { onSuccess, onError });
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
            title: t("common.success", "Success"),
            description: t("payrollData.success.payslipRegenerated", "Payslip regenerated successfully"),
          });
        },
        onError: (error) => {
          toast({
            title: t("common.error", "Error"),
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const columns: ColumnConfig<PayslipTableRow>[] = [
    {
      key: "employeeName",
      label: t("payrollData.columns.employee", "Employee"),
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
            <span className="font-medium text-foreground">{item.employeeName}</span>
          </div>
        );
      },
    },
    {
      key: "grossPay",
      label: t("payrollData.columns.grossPay", "Gross pay"),
      render: (item) => formatCurrency(item.grossPay),
    },
    {
      key: "netPay",
      label: t("payrollData.columns.netPay", "Net pay"),
      render: (item) => (
        <span className="font-semibold">{formatCurrency(item.netPay)}</span>
      ),
    },
    {
      key: "createdAt",
      label: t("payrollData.columns.createdDate", "Created date"),
      render: (item) => format(new Date(item.createdAt), "MMM d, yyyy"),
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
        ...(canGeneratePayslips
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
      ]}
    />
  );

  if (runLoading) {
    return <PayrollRunDetailSkeleton />;
  }

  if (!run) {
    return (
        <div className="flex flex-col gap-4 p-8">
          <p className="text-muted-foreground">
            {t("payrollData.errors.runNotFound", "Payroll run not found")}
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard/payroll/runs")}>
            {t("common.back", "Back")}
          </Button>
        </div>
    );
  }

  const statusKey = runStatusKey ?? "draft";
  const payDate = resolvePayrollPayDate(run.endDate, payrollConfig?.payDay ?? 1);
  const runTitle = formatPayrollRunTitle(run.startDate, run.endDate);

  return (
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <ConfirmationModal
          open={!!statusAction}
          onOpenChange={(open) => {
            if (!statusActionPending && !open) {
              setStatusAction(null);
            }
          }}
          title={
            statusAction === "markPaid"
              ? t("payrollData.dialogs.markPaidRunTitle", "Mark payroll run as paid")
              : t("payrollData.dialogs.finalizeRunTitle", "Finalize payroll run")
          }
          message={
            statusAction === "markPaid"
              ? t(
                  "payrollData.dialogs.markPaidRunMessage",
                  'Mark "{{title}}" as paid? This indicates payroll has been processed and completes the run.',
                  { title: runTitle },
                )
              : t(
                  "payrollData.dialogs.finalizeRunMessage",
                  'Finalize "{{title}}"? Payslips will be locked for review and the run can no longer be deleted.',
                  { title: runTitle },
                )
          }
          confirmLabel={
            statusAction === "markPaid"
              ? t("payrollData.actions.markPaid", "Mark as paid")
              : t("payrollData.actions.finalize", "Finalize")
          }
          variant="primary"
          onConfirm={confirmStatusAction}
          isLoading={statusActionPending}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/payroll/runs")}
              aria-label={t("common.back", "Back")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px] font-bold text-foreground">
                {formatPayrollRunTitle(run.startDate, run.endDate)}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatPayPeriodRange(run.startDate, run.endDate)} ·{" "}
                {formatPayrollCycleLabel(payrollConfig?.cycleType)} ·{" "}
                {t("payrollData.columns.payDate", "Pay date")}: {format(payDate, "MMM d, yyyy")}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`border rounded-[6px] px-2.5 py-1 text-[12px] font-medium gap-1.5 ${getPayrollRunStatusBadgeClass(run.status)}`}
            >
              {statusKey === "paid" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <CircleDashed className="w-3.5 h-3.5" />
              )}
              {t(
                getPayrollRunStatusTranslationKey(run.status),
                formatPayrollRunStatusLabel(run.status),
              )}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/payroll/payslips?runId=${runId}`)}
            >
              {t("payrollData.actions.showPayroll", "View all payslips")}
            </Button>
            {statusKey === "draft" && canApprovePayrollRuns ? (
              <Button
                variant="outline"
                className="gap-2"
                disabled={statusActionPending}
                onClick={() => setStatusAction("finalize")}
              >
                <ClipboardCheck className="w-4 h-4" />
                {t("payrollData.actions.finalize", "Finalize")}
              </Button>
            ) : null}
            {statusKey === "finalized" && canProcessPayrollRuns ? (
              <Button
                className="gap-2"
                disabled={statusActionPending}
                onClick={() => setStatusAction("markPaid")}
              >
                <Banknote className="w-4 h-4" />
                {t("payrollData.actions.markPaid", "Mark as paid")}
              </Button>
            ) : null}
            {canGeneratePayslips ? (
              <Button
                className="gap-2"
                disabled={!companyId || generateRunPayslips.isPending}
                onClick={handleGenerateAll}
              >
                <Sparkles className="w-4 h-4" />
                {generateRunPayslips.isPending
                  ? t("payrollData.generatingPayslips", "Generating...")
                  : t("payrollData.generateAllPayslips", "Generate all payslips")}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              {t("payrollData.columns.noOfEmployees", "No. of employees")}
            </p>
            <p className="text-2xl font-bold mt-1">{run.employeeCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              {t("payrollData.columns.grossPay", "Gross pay")}
            </p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(run.grossPay)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              {t("payrollData.columns.netPay", "Net pay")}
            </p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(run.netPay)}</p>
          </div>
        </div>

        <UniversalDataTable
          data={tableRows}
          columns={columns}
          isLoading={payslipsLoading || isFetching}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder={t("payrollData.searchPayslips", "Search payslips")}
          showFilter={false}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          currentPage={currentPage}
          totalPages={metaData?.totalPages ?? 1}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalItems={metaData?.total ?? 0}
          renderRowActions={renderRowActions}
        />
      </div>
  );
}
