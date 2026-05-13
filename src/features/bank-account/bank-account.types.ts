export interface BankAccount {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName?: string | null;
    employeeId: string;
    iban?: string | null;
    isPrimary: boolean;
    routingNumber?: string | null;
    swiftCode?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBankAccountInput {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName?: string;
    employeeId: string;
    iban?: string;
    isPrimary?: boolean;
    routingNumber?: string;
    swiftCode?: string;
}

export interface UpdateBankAccountInput {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
    iban?: string;
    isPrimary?: boolean;
    routingNumber?: string;
    swiftCode?: string;
}
