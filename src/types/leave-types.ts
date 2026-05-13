export interface LeaveType {
    id: string;
    name: string;
    maxDaysPerYear: number;
    condition: 'Paid' | 'Unpaid';
    status: 'Active' | 'Inactive';
    code?: string;
    carryForwardAllowed?: boolean;
    companyOuId?: string;
    description?: string;
}
