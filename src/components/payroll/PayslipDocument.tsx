"use client";

import { format } from "date-fns";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import {
  buildEarningLines,
  formatPayrollComponentLabel,
} from "@/features/payroll/payroll-calculation-display.utils";
import {
  PayslipDetailResponse,
} from "@/features/payroll/payroll.types";

type PayslipDocumentProps = {
  detail: PayslipDetailResponse;
  employeeName: string;
  periodLabel: string;
  formatCurrency: (value: number) => string;
  companyName?: string;
  companyLogo?: string;
  employeeNumber?: string;
  jobTitle?: string;
  departmentName?: string;
  hireDate?: string;
};

function DocRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between py-[3px] border-b border-[#e5e7eb] last:border-0 gap-4 ${bold ? "font-semibold" : ""}`}
    >
      <span className="text-[12px] text-[#374151] min-w-[140px] shrink-0">{label}</span>
      <span className="text-[12px] text-[#111827] text-right">{value}</span>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-[#f3f4f6] border border-[#d1d5db] px-3 py-[5px] mt-4 first:mt-0">
      <span className="text-[11px] font-bold text-[#111827] uppercase tracking-wide">
        {title}
      </span>
    </div>
  );
}

function TableRow({
  label,
  current,
  bold,
}: {
  label: string;
  current: string;
  bold?: boolean;
}) {
  return (
    <tr className={`border-b border-[#e5e7eb] last:border-0 ${bold ? "font-semibold bg-[#f9fafb]" : ""}`}>
      <td className="text-[12px] py-[5px] px-3 text-[#374151]">{label}</td>
      <td className="text-[12px] py-[5px] px-3 text-right text-[#111827]">{current}</td>
    </tr>
  );
}

export function PayslipDocument({
  detail,
  employeeName,
  periodLabel,
  formatCurrency,
  companyName,
  companyLogo,
  employeeNumber,
  jobTitle,
  departmentName,
  hireDate,
}: PayslipDocumentProps) {
  const { t } = useTranslation(["payroll", "dashboard"]);

  const earningLines = buildEarningLines(detail);
  const deductionLines = detail.deductions;

  const totalEarnings = earningLines.reduce((s, l) => s + l.amount, 0);
  const totalDeductions = deductionLines.reduce((s, l) => s + l.amount, 0) + detail.unpaidLeaveDeduction + detail.loanDeduction;

  const generatedDate = format(new Date(detail.createdAt), "d MMM yyyy");

  return (
    <div
      id="payslip-document"
      className="bg-white border border-[#d1d5db] text-[#111827] font-sans"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: 1000, width: "100%" }}
    >
      <div className="border-b-4 border-[#1e40af] px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {companyLogo ? (
            <Image
              src={companyLogo}
              alt="logo"
              width={48}
              height={48}
              unoptimized
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div className="flex aspect-square h-12 w-12 items-center justify-center rounded-lg bg-[#1e40af] text-white">
              <Building2 className="h-6 w-6" />
            </div>
          )}
          {companyName && (
            <span className="text-[14px] font-bold text-[#111827]">{companyName}</span>
          )}
        </div>
        <div className="text-right">
          <p className="text-[18px] font-extrabold text-[#1e3a8a] uppercase tracking-wide">
            {t("payrollData.payslipTitle", "Pay Slip")}
          </p>
          <p className="text-[11px] text-[#6b7280]">{periodLabel}</p>
          <p className="text-[11px] text-[#6b7280]">
            {t("payrollData.generated", "Generated")}: {generatedDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border-b border-[#d1d5db]">
        <div className="px-6 py-4 border-r border-[#d1d5db]">
          <p className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wide mb-2">
            {t("payrollData.employeeDetails", "Employee Details")}
          </p>
          <DocRow label={t("payrollData.employeeName", "Employee Name")} value={employeeName} bold />
          {employeeNumber && (
            <DocRow label={t("payrollData.employeeId", "Employee ID")} value={employeeNumber} />
          )}
          {jobTitle && (
            <DocRow label={t("payrollData.jobTitle", "Job Title")} value={jobTitle} />
          )}
          {departmentName && (
            <DocRow label={t("payrollData.department", "Department")} value={departmentName} />
          )}
          {hireDate && (
            <DocRow label={t("payrollData.hireDate", "Hire Date")} value={hireDate} />
          )}
          <DocRow label={t("payrollData.period", "Period")} value={periodLabel} />
          <DocRow
            label={t("payrollData.detail.tabs.attendanceSummary", "Attendance")}
            value={`${detail.attendance.presentDays} / ${detail.attendance.workingDays} days (${detail.attendance.attendanceRate}%)`}
          />
          {detail.attendance.overtimeHours > 0 && (
            <DocRow
              label={t("payrollData.detail.overtime", "Overtime")}
              value={`${detail.attendance.overtimeHours}h`}
            />
          )}
          {detail.attendance.paidLeaveDays > 0 && (
            <DocRow
              label={t("payrollData.detail.paidLeave", "Paid leave")}
              value={`${detail.attendance.paidLeaveDays} days`}
            />
          )}
          {detail.attendance.unpaidLeaveDays > 0 && (
            <DocRow
              label={t("payrollData.detail.unpaidLeave", "Unpaid leave")}
              value={`${detail.attendance.unpaidLeaveDays} days`}
            />
          )}
        </div>

        <div className="px-6 py-4">
          <p className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wide mb-2">
            {t("payrollData.ratesInfo", "Rates & Calculation")}
          </p>
          <DocRow label={t("payrollData.detail.monthlyBase", "Monthly base")} value={formatCurrency(detail.monthlyBasicSalary)} bold />
          <DocRow label={t("payrollData.detail.hourlyRate", "Hourly rate")} value={formatCurrency(detail.rates.hourlyRate)} />
          <DocRow label={t("payrollData.detail.dailyRate", "Daily rate")} value={formatCurrency(detail.rates.dailyRate)} />
          <DocRow label={t("payrollData.detail.periodDays", "Days in period")} value={`${detail.rates.eligibleCalendarDays} / ${detail.rates.daysInPeriod}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border-b border-[#d1d5db]">
        <div className="border-r border-[#d1d5db]">
          <SectionHeader title={t("payrollData.detail.earnings", "Earnings")} />
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                <th className="text-[10px] text-left font-semibold text-[#6b7280] px-3 py-[4px]">
                  {t("payrollData.description", "Description")}
                </th>
                <th className="text-[10px] text-right font-semibold text-[#6b7280] px-3 py-[4px]">
                  {t("payrollData.amount", "Amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {earningLines.map((line) => (
                <TableRow
                  key={line.id}
                  label={formatPayrollComponentLabel(line.name, line.type, line.rawValue)}
                  current={formatCurrency(line.amount)}
                />
              ))}
              <TableRow
                label={t("payrollData.detail.totalEarning", "Total Earnings")}
                current={formatCurrency(totalEarnings)}
                bold
              />
            </tbody>
          </table>
        </div>

        <div>
          <SectionHeader title={t("payrollData.detail.deductions", "Deductions")} />
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                <th className="text-[10px] text-left font-semibold text-[#6b7280] px-3 py-[4px]">
                  {t("payrollData.description", "Description")}
                </th>
                <th className="text-[10px] text-right font-semibold text-[#6b7280] px-3 py-[4px]">
                  {t("payrollData.amount", "Amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {deductionLines.length === 0 && detail.unpaidLeaveDeduction === 0 && detail.loanDeduction === 0 ? (
                <tr>
                  <td colSpan={2} className="text-[12px] text-[#9ca3af] px-3 py-3">
                    {t("payrollData.detail.noDeductions", "No deductions for this period")}
                  </td>
                </tr>
              ) : (
                <>
                  {deductionLines.map((line) => (
                    <TableRow
                      key={line.id}
                      label={formatPayrollComponentLabel(line.name, line.type, line.rawValue)}
                      current={formatCurrency(line.amount)}
                    />
                  ))}
                  {detail.unpaidLeaveDeduction > 0 && (
                    <TableRow
                      label={t("payrollData.detail.unpaidDeduction", "Unpaid leave")}
                      current={formatCurrency(detail.unpaidLeaveDeduction)}
                    />
                  )}
                  {detail.loanDeduction > 0 && (
                    <TableRow
                      label={t("payrollData.detail.loanDeduction", "Loan installment")}
                      current={formatCurrency(detail.loanDeduction)}
                    />
                  )}
                </>
              )}
              <TableRow
                label={t("payrollData.detail.totalDeduction", "Total Deductions")}
                current={formatCurrency(totalDeductions)}
                bold
              />
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-[#1e3a8a]">
        <div>
          <p className="text-[11px] text-[#93c5fd]">
            {t("payrollData.detail.calcFormula", "Calculation")}: Net = Gross − Deductions
          </p>
          <p className="text-[11px] text-[#93c5fd]">
            {t("payrollData.detail.salaryGross", "Gross pay")}: {formatCurrency(detail.grossPay)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-[#bfdbfe] uppercase tracking-widest">
            {t("payrollData.detail.tabs.netSalary", "Net Pay")}
          </p>
          <p className="text-[28px] font-extrabold text-white leading-tight">
            {formatCurrency(detail.netPay)}
          </p>
        </div>
      </div>

      <div className="px-6 py-2 bg-[#f9fafb] border-t border-[#d1d5db]">
        <p className="text-[10px] text-[#9ca3af] text-center">
          {t("payrollData.confidentialNote", "This payslip is computer-generated and is confidential.")}
        </p>
      </div>
    </div>
  );
}
