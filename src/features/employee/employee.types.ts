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
    activeEmployeeContractId?: string | null;
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

export interface EmployeeDirectoryEntry {
    id: string;
    userId?: string | null;
    firstName: string;
    lastName: string;
    departmentId?: string | null;
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

export interface UpdateMyEmployeeProfileInput {
    address?: string;
    city?: string;
    country?: string;
    dateOfBirth?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
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
    middleName?: string;
    nationalId?: string;
    nationality?: string;
    passportExpiry?: string;
    passportNumber?: string;
    personalEmail?: string;
    phoneNumber?: string;
    postalCode?: string;
    state?: string;
    visaExpiry?: string;
    visaNumber?: string;
    workPermitExpiry?: string;
    workPermitNumber?: string;
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
    ouId?: string;
    limit?: number;
    page?: number;
    status?: EmployeeStatus;
}

export type EmployeeSortBy =
    | 'CREATED_AT'
    | 'FIRST_NAME'
    | 'LAST_NAME'
    | 'EMAIL'
    | 'EMPLOYEE_NUMBER'
    | 'JOB_TITLE'
    | 'EMPLOYMENT_TYPE'
    | 'DEPARTMENT_ID'
    | 'STATUS'
    | 'HIRE_DATE';

export type EmployeeSortOrder = 'ASC' | 'DESC';

export interface EmployeeListFilterInput {
    groupOuId?: string;
    companyOuId?: string;
    divisionOuId?: string;
    subDivisionOuId?: string;
    departmentOuId?: string;
    status?: EmployeeStatus;
    contractType?: string;
    search?: string;
    sortBy?: EmployeeSortBy;
    sortOrder?: EmployeeSortOrder;
}

export interface PaginationInput {
    page?: number;
    size?: number;
}

export interface PaginatedMetaData {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    timestamp?: string;
}

export interface PaginatedEmployeesResponse {
    data: EmployeeResponse[];
    metaData: PaginatedMetaData;
}

export interface BaseInvitationEmployeeInput {
    email: string;
    firstName?: string;
    lastName?: string;
    gccId?: string;
    ouId?: string;
    roleId?: string;
    role?: string;
    contractId?: string;
    employmentType?: string;
    jobTitle?: string;
    salary?: number;
}

export interface CreateInvitationInput extends BaseInvitationEmployeeInput {
    password?: string;
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

export interface BulkInviteEmployeesInput {
    employees: CreateInvitationInput[];
}

export interface BulkInvitationError {
    email: string;
    reason: string;
    attempts?: number;
    rowIndex?: number;
}

export interface BulkInvitationResponse {
    successfulInvitations: BaseInvitationEmployeeInput[];
    failedInvitations: BulkInvitationError[];
    successfulCount: number;
    failedCount: number;
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

export const EMPLOYMENT_TYPE_OPTIONS = [
    { label: 'Full-time', value: 'full_time' },
    { label: 'Part-time', value: 'part_time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Intern', value: 'intern' },
    { label: 'Consultant', value: 'consultant' },
];

export const CONTRACT_TYPE_OPTIONS = [
    { label: 'Permanent', value: 'permanent' },
    { label: 'Fixed term', value: 'fixed_term' },
    { label: 'Probation', value: 'probation' },
    { label: 'Internship', value: 'internship' },
    { label: 'Consultant', value: 'consultant' },
    { label: 'Part time', value: 'part_time' },
];
