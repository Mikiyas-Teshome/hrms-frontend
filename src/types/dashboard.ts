import type { ElementType } from "react"

export interface MyLeaveRow {
  id: string
  from: string
  to: string
  status: "Approved" | "Pending"
}

export interface OvertimeEntry {
  label: string
  value: string
}

export interface Announcement {
  title: string
  description: string
  date: string
}

export interface Notification {
  title: string
  date: string
}

export interface StatCardProps {
  icon: ElementType
  iconColor: string
  iconBg: string
  label: string
  value: string
}
