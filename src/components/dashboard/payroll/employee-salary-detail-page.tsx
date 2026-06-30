"use client";

import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
  Wallet,
  Briefcase,
  Hourglass,
  CheckCircle2,
  CircleDashed,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { AssignEmployeeSalarySheet } from "@/components/payroll/assign-employee-salary-sheet";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import { AttendanceRecord, AttendanceStatus } from "@/features/attendance/attendance.types";
import { EmployeePayrollContractStatus } from "@/features/employee/employee.types";
import { format } from "date-fns";
import { useEmployeeSalaryDetailPage } from "@/features/payroll/hooks/useEmployeeSalaryDetailPage";

export function EmployeeSalaryDetailPage({ employeeId }: { employeeId: string }) {
  const { i18n } = useTranslation(["payroll", "dashboard"]);
  const {
    t,
    router,
    employee,
    employeeName,
    salaryStructure,
    payrollPreview,
    previewLoading,
    previewError,
    isPageLoading,
    payrollEligible,
    ineligibilityMessage,
    monthlyBaseSalary,
    basicSalary,
    totalAllowances,
    totalDeductions,
    totalOvertime,
    totalDutyOvertime,
    unpaidLeaveDeduction,
    loanDeduction,
    grossPay,
    netSalary,
    attendanceSummary,
    earningLines,
    deductionLines,
    totalDeductionAmount,
    formatCurrency,
    formatComponentLabel,
    attendanceRecords,
    attendanceRecordsLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    isAssignSheetOpen,
    setIsAssignSheetOpen,
    salaryStructures,
    structuresLoading,
    companyOptions,
    structureScopeId,
    setSelectedOuId,
    isLoadingCompanies,
    currencyCode,
    salaryEditInitialValues,
    isAssignPending,
    handleAssignSalary,
  } = useEmployeeSalaryDetailPage(employeeId);

  const columns: ColumnConfig<AttendanceRecord>[] = [
    {
      key: "date",
      label: t("payrollData.columns.createdDate", "Date").split(" ")[0],
      sortable: true,
      render: (item) => format(new Date(item.date), "MMM d, yyyy"),
    },
    {
      key: "clockIn",
      label: "Clock in",
      sortable: true,
      render: (item) => item.clockIn ? format(new Date(item.clockIn), "HH:mm") : "—",
    },
    {
      key: "clockOut",
      label: "Clock out",
      sortable: true,
      render: (item) => item.clockOut ? format(new Date(item.clockOut), "HH:mm") : "—",
    },
    {
      key: "totalMinutes",
      label: "Total time",
      sortable: true,
      render: (item) => {
        const hours = Math.floor(item.totalMinutes / 60);
        const minutes = item.totalMinutes % 60;
        return `${hours}h ${minutes}m`;
      },
    },
    {
      key: "overtimeMinutes",
      label: t("payrollData.detail.overtime", "Overtime"),
      sortable: true,
      render: (item) => `${Math.floor(item.overtimeMinutes / 60)}h ${item.overtimeMinutes % 60}m`,
    },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: (item) => {
        const isPresent = item.status === AttendanceStatus.PRESENT;
        const statusText = isPresent ? t("payrollData.status.present", "Present") : t("payrollData.status.onLeave", "On leave");
        return (
          <Badge
            variant="outline"
            className={`border rounded-[6px] px-2.5 py-1 text-[12px] font-medium gap-1.5 ${
              isPresent
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300"
            }`}
          >
            {isPresent ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
            ) : (
              <CircleDashed className="w-3.5 h-3.5 text-amber-500" />
            )}
            {statusText}
          </Badge>
        );
      },
    },
  ];

  if (isPageLoading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div className="flex flex-col items-start gap-3">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
        </div>
        <div className="h-9 w-full bg-muted animate-pulse rounded-lg mt-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-25 bg-muted animate-pulse rounded-[12px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!salaryStructure) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between pt-2">
          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center text-sm font-medium text-foreground gap-2 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t("payrollData.detail.back", "Back")}
            </button>
            <h1 className="text-2xl font-bold text-foreground">{employeeName}</h1>
          </div>
          <Button
            className="h-11 px-6 rounded-xl font-semibold shrink-0"
            onClick={() => setIsAssignSheetOpen(true)}
          >
            {t("payrollData.detail.assignStructure", "Assign salary")}
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30 p-10 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t(
              "payrollData.detail.noStructureDesc",
              "Assign a salary structure template and base salary to manage this employee's compensation.",
            )}
          </p>
        </div>

        <AssignEmployeeSalarySheet
          isOpen={isAssignSheetOpen}
          onOpenChange={setIsAssignSheetOpen}
          employeeName={employeeName}
          structures={salaryStructures}
          isLoadingStructures={structuresLoading}
          companyOptions={companyOptions}
          selectedCompanyId={structureScopeId}
          onCompanyChange={setSelectedOuId}
          isLoadingCompanies={isLoadingCompanies}
          currencyCode={currencyCode}
          isSubmitting={isAssignPending}
          onSubmit={handleAssignSalary}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden pb-10">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div className="flex flex-col items-start gap-3">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-sm font-medium text-foreground gap-2 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("payrollData.detail.back", "Back")}
          </button>
          <h1 className="text-[24px] font-bold text-foreground">{employee?.firstName} {employee?.lastName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-[40px] px-4 font-medium rounded-lg gap-2"
            onClick={() => setIsAssignSheetOpen(true)}
          >
            <Pencil className="w-4 h-4" />
            {t("payrollData.actions.edit", "Edit")}
          </Button>
          <Button variant="outline" className="h-[40px] px-4 font-medium rounded-lg gap-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("payrollData.detail.previous", "Previous")}
          </Button>
          <Button variant="outline" className="h-[40px] px-4 font-medium rounded-lg gap-2 bg-muted/40 hover:bg-muted">
            {t("payrollData.detail.next", "Next")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatCard
          title={t("payrollData.detail.salaryGross", "Salary (gross)")}
          value={formatCurrency(grossPay)}
          icon={Wallet}
          iconColor="#2865E3"
          iconBgColor="#EFF4FF"
          borderColor="#D1E0FF"
        />
        <SummaryStatCard
          title={t("payrollData.detail.salaryNet", "Salary (Net)")}
          value={formatCurrency(netSalary)}
          icon={Wallet}
          iconColor="#2865E3"
          iconBgColor="#EFF4FF"
          borderColor="#D1E0FF"
        />
        <SummaryStatCard
          title={t("payrollData.detail.workingDays", "Working days")}
          value={String(attendanceSummary?.workingDays ?? "—")}
          icon={Briefcase}
          iconColor="#9B51E0"
          iconBgColor="#F3E8FF"
          borderColor="#E9D5FF"
        />
        <SummaryStatCard
          title={t("payrollData.detail.attendanceRate", "Attendance rate")}
          value={
            attendanceSummary ? `${attendanceSummary.attendanceRate}%` : "—"
          }
          icon={Hourglass}
          iconColor="#F79009"
          iconBgColor="#FFFAEB"
          borderColor="#FEF0C7"
        />
      </div>

      {!payrollEligible && payrollPreview ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex gap-3">
          <Info className="w-5 h-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              {t(
                "payrollData.detail.contractNotStartedTitle",
                "Contract not active for this pay period",
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {ineligibilityMessage ??
                t(
                  "payrollData.detail.contractNotStartedDesc",
                  "Payroll is calculated only after the employee contract is active and effective in this period. Assigned monthly base: {{amount}}.",
                  { amount: formatCurrency(monthlyBaseSalary) },
                )}
            </p>
            {employee?.payrollContractStatus === EmployeePayrollContractStatus.DRAFT ? (
              <p className="text-xs text-muted-foreground">
                {t(
                  "payrollData.columns.contractPending",
                  "Contract pending",
                )}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}


      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[18px] font-bold text-foreground">{t("payrollData.detail.calculatorTitle", "payroll calculation")}</h2>
          {payrollPreview ? (
            <p className="text-sm text-muted-foreground">
              {format(new Date(payrollPreview.periodStart), "MMM d, yyyy")} –{" "}
              {format(new Date(payrollPreview.periodEnd), "MMM d, yyyy")}
            </p>
          ) : null}
        </div>

        {previewError ? (
          <p className="text-sm text-destructive">
            {t("payrollData.errors.previewFailed", "Unable to load payroll calculation.")}
          </p>
        ) : null}

        <Tabs defaultValue="earning-deduction" className="w-full" dir={i18n.dir() as "ltr" | "rtl"}>
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg flex-wrap sm:flex-nowrap">
            <TabsTrigger className="flex-1 min-w-37.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]" value="attendance-summary">{t("payrollData.detail.tabs.attendanceSummary", "Attendance summary")}</TabsTrigger>
            <TabsTrigger className="flex-1 min-w-37.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]" value="daily-attendance">{t("payrollData.detail.tabs.dailyRecord", "Daily attendance record")}</TabsTrigger>
            <TabsTrigger className="flex-1 min-w-37.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]" value="earning-deduction">{t("payrollData.detail.tabs.earningDeduction", "Earning & deduction")}</TabsTrigger>
            <TabsTrigger className="flex-1 min-w-37.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]" value="net-salary">{t("payrollData.detail.tabs.netSalary", "Net salary")}</TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="attendance-summary" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.working", "Working days")}</p>
                  <p className="text-[18px] font-bold mt-2">{attendanceSummary?.workingDays ?? "—"}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.present", "Present days")}</p>
                  <p className="text-[18px] font-bold mt-2">{attendanceSummary?.presentDays ?? "—"}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.half", "Half days")}</p>
                  <p className="text-[18px] font-bold mt-2">{attendanceSummary?.halfDays ?? "—"}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.absent", "Absent days")}</p>
                  <p className="text-[18px] font-bold mt-2">{attendanceSummary?.absentDays ?? "—"}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.paidLeave", "Paid leave days")}</p>
                  <p className="text-[18px] font-bold mt-2">{attendanceSummary?.paidLeaveDays ?? "—"}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.unpaidLeave", "Unpaid leave days")}</p>
                  <p className="text-[18px] font-bold mt-2">{attendanceSummary?.unpaidLeaveDays ?? "—"}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.overtime", "Overtime")}</p>
                  <p className="text-[18px] font-bold mt-2">
                    {attendanceSummary ? `${attendanceSummary.overtimeHours}h` : "—"}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="daily-attendance" className="mt-0">
              <UniversalDataTable
                data={attendanceRecords}
                columns={columns}
                isLoading={attendanceRecordsLoading}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(attendanceRecords.length / pageSize))}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                totalItems={attendanceRecords.length}
                showSearch={false}
                showFilter={false}
              />
            </TabsContent>

            <TabsContent value="earning-deduction" className="mt-0">
              {previewLoading ? (
                <p className="text-sm text-muted-foreground">{t("common.loading", "Loading...")}</p>
              ) : !payrollPreview ? (
                <p className="text-sm text-muted-foreground">
                  {t("payrollData.errors.previewFailed", "Unable to load payroll calculation.")}
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
                    <div className="bg-muted/40 border-b border-border p-4 flex justify-between items-center">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {t("payrollData.detail.earnings", "Earnings")}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          router.push(`/dashboard/payroll/salary-structures/${salaryStructure.id}`)
                        }
                      >
                        {t("payrollData.salaryStructures.manageTemplate", "Manage template")}
                      </Button>
                    </div>
                    <div className="flex flex-col p-4">
                      {earningLines.map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center justify-between py-4 border-b border-border/70 last:border-0"
                        >
                          <span className="text-[14px] font-bold text-foreground">
                            {formatComponentLabel(line.name, line.type, line.rawValue)}
                          </span>
                          <span className="text-[14px] font-medium text-emerald-600 dark:text-emerald-400">
                            + {formatCurrency(line.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-6 pb-2">
                        <span className="text-[16px] font-bold text-foreground">
                          {t("payrollData.detail.totalEarning", "Total earning")}
                        </span>
                        <span className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(grossPay)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
                    <div className="bg-muted/40 border-b border-border p-4 flex justify-between items-center">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {t("payrollData.detail.deductions", "Deductions")}
                      </p>
                      <span className="text-xs text-muted-foreground">{salaryStructure.name}</span>
                    </div>
                    <div className="flex flex-col p-4">
                      {deductionLines.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground">
                          {t("payrollData.detail.noDeductions", "No deductions for this period")}
                        </p>
                      ) : (
                        deductionLines.map((line) => (
                          <div
                            key={line.id}
                            className="flex items-center justify-between py-4 border-b border-border/70 last:border-0"
                          >
                            <span className="text-[14px] font-bold text-foreground">
                              {formatComponentLabel(line.name, line.type, line.rawValue)}
                            </span>
                            <span className="text-[14px] font-medium text-red-600 dark:text-red-400">
                              - {formatCurrency(line.amount)}
                            </span>
                          </div>
                        ))
                      )}
                      <div className="flex items-center justify-between pt-6 pb-2">
                        <span className="text-[16px] font-bold text-foreground">
                          {t("payrollData.detail.totalDeduction", "Total deduction")}
                        </span>
                        <span className="text-[16px] font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(totalDeductionAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="net-salary" className="mt-0">
              {previewLoading || !payrollPreview ? (
                <p className="text-sm text-muted-foreground">
                  {previewLoading
                    ? t("common.loading", "Loading...")
                    : t("payrollData.errors.previewFailed", "Unable to load payroll calculation.")}
                </p>
              ) : (
              <>
              <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
                <div className="bg-muted/40 border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-muted-foreground">{t("payrollData.detail.earnings", "Earnings")}</p>
                </div>
                <div className="flex flex-col p-4 w-full text-sm">
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium text-foreground">
                    <span>{t("payrollData.detail.basicSalary", "Basic salary")}</span>
                    <span className="text-primary font-bold">{formatCurrency(basicSalary)}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.totalEarning", "Total allowances")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ {formatCurrency(totalAllowances)}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.overtime", "Overtime")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      + {formatCurrency(totalOvertime + totalDutyOvertime)}
                    </span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.totalDeduction", "Total deduction")}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">- {formatCurrency(totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.unpaidDeduction", "Unpaid leave deduction")}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      - {formatCurrency(unpaidLeaveDeduction)}
                    </span>
                  </div>
                  {loanDeduction > 0 ? (
                    <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                      <span>{t("payrollData.detail.loanDeduction", "Loan deduction")}</span>
                      <span className="text-red-600 dark:text-red-400 font-bold">
                        - {formatCurrency(loanDeduction)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between items-center py-4 font-bold text-[16px] text-foreground">
                    <span>{t("payrollData.detail.tabs.netSalary", "Net salary")}</span>
                    <span className="text-foreground">{formatCurrency(netSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 bg-primary/10 p-4 rounded-xl border border-primary/20 text-[13px] text-muted-foreground">
                <div className="bg-primary/20 p-1.5 rounded-full">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <p>
                    <span className="font-semibold text-foreground">{t("payrollData.detail.calcFormula", "Calculation Formula")}: </span> 
                    {t("payrollData.detail.formula", "Net Salary = (Basic Salary + Allowances) - (Absent day × Unpaid Leave Days) + Overtime - Deductions")}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">{t("payrollData.detail.breakdownLabel", "Unpaid Leave Days Breakdown")}: </span>
                    {t("payrollData.detail.breakdownValue", "Unpaid Leaves, Absent Days, Half Days, Total Unpaid Days")}
                  </p>
                </div>
              </div>
              </>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <AssignEmployeeSalarySheet
        isOpen={isAssignSheetOpen}
        onOpenChange={setIsAssignSheetOpen}
        employeeName={[employee?.firstName, employee?.lastName].filter(Boolean).join(" ")}
        structures={salaryStructures}
        isLoadingStructures={structuresLoading}
        companyOptions={companyOptions}
        selectedCompanyId={structureScopeId}
        onCompanyChange={setSelectedOuId}
        isLoadingCompanies={isLoadingCompanies}
        currencyCode={currencyCode}
        isSubmitting={isAssignPending}
        mode="edit"
        initialValues={salaryEditInitialValues}
        onSubmit={handleAssignSalary}
      />
    </div>
  );
}
