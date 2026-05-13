export interface LeavePolicy {
    id: string;
    policyName: string;
    leaveType: string;
    maxDaysPerYear: number;
    accrualMethod: string;
    carryForward: string;
    approval: 'Required' | 'Not-required';
    status: 'Active' | 'Inactive';
}
