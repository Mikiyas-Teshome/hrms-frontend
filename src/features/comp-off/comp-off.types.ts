export interface CompOffBankEntry {
    id: string;
    earnedFromDate: string;
    creditDays: number;
    expiryDate: string;
    isConsumed: boolean;
    isExpired: boolean;
    consumedDate?: string;
}

export interface CompOffBalance {
    totalDays: number;
    entries: CompOffBankEntry[];
}

export interface CompOffPolicy {
    id: string;
    companyId: string;
    creditRatioMinutes: number;
    creditMultiplier: number;
    expiryDays: number;
    minOvertimeMinutes: number;
    allowHoliday: boolean;
    allowWeekend: boolean;
    allowDutyShift: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpsertCompOffPolicyInput {
    creditRatioMinutes?: number;
    creditMultiplier?: number;
    expiryDays?: number;
    minOvertimeMinutes?: number;
    allowHoliday?: boolean;
    allowWeekend?: boolean;
    allowDutyShift?: boolean;
}
