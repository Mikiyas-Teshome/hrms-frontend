"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Banknote,
  CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  DollarSign,
  Eye,
  Plus,
  Trash2,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu, TableAction } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import ConfirmationModal from "@/components/dashboard/shared/ConfirmationModal";
import { cn } from "@/lib/utils";
import { PayrollRunStatusFilter } from "@/features/payroll/payroll.types";
import { FormSelect } from "@/components/ui/FormSelect";
import { PayrollRunResponse } from "@/features/payroll/payroll.types";
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
  usePayrollRunsPage,
  PayrollRunDateRange,
} from "@/features/payroll/hooks/usePayrollRunsPage";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isInRange(date: Date, from: Date | null, to: Date | null) {
  if (!from || !to) return false;
  const t = date.getTime();
  return t > from.getTime() && t < to.getTime();
}

function MonthCalendar({
  year, month, range, hovered, onDayClick, onDayHover,
}: {
  year: number; month: number; range: PayrollRunDateRange;
  hovered: Date | null;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  const rangeEnd = range.to || hovered;

  return (
    <div className="select-none w-[220px] shrink-0">
      <div className="text-center text-sm font-semibold mb-3 text-foreground">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] text-muted-foreground font-medium w-8 h-8 flex items-center justify-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="w-8 h-8" />;
          const isStart = range.from && isSameDay(date, range.from);
          const isEnd = range.to && isSameDay(date, range.to);
          const isHovered = !range.to && hovered && isSameDay(date, hovered);
          const inRange = isInRange(date, range.from, rangeEnd);
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDayClick(date)}
              onMouseEnter={() => onDayHover(date)}
              type="button"
              className={cn(
                "w-8 h-8 text-[13px] flex items-center justify-center transition-colors",
                !isStart && !isEnd && !inRange && "hover:bg-muted rounded-full",
                inRange && "bg-primary/10 text-foreground rounded-none",
                (isStart || isEnd) && "bg-primary text-primary-foreground rounded-full z-10",
                isHovered && !range.from && "bg-muted rounded-full",
                isStart && range.to && "rounded-l-full",
                isEnd && "rounded-r-full",
              )}
            >
              <span className="relative z-10">{date.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InlineDateRangePicker({
  value,
  onChange,
}: {
  value: PayrollRunDateRange;
  onChange: (r: PayrollRunDateRange) => void;
}) {
  const [hovered, setHovered] = useState<Date | null>(null);
  const now = new Date();
  const [leftYear, setLeftYear] = useState(now.getFullYear());
  const [leftMonth, setLeftMonth] = useState(now.getMonth());
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

  const prevMonth = () => {
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear((y) => y - 1); }
    else setLeftMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear((y) => y + 1); }
    else setLeftMonth((m) => m + 1);
  };

  const handleDayClick = (date: Date) => {
    if (!value.from || (value.from && value.to)) {
      onChange({ from: date, to: null });
      setHovered(null);
    } else {
      const newRange = date < value.from
        ? { from: date, to: value.from }
        : { from: value.from, to: date };
      onChange(newRange);
    }
  };

  const label =
    value.from && value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : value.from
      ? `${formatDate(value.from)} – Select end date`
      : null;

  return (
    <div className="flex flex-col gap-3">
      <div className={cn(
        "flex items-center gap-2 h-9 rounded-lg border px-3 text-sm",
        label ? "border-primary/40 bg-primary/5 text-foreground" : "border-border text-muted-foreground"
      )}>
        <CalendarIcon className="w-4 h-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{label ?? "Select a date range"}</span>
      </div>

      <div className="flex items-center justify-between px-1">
        <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-muted rounded-md transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-muted rounded-md transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-6 justify-center flex-wrap">
        <MonthCalendar
          year={leftYear} month={leftMonth}
          range={value} hovered={hovered}
          onDayClick={handleDayClick} onDayHover={setHovered}
        />
        <MonthCalendar
          year={rightYear} month={rightMonth}
          range={value} hovered={hovered}
          onDayClick={handleDayClick} onDayHover={setHovered}
        />
      </div>
    </div>
  );
}

export function PayrollRunsPage() {
  const router = useRouter();
  const {
    t,
    statsYear,
    payrollConfig,
    canApprovePayrollRuns,
    canProcessPayrollRuns,
    isCreatePending,
    isDeletePending,
    statusActionPending,
    searchValue,
    setSearchValue,
    filtersOpen,
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
    allFilterValue,
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
  } = usePayrollRunsPage();

  const columns: ColumnConfig<PayrollRunResponse>[] = [
    {
      key: "title",
      label: t("payrollData.columns.title", "Title"),
      sortable: true,
      render: (item) => <span className="font-semibold text-foreground">{formatPayrollRunTitle(item.startDate, item.endDate)}</span>,
    },
    {
      key: "frequency",
      label: t("payrollData.columns.frequency", "Frequency"),
      sortable: true,
      render: () => <span className="text-muted-foreground">{formatPayrollCycleLabel(payrollConfig?.cycleType)}</span>,
    },
    {
      key: "payPeriod",
      label: t("payrollData.columns.payPeriod", "Pay period"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{formatPayPeriodRange(item.startDate, item.endDate)}</span>,
    },
    {
      key: "payDate",
      label: t("payrollData.columns.payDate", "Pay date"),
      sortable: true,
      render: (item) => {
        const payDate = resolvePayrollPayDate(item.endDate, payrollConfig?.payDay ?? 1);
        return <span className="text-muted-foreground">{format(payDate, "MMM d, yyyy")}</span>;
      },
    },
    {
      key: "employeeCount",
      label: t("payrollData.columns.noOfEmployees", "No. of employees"),
      sortable: true,
      render: (item) => <span className="text-foreground">{item.employeeCount}</span>,
    },
    {
      key: "grossPay",
      label: t("payrollData.columns.grossPay", "Gross pay"),
      sortable: true,
      render: (item) => <span className="text-foreground font-medium">{formatCurrency(item.grossPay)}</span>,
    },
    {
      key: "netPay",
      label: t("payrollData.columns.netPay", "Net pay"),
      sortable: true,
      render: (item) => <span className="text-foreground font-medium">{formatCurrency(item.netPay)}</span>,
    },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: (item) => {
        const statusKey = normalizePayrollRunStatus(item.status);
        const statusText = t(
          getPayrollRunStatusTranslationKey(item.status),
          formatPayrollRunStatusLabel(item.status),
        );
        return (
          <Badge
            variant="outline"
            className={`border rounded-[6px] px-2.5 py-1 text-[12px] font-medium gap-1.5 ${getPayrollRunStatusBadgeClass(item.status)}`}
          >
            {statusKey === "paid" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
            ) : statusKey === "finalized" ? (
              <CircleDashed className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
            ) : (
              <CircleDashed className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            {statusText}
          </Badge>
        );
      },
    },
  ];

  const renderRowActions = (item: PayrollRunResponse) => {
    const statusKey = normalizePayrollRunStatus(item.status);
    const actions: TableAction[] = [
      {
        label: t("payrollData.actions.view", "View"),
        icon: Eye,
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); router.push(`/dashboard/payroll/runs/${item.id}`); },
      },
    ];

    if (statusKey === "draft" && canApprovePayrollRuns) {
      actions.push({
        label: t("payrollData.actions.finalize", "Finalize"),
        icon: ClipboardCheck,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setStatusAction({ type: "finalize", run: item });
        },
      });
    }

    if (statusKey === "finalized" && canProcessPayrollRuns) {
      actions.push({
        label: t("payrollData.actions.markPaid", "Mark as paid"),
        icon: Banknote,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setStatusAction({ type: "markPaid", run: item });
        },
      });
    }

    if (statusKey === "draft") {
      actions.push({
        label: t("payrollData.actions.delete", "Delete"),
        icon: Trash2,
        isDanger: true,
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleDelete(item); },
      });
    }

    return <TableActionMenu actions={actions} />;
  };

  return (
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-foreground">
            {t("payrollData.runsTitle", "Payroll runs")}
          </h1>
          <Button className="gap-2" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            {t("payrollData.actions.createRun", "Create payroll run")}
          </Button>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { if (!isCreatePending) setIsCreateDialogOpen(open); }}>
          <DialogContent className="max-w-[560px] w-[96%] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-[12px] [&>button]:hidden">
            <DialogHeader className="bg-card-header-background h-12 px-6 flex flex-row items-center justify-between space-y-0 shrink-0 border-b border-border/50">
              <DialogTitle className="text-sm font-semibold text-foreground leading-none">
                {t("payrollData.dialogs.createRunTitle", "Create New Payroll Run")}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </DialogHeader>

            <div className="p-6 flex flex-col gap-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "payrollData.dialogs.createRunDesc",
                  "Select the pay period for this payroll run. Payslips will be calculated automatically for all eligible employees in this range.",
                )}
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  {t("payrollData.dialogs.periodLabel", "Payroll Period")}
                </label>
                <InlineDateRangePicker
                  value={newRunRange}
                  onChange={setNewRunRange}
                />
              </div>
            </div>

            <DialogFooter className="px-6 pb-6 flex flex-row justify-end gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="h-9 min-w-24"
                disabled={isCreatePending}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                onClick={handleCreateRun}
                disabled={isCreatePending || !newRunRange.from || !newRunRange.to}
                className="h-9 min-w-28 font-semibold"
              >
                {isCreatePending ? t("common.creating", "Creating…") : t("common.create", "Create Run")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmationModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title={t("payrollData.dialogs.deleteRunTitle", "Delete payroll run")}
          message={t(
            "payrollData.dialogs.deleteRunMessage",
            'Are you sure you want to delete "{{title}}"? This cannot be undone.',
            { title: runToDelete ? formatPayrollRunTitle(runToDelete.startDate, runToDelete.endDate) : "" },
          )}
          confirmLabel={t("payrollData.actions.delete", "Delete")}
          onConfirm={confirmDelete}
          isLoading={isDeletePending}
        />

        <ConfirmationModal
          open={replaceConfirmOpen}
          onOpenChange={(open) => {
            if (!isCreatePending) {
              setReplaceConfirmOpen(open);
              if (!open) {
                setRunToReplace(null);
              }
            }
          }}
          title={t("payrollData.dialogs.replaceRunTitle", "Payroll run already exists")}
          message={t(
            "payrollData.dialogs.replaceRunMessage",
            'A draft payroll run already exists for "{{title}}". Regenerating will delete the existing run and its payslips, then create a new draft. Do you want to continue?',
            {
              title: runToReplace
                ? formatPayrollRunTitle(runToReplace.startDate, runToReplace.endDate)
                : newRunRange.from && newRunRange.to
                  ? formatPayrollRunTitle(
                      newRunRange.from.toISOString(),
                      newRunRange.to.toISOString(),
                    )
                  : "",
            },
          )}
          confirmLabel={t("payrollData.actions.regenerate", "Regenerate")}
          variant="primary"
          onConfirm={confirmReplaceRun}
          isLoading={isCreatePending}
        />

        <ConfirmationModal
          open={!!statusAction}
          onOpenChange={(open) => {
            if (!statusActionPending && !open) {
              setStatusAction(null);
            }
          }}
          title={
            statusAction?.type === "markPaid"
              ? t("payrollData.dialogs.markPaidRunTitle", "Mark payroll run as paid")
              : t("payrollData.dialogs.finalizeRunTitle", "Finalize payroll run")
          }
          message={
            statusAction?.type === "markPaid"
              ? t(
                  "payrollData.dialogs.markPaidRunMessage",
                  'Mark "{{title}}" as paid? This indicates payroll has been processed and completes the run.',
                  {
                    title: statusAction
                      ? formatPayrollRunTitle(statusAction.run.startDate, statusAction.run.endDate)
                      : "",
                  },
                )
              : t(
                  "payrollData.dialogs.finalizeRunMessage",
                  'Finalize "{{title}}"? Payslips will be locked for review and the run can no longer be deleted.',
                  {
                    title: statusAction
                      ? formatPayrollRunTitle(statusAction.run.startDate, statusAction.run.endDate)
                      : "",
                  },
                )
          }
          confirmLabel={
            statusAction?.type === "markPaid"
              ? t("payrollData.actions.markPaid", "Mark as paid")
              : t("payrollData.actions.finalize", "Finalize")
          }
          variant="primary"
          onConfirm={confirmStatusAction}
          isLoading={statusActionPending}
        />

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
                title={t("payrollData.stats.totalRuns", "Total runs {{year}}", { year: statsYear })}
                value={stats.total.toString()}
                icon={Banknote}
                iconColor="#2865E3"
                iconBgColor="transparent"
                borderColor="#2865E380"
              />
              <SummaryStatCard
                title={t("payrollData.stats.completedRuns", "Completed runs {{year}}", { year: statsYear })}
                value={stats.completed.toString()}
                icon={CheckCircle2}
                iconColor="#22C55E"
                iconBgColor="transparent"
                borderColor="#22C55E80"
              />
              <SummaryStatCard
                title={t("payrollData.stats.openRuns", "Open runs {{year}}", { year: statsYear })}
                value={stats.pending.toString()}
                icon={CircleDashed}
                iconColor="#D97706"
                iconBgColor="transparent"
                borderColor="#D9770680"
              />
              <SummaryStatCard
                title={t("payrollData.stats.totalGrossPay", "Total gross pay {{year}}", { year: statsYear })}
                value={formatCurrency(stats.totalGrossPay)}
                icon={DollarSign}
                iconColor="#22C55E"
                iconBgColor="transparent"
                borderColor="#22C55E80"
              />
            </>
          )}
        </div>

        <UniversalDataTable
          data={tableRuns}
          columns={columns}
          isLoading={isLoading || isFetching}
          enableSelection={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder={t("payrollData.searchPlaceholder", "Search payroll runs")}
          showFilter={true}
          filterText={t("payrollData.filter1", "Filter")}
          onFilterClick={handleOpenFilters}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          renderCustomFilter={
            <Button
              variant="outline"
              size="default"
              className={cn(
                "h-10 gap-2 border-input",
                (filtersOpen || activeFilterCount > 0) && "bg-muted",
              )}
              onClick={handleOpenFilters}
            >
              <Filter className="h-4 w-4" />
              <span>{t("payrollData.filter1", "Filter")}</span>
              {activeFilterCount > 0 ? (
                <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          }
          renderFilterPanel={
            filtersOpen ? (
              <div className="rounded-[8px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormSelect
                    id="payroll-run-filter-status"
                    label={t("payrollData.columns.status", "Status")}
                    control={filterForm.control}
                    name="status"
                    options={[
                      { value: allFilterValue, label: t("payrollData.filters.allStatuses", "All statuses") },
                      { value: PayrollRunStatusFilter.DRAFT, label: t("payrollData.status.draft", "Draft") },
                      { value: PayrollRunStatusFilter.FINALIZED, label: t("payrollData.status.finalized", "Finalized") },
                      { value: PayrollRunStatusFilter.PAID, label: t("payrollData.status.paid", "Paid") },
                    ]}
                    t={t}
                  />
                  <FormSelect
                    id="payroll-run-filter-year"
                    label={t("payrollData.filters.year", "Year")}
                    control={filterForm.control}
                    name="year"
                    options={[
                      { value: allFilterValue, label: t("payrollData.filters.allYears", "All years") },
                      ...yearFilterOptions,
                    ]}
                    t={t}
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={handleResetFilters}>
                    {t("common.reset", "Reset")}
                  </Button>
                  <Button onClick={handleApplyFilters}>
                    {t("common.apply", "Apply")}
                  </Button>
                </div>
              </div>
            ) : null
          }
          currentPage={currentPage}
          totalPages={metaData?.totalPages ?? 1}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          totalItems={metaData?.total ?? 0}
          renderRowActions={renderRowActions}
        />
      </div>
  );
}
