import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  buildEarningLines,
  formatPayrollComponentLabel,
} from './payroll-calculation-display.utils';
import { PayslipDetailResponse, PayslipResponse } from './payroll.types';

export type PayslipTableRow = PayslipResponse & {
  employeeName: string;
};

export function buildEmployeeNameMap(
  employees: { id: string; firstName: string; lastName: string }[],
): Map<string, string> {
  return new Map(
    employees.map((employee) => [
      employee.id,
      `${employee.firstName} ${employee.lastName}`.trim(),
    ]),
  );
}

export function enrichPayslipsWithEmployeeNames(
  payslips: PayslipResponse[],
  employeeNameById: Map<string, string>,
): PayslipTableRow[] {
  return payslips.map((payslip) => ({
    ...payslip,
    employeeName: employeeNameById.get(payslip.employeeId) ?? payslip.employeeId,
  }));
}

export function resolvePayslipListCurrency(
  payslips: Pick<PayslipResponse, 'currency'>[],
  summaryCurrency?: string,
): string | undefined {
  if (summaryCurrency?.trim()) {
    return summaryCurrency.trim().toUpperCase();
  }

  const currencies = [
    ...new Set(
      payslips
        .map((payslip) => payslip.currency?.trim().toUpperCase())
        .filter((currency): currency is string => Boolean(currency)),
    ),
  ];

  return currencies.length === 1 ? currencies[0] : undefined;
}

export function resolvePayrollDisplayCurrency(options: {
  companyCurrency?: string | null;
  payslips?: Pick<PayslipResponse, 'currency'>[];
  summaryCurrency?: string;
}): string {
  const company = options.companyCurrency?.trim().toUpperCase();
  if (company) {
    return company;
  }

  return resolvePayslipListCurrency(options.payslips ?? [], options.summaryCurrency) ?? 'USD';
}

export function downloadPayslipsCsv(rows: PayslipTableRow[], filename: string) {
  const headers = [
    'Payslip ID',
    'Employee',
    'Basic salary',
    'Allowances',
    'Deductions',
    'Overtime',
    'Gross pay',
    'Net pay',
    'Created',
  ];

  const escape = (value: string | number) => {
    const text = String(value);
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.id,
        row.employeeName,
        row.basicSalary,
        row.totalAllowances,
        row.totalDeductions,
        row.totalOvertime + row.totalDutyOvertime,
        row.grossPay,
        row.netPay,
        format(new Date(row.createdAt), 'yyyy-MM-dd'),
      ]
        .map(escape)
        .join(','),
    ),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadPayslipPdf(
  detail: PayslipDetailResponse,
  employeeName: string,
  periodLabel: string,
  formatAmount: (value: number) => string,
  options?: {
    employeeNumber?: string;
    jobTitle?: string;
    departmentName?: string;
    hireDate?: string;
    companyName?: string;
    companyLogo?: string;
  }
) {
  const doc = new jsPDF();
  const margin = 14;
  let y = 18;

  doc.setFillColor(243, 244, 246);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(1.5);
  doc.line(0, 35, 210, 35);

  doc.setTextColor(17, 24, 39);

  if (options?.companyLogo) {
    try {
      doc.addImage(options.companyLogo, 'PNG', margin, 8, 12, 12);
    } catch {
      doc.setFillColor(30, 64, 175);
      doc.roundedRect(margin, 8, 12, 12, 2, 2, 'F');
      doc.setFillColor(255, 255, 255);
      doc.triangle(margin + 2.5, 14.5, margin + 6, 11.5, margin + 9.5, 14.5, 'F');
      doc.rect(margin + 3, 14.5, 6, 4.5, 'F');
      doc.setFillColor(30, 64, 175);
      doc.rect(margin + 5, 16.5, 2, 2.5, 'F');
    }
  } else {
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(margin, 8, 12, 12, 2, 2, 'F');
    doc.setFillColor(255, 255, 255);
    doc.triangle(margin + 2.5, 14.5, margin + 6, 11.5, margin + 9.5, 14.5, 'F');
    doc.rect(margin + 3, 14.5, 6, 4.5, 'F');
    doc.setFillColor(30, 64, 175);
    doc.rect(margin + 5, 16.5, 2, 2.5, 'F');
  }

  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PAY SLIP', 196, 15, { align: 'right' });

  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(periodLabel, 196, 21, { align: 'right' });
  doc.text(`Generated: ${format(new Date(detail.createdAt), 'MMM d, yyyy')}`, 196, 26, { align: 'right' });

  y = 45;

  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('EMPLOYEE DETAILS', margin, y);
  doc.text('RATES & CALCULATION', 111, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let leftY = y;
  const drawRowLeft = (label: string, val: string, isBold = false) => {
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, leftY);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(val, 95, leftY, { align: 'right' });
    leftY += 5;
  };

  drawRowLeft('Employee Name', employeeName, true);
  if (options?.employeeNumber) drawRowLeft('Employee ID', options.employeeNumber);
  if (options?.jobTitle) drawRowLeft('Job Title', options.jobTitle);
  if (options?.departmentName) drawRowLeft('Department', options.departmentName);
  if (options?.hireDate) drawRowLeft('Hire Date', options.hireDate);
  drawRowLeft('Period', periodLabel);
  drawRowLeft('Attendance', `${detail.attendance.presentDays} / ${detail.attendance.workingDays} days (${detail.attendance.attendanceRate}%)`);
  if (detail.attendance.overtimeHours > 0) drawRowLeft('Overtime', `${detail.attendance.overtimeHours}h`);
  if (detail.attendance.paidLeaveDays > 0) drawRowLeft('Paid leave', `${detail.attendance.paidLeaveDays} days`);
  if (detail.attendance.unpaidLeaveDays > 0) drawRowLeft('Unpaid leave', `${detail.attendance.unpaidLeaveDays} days`);

  let rightY = y;
  const drawRowRight = (label: string, val: string, isBold = false) => {
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(label, 111, rightY);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(val, 196, rightY, { align: 'right' });
    rightY += 5;
  };

  drawRowRight('Monthly base', formatAmount(detail.monthlyBasicSalary), true);
  drawRowRight('Hourly rate', formatAmount(detail.rates.hourlyRate));
  drawRowRight('Daily rate', formatAmount(detail.rates.dailyRate));
  drawRowRight('Days in period', `${detail.rates.eligibleCalendarDays} / ${detail.rates.daysInPeriod}`);

  y = Math.max(leftY, rightY) + 6;

  const earningLines = buildEarningLines(detail);
  const totalEarnings = earningLines.reduce((sum, line) => sum + line.amount, 0);

  const deductionLines = detail.deductions.map((line) => [
    formatPayrollComponentLabel(line.name, line.type, line.rawValue),
    `-${formatAmount(line.amount)}`,
  ]);
  const totalDeductions = detail.deductions.reduce((sum, line) => sum + line.amount, 0);

  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, y, 85, 6, 0.5, 0.5, 'FD');
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('EARNINGS', 17, y + 4.2);

  doc.setFillColor(243, 244, 246);
  doc.roundedRect(111, y, 85, 6, 0.5, 0.5, 'FD');
  doc.text('DEDUCTIONS', 114, y + 4.2);

  y += 6;

  const earningsBody = earningLines.map((line) => [
    formatPayrollComponentLabel(line.name, line.type, line.rawValue),
    `+ ${formatAmount(line.amount)}`,
  ]);
  earningsBody.push(['Total Earnings', formatAmount(totalEarnings)]);

  autoTable(doc, {
    startY: y,
    margin: { left: 14 },
    tableWidth: 85,
    head: [['Description', 'Amount']],
    body: earningsBody,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [229, 231, 235], lineWidth: 0.1 },
    headStyles: { textColor: [107, 114, 128], fontStyle: 'bold', fontSize: 7.5 },
    didParseCell: (data) => {
      if (data.row.index === earningsBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [249, 250, 251];
      }
    }
  });

  const finalYLeft = (doc as any).lastAutoTable?.finalY ?? y + 40;

  const deductionsBody = deductionLines.length > 0 ? [...deductionLines] : [['—', '0']];
  deductionsBody.push(['Total Deductions', formatAmount(totalDeductions)]);

  autoTable(doc, {
    startY: y,
    margin: { left: 111 },
    tableWidth: 85,
    head: [['Description', 'Amount']],
    body: deductionsBody,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2, lineColor: [229, 231, 235], lineWidth: 0.1 },
    headStyles: { textColor: [107, 114, 128], fontStyle: 'bold', fontSize: 7.5 },
    didParseCell: (data) => {
      if (data.row.index === deductionsBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [249, 250, 251];
      }
    }
  });

  const finalYRight = (doc as any).lastAutoTable?.finalY ?? y + 40;
  y = Math.max(finalYLeft, finalYRight) + 8;

  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin, y, 182, 18, 1, 1, 'F');

  doc.setTextColor(147, 197, 253);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Calculation Formula: Net = Gross - Deductions', margin + 6, y + 6.5);
  doc.text(`Salary (gross): ${formatAmount(detail.grossPay)}`, margin + 6, y + 12.5);

  doc.setTextColor(191, 219, 254);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('NET SALARY', 190, y + 6.5, { align: 'right' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(formatAmount(detail.netPay), 190, y + 13.5, { align: 'right' });

  y += 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('This payslip is computer-generated and is confidential.', 105, y, { align: 'center' });

  const safeName = employeeName.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-');
  doc.save(`payslip-${safeName}-${format(new Date(detail.periodEnd), 'yyyy-MM')}.pdf`);
}

