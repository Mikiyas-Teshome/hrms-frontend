"use client"

import { useTranslation } from "react-i18next"
import {
  FileClock,
  Timer,
  CalendarClock,
  Banknote,
  MoreVertical,
  CircleCheck,
  Loader,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useProfile } from "@/features/auth/hooks/useAuth"
import { MyLeaveRow, OvertimeEntry, Announcement, Notification, StatCardProps } from "@/types/dashboard"



// ─── Mock data ─────────────────────────────────────────────────────────────────

const myLeaveRows: MyLeaveRow[] = [
  { id: "1", from: "05/03/2026", to: "12/03/2026", status: "Approved" },
  { id: "2", from: "11/03/2026", to: "13/03/2026", status: "Pending" },
]

const overtimeEntries: OvertimeEntry[] = [
  { label: "Approved", value: "3 hrs" },
  { label: "Pending", value: "2 hrs" },
  { label: "Total Hours", value: "7 hrs" },
]

const announcements: Announcement[] = [
  {
    title: "Maintenance downtime",
    description: "Scheduled maintenance in Saturday from 2 AM to 4 AM",
    date: "08 Mar, 2026",
  },
  {
    title: "Holiday notice",
    description: "The office will be closed for EId holidays.",
    date: "07 Mar, 2026",
  },
  {
    title: "Office relocation",
    description: "We are moving to a new office location next week",
    date: "05 Mar, 2026",
  },
]

const notifications: Notification[] = [
  { title: "Your sick leave have been approved", date: "08 Mar, 2026" },
  { title: "Upload your passport to get the your travel allowance", date: "07 Mar, 2026" },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
}: StatCardProps) {
  return (
    <div className="flex flex-col items-start p-4 sm:p-[16px_24px] bg-card border border-border rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex-1 min-w-0 gap-3 h-[140px]">
      {/* Header row */}
      <div className="flex flex-row items-start w-full gap-6">
        {/* Icon badge */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg border shrink-0"
          style={{ background: iconBg, borderColor: iconColor + "80" }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.5} />
        </div>
      </div>
      {/* Value + label */}
      <div className="flex flex-col justify-center gap-1 w-full">
        <span className="text-sm font-normal leading-5 text-muted-foreground line-clamp-1">{label}</span>
        <span className="text-[30px] font-semibold leading-9 text-foreground">{value}</span>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: "Approved" | "Pending" }) {
  const isApproved = status === "Approved"
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold w-fit",
        "bg-card border-border text-foreground"
      )}
    >
      {isApproved ? (
        <CircleCheck className="w-3 h-3 text-[#22C55E]" strokeWidth={1.25} />
      ) : (
        <Loader className="w-3 h-3 text-foreground" strokeWidth={1.25} />
      )}
      <span>{status}</span>
    </div>
  )
}

function MyLeaveRequestsTable() {
  const { t } = useTranslation("dashboard")

  return (
    <div className="flex flex-col flex-1 min-w-0 gap-3">
      {/* Table header */}
      <div className="flex flex-row justify-between items-center pb-6">
        <h2
          className="text-2xl font-semibold leading-8 text-foreground tracking-[-0.4px]"
          style={{ letterSpacing: "-0.4px" }}
        >
          {t("employeeDashboard.myLeaveRequests", "My leave requests")}
        </h2>
        <Button
          variant="ghost"
          className="h-9 px-4 text-sm font-medium text-foreground bg-[#EFF3FA] dark:bg-muted hover:bg-[#dde8f5] dark:hover:bg-muted/80 rounded-lg min-w-[100px]"
        >
          {t("employeeDashboard.requestLeave", "Request leave")}
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden flex-1">
        {/* Header row */}
        <div className="flex flex-row bg-[#F5F5F5] dark:bg-muted/40 border-b border-border">
          <div className="flex flex-1 items-center px-2 h-10">
            <span className="text-sm font-medium text-foreground">
              {t("employeeDashboard.leaveFrom", "Leave from")}
            </span>
          </div>
          <div className="flex flex-1 items-center px-2 h-10">
            <span className="text-sm font-medium text-foreground">
              {t("employeeDashboard.leaveTo", "Leave to")}
            </span>
          </div>
          <div className="flex w-[146px] items-center px-2 h-10 shrink-0">
            <span className="text-sm font-medium text-foreground">
              {t("leaveRequests.table.status", "Status")}
            </span>
          </div>
          <div className="flex w-[79px] items-center justify-center px-2 h-10 shrink-0" />
        </div>

        {/* Rows */}
        {myLeaveRows.map((row) => (
          <div
            key={row.id}
            className="flex flex-row border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
          >
            <div className="flex flex-1 items-center px-2 h-[53px]">
              <span className="text-sm font-normal text-foreground">{row.from}</span>
            </div>
            <div className="flex flex-1 items-center px-2 h-[53px]">
              <span className="text-sm font-normal text-foreground">{row.to}</span>
            </div>
            <div className="flex w-[146px] items-center px-2 h-[53px] shrink-0">
              <StatusBadge status={row.status} />
            </div>
            <div className="flex w-[79px] items-center justify-center px-2 h-[53px] shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <MoreVertical className="w-4 h-4" strokeWidth={1.33} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OvertimeCard() {
  const { t } = useTranslation("dashboard")

  return (
    <div className="flex flex-col w-full border border-border rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden bg-card">
      {/* Card header */}
      <div className="flex flex-row items-center justify-between px-6 py-4 bg-[linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.5)),#F5F5F5] dark:bg-[linear-gradient(0deg,rgba(0,0,0,0.3),rgba(0,0,0,0.3)),#1D1D1D] h-[60px]">
        <h3 className="text-lg font-semibold leading-7 text-foreground tracking-[-0.4px]">
          {t("employeeDashboard.overtime", "Overtime")}
        </h3>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-6">
        {overtimeEntries.map((entry, i) => (
          <div key={i} className="flex flex-row justify-between items-center gap-8">
            <span className="text-sm font-normal text-muted-foreground">{entry.label}</span>
            <span className="text-sm font-medium text-foreground">{entry.value}</span>
          </div>
        ))}

        {/* Separator */}
        <div className="my-2 h-px bg-border w-full" />

        {/* View all button */}
        <Button
          variant="ghost"
          className="w-full h-9 text-sm font-medium text-primary underline hover:no-underline rounded-lg px-4 justify-center"
        >
          {t("employeeDashboard.viewAll", "View all overtime")}
        </Button>
      </div>
    </div>
  )
}

function AnnouncementsCard() {
  const { t } = useTranslation("dashboard")

  return (
    <div className="flex flex-col flex-1 min-w-0 p-6 gap-6 bg-card border border-border rounded-[10px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h3 className="text-base font-medium leading-6 text-foreground">
        {t("recentActivity.announcements", "Announcements")}
      </h3>

      <div className="flex flex-col gap-1">
        {announcements.map((item, i) => (
          <div
            key={i}
            className="flex flex-row justify-between items-center px-3 py-4 bg-[rgba(24,40,156,0.02)] dark:bg-[rgba(40,101,227,0.04)] border border-[rgba(40,101,227,0.12)] rounded-lg gap-3"
          >
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="text-sm font-medium leading-none text-foreground line-clamp-1">{item.title}</span>
              <span className="text-xs font-normal leading-4 text-muted-foreground line-clamp-1">
                {item.description}
              </span>
            </div>
            <span className="text-xs font-normal text-muted-foreground shrink-0 whitespace-nowrap">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotificationsCard() {
  const { t } = useTranslation("dashboard")

  return (
    <div className="flex flex-col flex-1 min-w-0 p-6 gap-6 bg-card border border-border rounded-[10px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h3 className="text-base font-medium leading-6 text-foreground">
        {t("recentActivity.notifications", "Notification")}
      </h3>

      <div className="flex flex-col gap-1">
        {notifications.map((item, i) => (
          <div
            key={i}
            className="flex flex-row justify-between items-center px-3 py-4 bg-[rgba(24,40,156,0.02)] dark:bg-[rgba(40,101,227,0.04)] border border-[rgba(40,101,227,0.12)] rounded-lg gap-3"
          >
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="text-sm font-medium leading-none text-foreground line-clamp-1">{item.title}</span>
            </div>
            <span className="text-xs font-normal text-muted-foreground shrink-0 whitespace-nowrap">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function EmployeeDashboardView() {
  const { t, i18n } = useTranslation("dashboard")
  const isRTL = i18n.language === "ar"
  const { data: user } = useProfile()

  const firstName = user?.firstName || (isRTL ? "راشيل" : "Rachel")

  const stats = [
    {
      icon: FileClock,
      iconColor: "#D97706",
      iconBg: "rgba(217,119,6,0.05)",
      label: t("employeeDashboard.pendingLeaveRequests", "Pending Leave Requests"),
      value: "5",
    },
    {
      icon: Timer,
      iconColor: "#04A4C4",
      iconBg: "rgba(4,164,196,0.05)",
      label: t("employeeDashboard.totalTime", "Total Time"),
      value: "45",
    },
    {
      icon: CalendarClock,
      iconColor: "#22C55E",
      iconBg: "rgba(34,197,94,0.05)",
      label: t("employeeDashboard.attendanceRate", "Attendance Rate"),
      value: "92%",
    },
    {
      icon: Banknote,
      iconColor: "#8A38F5",
      iconBg: "rgba(138,56,245,0.05)",
      label: t("employeeDashboard.netSalary", "Net Salary"),
      value: "$4,200",
    },
  ]

  return (
    <div className="flex flex-col w-full gap-6 lg:gap-10">
      {/* ── Top section: welcome + stat cards ── */}
      <div className="flex flex-col gap-6 w-full">
        {/* Welcome heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-foreground">
            {t("header.welcome", { name: firstName })}
          </h1>
          <p className="text-base font-normal leading-6 text-muted-foreground">
            {t("employeeDashboard.subtitle", "Here's a quick overview of your work and requests.")}
          </p>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 w-full">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>

      {/* ── Middle section: leave table + overtime ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
        <div className="lg:col-span-3">
          <MyLeaveRequestsTable />
        </div>
        <div className="lg:col-span-1">
          <OvertimeCard />
        </div>
      </div>

      {/* ── Bottom section: announcements + notifications ── */}
      <div className="flex flex-col md:flex-row gap-6 w-full pb-8">
        <AnnouncementsCard />
        <NotificationsCard />
      </div>
    </div>
  )
}
