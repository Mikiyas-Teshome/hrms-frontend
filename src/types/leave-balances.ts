export interface LeaveBalance {
    id: string;
    name: string;
    avatar?: string;
    leaveType: string;
    year: number;
    allocated: number;
    used: number;
    remaining: number;
    carriedForward: number;
}
