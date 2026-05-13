export enum EmployeeStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ON_LEAVE = 'on_leave',
    TERMINATED = 'terminated',
    SUSPENDED = 'suspended',
    TRANSFERRED = 'transferred',
    ARCHIVED = 'archived',
    INVITED = 'invited'
}

export interface EmployeeResponse {
    id: string;
    employeeNumber: string;
    userId?: string | null;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    email: string;
    personalEmail?: string | null;
    businessEmail?: string | null;
    phoneNumber?: string | null;
    homePhone?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    nationality?: string | null;
    nationalId?: string | null;
    passportNumber?: string | null;
    passportExpiry?: string | null;
    visaNumber?: string | null;
    visaExpiry?: string | null;
    workPermitNumber?: string | null;
    workPermitExpiry?: string | null;
    jobTitle: string;
    departmentId?: string | null;
    managerId?: string | null;
    employmentType?: string | null;
    hireDate?: string | null;
    terminationDate?: string | null;
    transferDate?: string | null;
    salary?: number | null;
    currency?: string | null;
    status: EmployeeStatus;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
    homeAddress?: string | null;
    homeCity?: string | null;
    homeState?: string | null;
    homeCountry?: string | null;
    homePostalCode?: string | null;
    // emergencyContactName?: string | null;
    // emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
    previousCompanyId?: string | null;
    previousEmployeeId?: string | null;
    orgUnit?: {
        orgUnitId: string;
        orgUnitName: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEmployeeInput {
    firstName: string;
    lastName: string;
    middleName?: string;
    email: string;
    personalEmail?: string;
    businessEmail?: string;
    phoneNumber?: string;
    jobTitle: string;
    departmentId?: string;
    managerId?: string;
    employmentType?: string;
    hireDate?: string;
    salary?: number;
    currency?: string;
    userId: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

export interface UpdateEmployeeInput {
    address?: string;
    businessEmail?: string;
    city?: string;
    country?: string;
    currency?: string;
    dateOfBirth?: string;
    departmentId?: string;
    email?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    employmentType?: string;
    firstName?: string;
    gender?: string;
    homeAddress?: string;
    homeCity?: string;
    homeCountry?: string;
    homePhone?: string;
    homePostalCode?: string;
    homeState?: string;
    jobTitle?: string;
    lastName?: string;
    managerId?: string;
    middleName?: string;
    nationalId?: string;
    nationality?: string;
    passportExpiry?: string;
    passportNumber?: string;
    personalEmail?: string;
    phoneNumber?: string;
    postalCode?: string;
    salary?: number;
    state?: string;
    visaExpiry?: string;
    visaNumber?: string;
    workPermitExpiry?: string;
    workPermitNumber?: string;
}

export interface TransferEmployeeInput {
    employeeId: string;
    targetCompanyId: string;
    targetDepartmentId: string;
}

export interface EmployeesFilters {
    departmentId?: string;
    limit?: number;
    page?: number;
    status?: EmployeeStatus;
}

export interface CreateInvitationInput {
    email: string;
    firstName?: string;
    gccId?: string;
    lastName?: string;
    ouId?: string;
    password?: string;
    role?: string;
    roleId?: string;
}

export interface InvitationResponse {
    id: string;
    email: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    companyId: string;
    status: string;
    role?: string;
}
export interface EmployeeTransferHistory {
    id: string;
    employeeId: string;
    companyId: string;
    fromDepartmentId: string;
    toDepartmentId: string;
    fromManagerId?: string | null;
    toManagerId?: string | null;
    transferDate: string;
    reason?: string | null;
    processedBy: string;
    createdAt: string;
}

export interface RecordTransferInput {
    companyId: string;
    employeeId: string;
    fromDepartmentId: string;
    toDepartmentId: string;
    fromManagerId?: string | null;
    toManagerId?: string | null;
    processedBy: string;
    reason?: string | null;
}

export interface UpdateEmployeeStatusInput {
    status: EmployeeStatus;
}
