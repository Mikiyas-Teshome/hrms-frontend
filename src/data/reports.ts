import { Users, UserPlus, CalendarCheck, FileCheck, CircleDollarSign, Wallet, MinusCircle, Clock } from "lucide-react";

export const hrReportStats = [
  {
    title: "Total employee",
    value: "23",
    icon: Users,
    color: "#2865E3",
    borderColor: "rgba(40, 101, 227, 0.5)",
    bgColor: "rgba(40, 101, 227, 0.05)",
  },
  {
    title: "New hires",
    value: "2",
    icon: UserPlus,
    color: "#D97706",
    borderColor: "rgba(217, 119, 6, 0.5)",
    bgColor: "rgba(217, 119, 6, 0.05)",
  },
  {
    title: "Attendance rate",
    value: "88%",
    icon: CalendarCheck,
    color: "#D97706",
    borderColor: "rgba(217, 119, 6, 0.5)",
    bgColor: "rgba(217, 119, 6, 0.05)",
  },
  {
    title: "Compliance rate",
    value: "82%",
    icon: FileCheck,
    color: "#22C55E",
    borderColor: "rgba(34, 197, 94, 0.5)",
    bgColor: "rgba(34, 197, 94, 0.05)",
  },
];

export const headcountTrendData = [
  { month: "Jan", headcount: 160 },
  { month: "Feb", headcount: 310 },
  { month: "Mar", headcount: 210 },
  { month: "Apr", headcount: 120 },
  { month: "May", headcount: 225 },
  { month: "Jun", headcount: 190 },
];

export const attendanceOverviewData = [
  { month: "Jan", present: 220, absent: 300, onLeave: 120 },
  { month: "Feb", present: 210, absent: 310, onLeave: 110 },
  { month: "Mar", present: 210, absent: 300, onLeave: 120 },
  { month: "Apr", present: 210, absent: 300, onLeave: 125 },
  { month: "May", present: 210, absent: 300, onLeave: 115 },
];

export const mockHRReportData = [
  { id: "1", name: "Miracle Torff", department: "Management", attendance: "99%", leaveTokens: "Miracletorff@someone.com", status: "Active" },
  { id: "2", name: "Cooper George", department: "Marketing", attendance: "100%", leaveTokens: "Coopergeorge@someone.com", status: "Terminated" },
  { id: "3", name: "Nolan Dias", department: "Sales", attendance: "94%", leaveTokens: "Nolandias@someone.com", status: "Active" },
  { id: "4", name: "Ahmad Press", department: "Management", attendance: "100%", leaveTokens: "Ahmadpress@someone.com", status: "Active" },
  { id: "5", name: "Craig Aminoff", department: "Marketing", attendance: "100%", leaveTokens: "Craigaminoff@someone.com", status: "Active" },
];

export const payrollReportStats = [
  {
    title: "Total Payroll Cost",
    value: "$95,000",
    icon: CircleDollarSign,
    color: "#2865E3",
    borderColor: "rgba(40, 101, 227, 0.5)",
    bgColor: "rgba(40, 101, 227, 0.05)",
  },
  {
    title: "Net pay",
    value: "$70,000",
    icon: Wallet,
    color: "#2865E3",
    borderColor: "rgba(40, 101, 227, 0.5)",
    bgColor: "rgba(40, 101, 227, 0.05)",
  },
  {
    title: "Total Deductions",
    value: "$25,453",
    icon: MinusCircle,
    color: "#D97706",
    borderColor: "rgba(217, 119, 6, 0.5)",
    bgColor: "rgba(217, 119, 6, 0.05)",
  },
  {
    title: "Overtime Cost",
    value: "$6,790",
    icon: Clock,
    color: "#22C55E",
    borderColor: "rgba(34, 197, 94, 0.5)",
    bgColor: "rgba(34, 197, 94, 0.05)",
  },
];

export const payrollTrendData = [
  { month: "Jan", cost: 160 },
  { month: "Feb", cost: 310 },
  { month: "Mar", cost: 210 },
  { month: "Apr", cost: 120 },
  { month: "May", cost: 225 },
  { month: "Jun", cost: 190 },
];

export const deductionsBreakdownData = [
  { name: "Tax", value: 400, color: "#EA580C" },
  { name: "Insurance", value: 300, color: "#0D9488" },
  { name: "Penalties", value: 300, color: "#0F172A" },
  { name: "Unpaid leave", value: 200, color: "#F59E0B" },
];

export const mockPayrollReportData = [
  { id: "1", employee: "Miracle Torff", salary: "$2,500", allowance: "$200", deductions: "$100", netPay: "$2,600", status: "Active" },
  { id: "2", employee: "Cooper George", salary: "$2,000", allowance: "$150", deductions: "$50", netPay: "$2,100", status: "Terminated" },
  { id: "3", employee: "Nolan Dias", salary: "$4,000", allowance: "$50", deductions: "$200", netPay: "$4,150", status: "Active" },
  { id: "4", employee: "Ahmad Press", salary: "$2,000", allowance: "$400", deductions: "$200", netPay: "$2,200", status: "Active" },
  { id: "5", employee: "Craig Aminoff", salary: "$2,300", allowance: "$200", deductions: "$150", netPay: "$2,350", status: "Active" },
];
