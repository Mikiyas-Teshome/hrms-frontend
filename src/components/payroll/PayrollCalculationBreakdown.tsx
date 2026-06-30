"use client";

import { format } from "date-fns";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildEarningLines,
  formatPayrollComponentLabel,
} from "@/features/payroll/payroll-calculation-display.utils";
import {
  EmployeePayrollPreviewResponse,
  PayrollIneligibilityReason,
  PayslipDetailResponse,
} from "@/features/payroll/payroll.types";

type PayrollCalculationData = EmployeePayrollPreviewResponse | PayslipDetailResponse;

type PayrollCalculationBreakdownProps = {
  detail: PayrollCalculationData;
  formatCurrency: (value: number) => string;
  defaultTab?: string;
};

function ineligibilityMessage(
  reason: PayrollIneligibilityReason | null | undefined,
  t: (key: string, fallback: string) => string,
): string | undefined {
  switch (reason) {
    case PayrollIneligibilityReason.NO_ACTIVE_CONTRACT:
      return t(
        "payrollData.detail.ineligibleNoContract",
        "No active contract for this pay period.",
      );
    case PayrollIneligibilityReason.CONTRACT_EFFECTIVE_DATE_MISSING:
      return t(
        "payrollData.detail.ineligibleEffectiveDateMissing",
        "Contract effective date is missing.",
      );
    case PayrollIneligibilityReason.CONTRACT_NOT_EFFECTIVE_IN_PERIOD:
      return t(
        "payrollData.detail.ineligibleNotEffective",
        "Contract is not effective during this pay period.",
      );
    default:
      return undefined;
  }
}

export function PayrollCalculationBreakdown({
  detail,
  formatCurrency,
  defaultTab = "earning-deduction",
}: PayrollCalculationBreakdownProps) {
  const { t, i18n } = useTranslation(["payroll", "dashboard"]);

  const earningLines = buildEarningLines(detail);
  const deductionLines = detail.deductions;
  const totalOvertime = detail.totalOvertime + detail.totalDutyOvertime;
  const rates = "rates" in detail ? detail.rates : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-[18px] font-bold text-foreground">
          {t("payrollData.detail.calculatorTitle", "Payroll calculation")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {format(new Date(detail.periodStart), "MMM d, yyyy")} –{" "}
          {format(new Date(detail.periodEnd), "MMM d, yyyy")}
        </p>
      </div>

      {!detail.payrollEligible ? (
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
              {ineligibilityMessage(detail.ineligibilityReason, t) ??
                t(
                  "payrollData.detail.contractNotStartedDesc",
                  "Payroll is calculated only after the employee contract is active and effective in this period.",
                )}
            </p>
          </div>
        </div>
      ) : null}

      <Tabs defaultValue={defaultTab} className="w-full" dir={i18n.dir() as "ltr" | "rtl"}>
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg flex-wrap sm:flex-nowrap">
          <TabsTrigger
            className="flex-1 min-w-[150px] data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]"
            value="attendance-summary"
          >
            {t("payrollData.detail.tabs.attendanceSummary", "Attendance summary")}
          </TabsTrigger>
          <TabsTrigger
            className="flex-1 min-w-[150px] data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]"
            value="earning-deduction"
          >
            {t("payrollData.detail.tabs.earningDeduction", "Earning & deduction")}
          </TabsTrigger>
          <TabsTrigger
            className="flex-1 min-w-[150px] data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]"
            value="net-salary"
          >
            {t("payrollData.detail.tabs.netSalary", "Net salary")}
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="attendance-summary" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  ["working", detail.attendance.workingDays],
                  ["present", detail.attendance.presentDays],
                  ["half", detail.attendance.halfDays],
                  ["absent", detail.attendance.absentDays],
                  ["paidLeave", detail.attendance.paidLeaveDays],
                  ["unpaidLeave", detail.attendance.unpaidLeaveDays],
                  ["overtime", `${detail.attendance.overtimeHours}h`],
                ] as const
              ).map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 min-h-[100px]"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {t(`payrollData.detail.${key}`, key)}
                  </p>
                  <p className="text-[18px] font-bold mt-2">{value}</p>
                </div>
              ))}
            </div>
            {rates ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-[12px] border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{t("payrollData.detail.hourlyRate", "Hourly rate")}</p>
                  <p className="font-semibold mt-1">{formatCurrency(rates.hourlyRate)}</p>
                </div>
                <div className="rounded-[12px] border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{t("payrollData.detail.dailyRate", "Daily rate")}</p>
                  <p className="font-semibold mt-1">{formatCurrency(rates.dailyRate)}</p>
                </div>
                <div className="rounded-[12px] border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{t("payrollData.detail.periodDays", "Days in period")}</p>
                  <p className="font-semibold mt-1">{rates.daysInPeriod}</p>
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="earning-deduction" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
                <div className="bg-muted/40 border-b border-border p-4">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {t("payrollData.detail.earnings", "Earnings")}
                  </p>
                </div>
                <div className="flex flex-col p-4">
                  {earningLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between py-4 border-b border-border/70 last:border-0"
                    >
                      <span className="text-[14px] font-bold text-foreground">
                        {formatPayrollComponentLabel(
                          line.name,
                          line.type,
                          line.rawValue,
                          "taxable" in line ? (line as { taxable?: boolean }).taxable : undefined,
                        )}
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
                      {formatCurrency(detail.grossPay)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
                <div className="bg-muted/40 border-b border-border p-4">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {t("payrollData.detail.deductions", "Deductions")}
                  </p>
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
                          {formatPayrollComponentLabel(
                            line.name,
                            line.type,
                            line.rawValue,
                            "taxable" in line ? (line as { taxable?: boolean }).taxable : undefined,
                          )}
                        </span>
                        <span className="text-[14px] font-medium text-red-600 dark:text-red-400">
                          - {formatCurrency(line.amount)}
                        </span>
                      </div>
                    ))
                  )}
                  {"tax" in detail && detail.tax ? (
                    <div className="mt-4 rounded-lg border border-border/70 bg-muted/20 p-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        {detail.tax.taxRuleName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("payrollData.detail.taxableIncome", "Taxable income")}:{" "}
                        {formatCurrency(detail.tax.taxableIncome)}
                      </p>
                      <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                        {t("payrollData.detail.incomeTax", "Income tax")}: -{" "}
                        {formatCurrency(detail.tax.taxAmount)}
                      </p>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between pt-6 pb-2">
                    <span className="text-[16px] font-bold text-foreground">
                      {t("payrollData.detail.totalDeduction", "Total deduction")}
                    </span>
                    <span className="text-[16px] font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(
                        detail.totalDeductions +
                          detail.unpaidLeaveDeduction +
                          detail.loanDeduction,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="net-salary" className="mt-0">
            <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
              <div className="bg-muted/40 border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-muted-foreground">
                  {t("payrollData.detail.netSalaryBreakdown", "Net salary breakdown")}
                </p>
              </div>
              <div className="flex flex-col p-4 w-full text-sm">
                <div className="flex justify-between py-4 border-b border-border/70 font-medium text-foreground">
                  <span>{t("payrollData.detail.basicSalary", "Basic salary")}</span>
                  <span className="text-primary font-bold">{formatCurrency(detail.basicSalary)}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                  <span>{t("payrollData.detail.totalEarning", "Total allowances")}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    + {formatCurrency(detail.totalAllowances)}
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                  <span>{t("payrollData.detail.overtime", "Overtime")}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    + {formatCurrency(totalOvertime)}
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                  <span>{t("payrollData.detail.totalDeduction", "Total deduction")}</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    - {formatCurrency(detail.totalDeductions)}
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                  <span>{t("payrollData.detail.unpaidDeduction", "Unpaid leave deduction")}</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    - {formatCurrency(detail.unpaidLeaveDeduction)}
                  </span>
                </div>
                {detail.loanDeduction > 0 ? (
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.loanDeduction", "Loan deduction")}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      - {formatCurrency(detail.loanDeduction)}
                    </span>
                  </div>
                ) : null}
                {"incomeTaxAmount" in detail && detail.incomeTaxAmount > 0 ? (
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>
                      {t("payrollData.detail.incomeTax", "Income tax")}
                      {"tax" in detail && detail.tax?.taxRuleName
                        ? ` (${detail.tax.taxRuleName})`
                        : ""}
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      - {formatCurrency(detail.incomeTaxAmount)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center py-4 font-bold text-[16px] text-foreground">
                  <span>{t("payrollData.detail.tabs.netSalary", "Net salary")}</span>
                  <span>{formatCurrency(detail.netPay)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 bg-primary/10 p-4 rounded-xl border border-primary/20 text-[13px] text-muted-foreground">
              <div className="bg-primary/20 p-1.5 rounded-full">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <p>
                  <span className="font-semibold text-foreground">
                    {t("payrollData.detail.calcFormula", "Calculation formula")}:{" "}
                  </span>
                  {t(
                    "payrollData.detail.formula",
                    "Net salary = (basic salary + allowances + overtime) − (structure deductions + insurance + income tax on taxable income + unpaid leave + loans). Taxable allowances are included in the tax rule calculation.",
                  )}
                </p>
                <p>
                  <span className="font-semibold text-foreground">
                    {t("payrollData.detail.monthlyBase", "Monthly base")}:{" "}
                  </span>
                  {formatCurrency(detail.monthlyBasicSalary)}
                </p>
                {rates ? (
                  <p>
                    <span className="font-semibold text-foreground">
                      {t("payrollData.detail.proration", "Proration")}:{" "}
                    </span>
                    {t(
                      "payrollData.detail.prorationDetail",
                      "{{eligible}} eligible days of {{total}} in period (scale {{scale}})",
                      {
                        eligible: rates.eligibleCalendarDays,
                        total: rates.daysInPeriod,
                        scale: rates.scalingFactor.toFixed(4),
                      },
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
