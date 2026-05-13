import { 
  Users, 
  FileClock, 
  CalendarDays, 
  BriefcaseBusiness 
} from "lucide-react"

export const getDashboardStats = (t: (key: string) => string) => [
  {
    id: 0,
    slug: "total_employees",
    title: t("stats.totalEmployees"),
    value: "0",
    icon: Users,
    containerClass: "bg-[rgba(217,119,6,0.05)] border-orange-200/50",
    iconClass: "text-[#D97706]",
    trend: "up" as const,
    trendValue: undefined,
  },
  {
    id: 1,
    slug: "pending_approve",
    title: t("stats.pendingApprove"),
    value: "0",
    icon: FileClock,
    containerClass: "bg-[rgba(138,56,245,0.05)] border-purple-200/50",
    iconClass: "text-[#8A38F5]",
    trend: "down" as const,
    trendValue: undefined,
  },
  {
    id: 2,
    slug: "upcoming_payroll",
    title: t("stats.upcomingPayroll"),
    value: "0",
    icon: CalendarDays,
    containerClass: "bg-[rgba(4,164,196,0.05)] border-cyan-200/50",
    iconClass: "text-[#04A4C4]",
    subText: undefined,
  },
  {
    id: 3,
    slug: "active_jobs",
    title: t("stats.activeJobs"),
    value: "0",
    icon: BriefcaseBusiness,
    containerClass: "bg-[rgba(42,72,224,0.05)] border-blue-200/50",
    iconClass: "text-[#2A48E0]",
    trend: "up" as const,
    trendValue: undefined,
  },
]
