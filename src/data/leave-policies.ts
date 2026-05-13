import { LeavePolicy } from "@/types/leave-policies";
import { Loader2, CircleCheck, Users } from "lucide-react";

export const mockLeavePoliciesData: LeavePolicy[] = [
    {
        id: "1",
        policyName: "Annual leave",
        leaveType: "Annual leave",
        maxDaysPerYear: 21,
        accrualMethod: "Yearly allocation",
        carryForward: "10 days",
        approval: "Required",
        status: "Active"
    },
    {
        id: "2",
        policyName: "Sick leave",
        leaveType: "Sick leave",
        maxDaysPerYear: 10,
        accrualMethod: "Yearly allocation",
        carryForward: "2 days",
        approval: "Not-required",
        status: "Active"
    },
    {
        id: "3",
        policyName: "Maternity leave",
        leaveType: "Maternity leave",
        maxDaysPerYear: 90,
        accrualMethod: "Yearly allocation",
        carryForward: "0",
        approval: "Required",
        status: "Active"
    },
    {
        id: "4",
        policyName: "Paternity leave",
        leaveType: "Paternity leave",
        maxDaysPerYear: 15,
        accrualMethod: "Yearly allocation",
        carryForward: "0",
        approval: "Required",
        status: "Active"
    },
    {
        id: "5",
        policyName: "Emergency leave",
        leaveType: "Emergency leave",
        maxDaysPerYear: 5,
        accrualMethod: "Yearly allocation",
        carryForward: "0",
        approval: "Not-required",
        status: "Active"
    },
    {
        id: "6",
        policyName: "Bereavement leave",
        leaveType: "Bereavement leave",
        maxDaysPerYear: 7,
        accrualMethod: "Yearly allocation",
        carryForward: "0",
        approval: "Not-required",
        status: "Active"
    },
    {
        id: "7",
        policyName: "Study leave",
        leaveType: "Study leave",
        maxDaysPerYear: 10,
        accrualMethod: "Yearly allocation",
        carryForward: "5 days",
        approval: "Required",
        status: "Active"
    },
    {
        id: "8",
        policyName: "Compensatory leave",
        leaveType: "Compensatory leave",
        maxDaysPerYear: 12,
        accrualMethod: "Monthly accrual",
        carryForward: "3 days",
        approval: "Required",
        status: "Active"
    },
    {
        id: "9",
        policyName: "Personal leave",
        leaveType: "Personal leave",
        maxDaysPerYear: 5,
        accrualMethod: "Yearly allocation",
        carryForward: "0",
        approval: "Required",
        status: "Inactive"
    },
    {
        id: "10",
        policyName: "Marriage leave",
        leaveType: "Marriage leave",
        maxDaysPerYear: 7,
        accrualMethod: "Yearly allocation",
        carryForward: "0",
        approval: "Required",
        status: "Active"
    }
];

export const leavePoliciesStats = [
    {
        title: "Number of polices",
        value: 10,
        icon: Loader2,
        iconColor: "#2865E3",
        iconBgColor: "rgba(40, 101, 227, 0.1)",
        borderColor: "rgba(40, 101, 227, 0.5)"
    },
    {
        title: "Active policies",
        value: 8,
        icon: CircleCheck,
        iconColor: "#22C55E",
        iconBgColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgba(34, 197, 94, 0.5)"
    },
    {
        title: "Approval required",
        value: 6,
        icon: Users,
        iconColor: "#2865E3",
        iconBgColor: "rgba(40, 101, 227, 0.1)",
        borderColor: "rgba(40, 101, 227, 0.5)"
    },
    {
        title: "Approval not-required",
        value: 4,
        icon: Users,
        iconColor: "#2865E3",
        iconBgColor: "rgba(40, 101, 227, 0.1)",
        borderColor: "rgba(40, 101, 227, 0.5)"
    }
];
