"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { PayrollCalculationBreakdown } from "@/components/payroll/PayrollCalculationBreakdown";
import { PayslipDetailSkeleton } from "@/components/payroll/payslip-detail-skeleton";
import { useEmployees } from "@/features/employee/hooks/useEmployee";
import { usePayslip, usePayrollRun } from "@/features/payroll/hooks/usePayroll";
import { useSettingsCompany } from "@/features/settings/hooks/useSettingsCompany";
import { useDisplayCurrency } from "@/features/settings/hooks/useDisplayCurrency";
import { formatIntlCurrency } from "@/lib/currency";
import { formatPayrollRunTitle } from "@/features/payroll/payroll-run.utils";
import { downloadPayslipPdf, resolvePayrollDisplayCurrency } from "@/features/payroll/payslip.utils";
import { Briefcase, Hourglass, Wallet } from "lucide-react";

export function PayslipDetailPage({ payslipId }: { payslipId: string }) {
  const { t } = useTranslation(["payroll", "dashboard"]);
  const router = useRouter();
  const { company } = useSettingsCompany();
  const { currencyCode } = useDisplayCurrency();
  const { data: payslip, isLoading, isError, error } = usePayslip(payslipId);

  const displayCurrency = resolvePayrollDisplayCurrency({
    companyCurrency: currencyCode,
    payslips: payslip ? [payslip] : [],
  });

  const { data: payrollRun } = usePayrollRun(payslip?.payrollRunId ?? "");
  const { data: employees = [] } = useEmployees();

  const employee = useMemo(() => {
    return employees.find((item) => item.id === payslip?.employeeId);
  }, [employees, payslip?.employeeId]);

  const employeeName = useMemo(() => {
    if (!employee) return payslip?.employeeId ?? "";
    return `${employee.firstName} ${employee.lastName}`.trim();
  }, [employee, payslip?.employeeId]);

  const formatCurrency = (value: number) =>
    formatIntlCurrency(value, displayCurrency, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const periodLabel = payrollRun
    ? formatPayrollRunTitle(payrollRun.startDate, payrollRun.endDate)
    : payslip
      ? `${format(new Date(payslip.periodStart), "MMM d, yyyy")} – ${format(new Date(payslip.periodEnd), "MMM d, yyyy")}`
      : "";

  const handleDownload = () => {
    if (!payslip) return;
    downloadPayslipPdf(
      payslip,
      employeeName,
      periodLabel,
      (value) => formatCurrency(value),
      {
        employeeNumber: employee?.employeeNumber,
        jobTitle: employee?.jobTitle,
        departmentName: employee?.orgUnit?.orgUnitName,
        hireDate: employee?.hireDate ? format(new Date(employee.hireDate), "dd MMM yyyy") : undefined,
        companyName: company?.name,
        companyLogo: company?.logo || undefined,
      }
    );
  };

  if (isLoading) {
    return <PayslipDetailSkeleton />;
  }

  if (isError || !payslip) {
    return (
        <div className="flex flex-col gap-4 p-8">
          <p className="text-muted-foreground">
            {isError && error instanceof Error
              ? error.message
              : t("payrollData.errors.payslipNotFound", "Payslip not found")}
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard/payroll/payslips")}>
            {t("common.back", "Back")}
          </Button>
        </div>
    );
  }

  return (
      <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden pb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/payroll/payslips")}
              aria-label={t("common.back", "Back")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px] font-bold text-foreground">{employeeName}</h1>
              <p className="text-sm text-muted-foreground">
                {periodLabel} · {format(new Date(payslip.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            {t("payrollData.actions.downloadPdf", "Download PDF")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryStatCard
            title={t("payrollData.detail.salaryGross", "Salary (gross)")}
            value={formatCurrency(payslip.grossPay)}
            icon={Wallet}
            iconColor="#2865E3"
            iconBgColor="#EFF4FF"
            borderColor="#D1E0FF"
          />
          <SummaryStatCard
            title={t("payrollData.detail.salaryNet", "Salary (Net)")}
            value={formatCurrency(payslip.netPay)}
            icon={Wallet}
            iconColor="#2865E3"
            iconBgColor="#EFF4FF"
            borderColor="#D1E0FF"
          />
          <SummaryStatCard
            title={t("payrollData.detail.workingDays", "Working days")}
            value={String(payslip.attendance.workingDays)}
            icon={Briefcase}
            iconColor="#9B51E0"
            iconBgColor="#F3E8FF"
            borderColor="#E9D5FF"
          />
          <SummaryStatCard
            title={t("payrollData.detail.attendanceRate", "Attendance rate")}
            value={`${payslip.attendance.attendanceRate}%`}
            icon={Hourglass}
            iconColor="#F79009"
            iconBgColor="#FFFAEB"
            borderColor="#FEF0C7"
          />
        </div>

        <PayrollCalculationBreakdown detail={payslip} formatCurrency={formatCurrency} />
      </div>
  );
}
