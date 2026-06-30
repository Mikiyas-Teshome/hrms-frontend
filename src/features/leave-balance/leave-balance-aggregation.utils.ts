import type { LeaveBalanceListItem } from './leave-balance.types';

export type LeaveBalanceEmployeeSummary = {
    employeeId: string;
    name: string;
    avatar?: string | null;
    policyCount: number;
    totalAllocated: number;
    totalUsed: number;
    totalRemaining: number;
    totalCarriedForward: number;
};

export function aggregateLeaveBalancesByEmployee(
    items: LeaveBalanceListItem[],
): LeaveBalanceEmployeeSummary[] {
    const summaries = new Map<string, LeaveBalanceEmployeeSummary>();

    for (const item of items) {
        const existing = summaries.get(item.employeeId);

        if (existing) {
            existing.policyCount += 1;
            existing.totalAllocated += item.allocated;
            existing.totalUsed += item.used;
            existing.totalRemaining += item.remaining;
            existing.totalCarriedForward += item.carriedForward;
            continue;
        }

        summaries.set(item.employeeId, {
            employeeId: item.employeeId,
            name: item.name,
            avatar: item.avatar,
            policyCount: 1,
            totalAllocated: item.allocated,
            totalUsed: item.used,
            totalRemaining: item.remaining,
            totalCarriedForward: item.carriedForward,
        });
    }

    return Array.from(summaries.values()).sort((left, right) =>
        left.name.localeCompare(right.name),
    );
}
