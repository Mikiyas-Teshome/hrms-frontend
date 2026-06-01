export enum DocumentComplianceStatus {
    COMPLIANT = 'COMPLIANT',
    EXPIRED = 'EXPIRED',
    NEAR_EXPIRE = 'NEAR_EXPIRE',
    MISSING = 'MISSING',
}

export enum DocumentApprovalState {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface EmployeeDocumentRow {
    id: string;
    ownerId: string;
    ownerName: string;
    categoryId: string;
    categoryName: string;
    documentName: string;
    expiryDate?: string | null;
    compliance: DocumentComplianceStatus;
    approvalState?: DocumentApprovalState;
    uploadedBy: string;
}

export interface EmployeeDocumentPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface EmployeeDocumentListResponse {
    data: EmployeeDocumentRow[];
    pagination: EmployeeDocumentPagination;
}

export interface UpdateEmployeeDocumentInput {
    description?: string;
    categoryId?: string;
    ownerId?: string;
    expiryDate?: string;
    status?: DocumentComplianceStatus;
    approvalState?: DocumentApprovalState;
}

export interface EmployeeDocumentStats {
    compliant: number;
    expired: number;
    missing: number;
    nearExpire: number;
}

export enum DocumentCategoryAppliedTo {
    ALL_EMPLOYEES = 'ALL_EMPLOYEES',
    DEPARTMENT_SPECIFIC = 'DEPARTMENT_SPECIFIC',
    FOREIGN_EMPLOYEE = 'FOREIGN_EMPLOYEE',
}

export interface DocumentCategoryStats {
    total: number;
    required: number;
    expiryRequired: number;
    active: number;
}

export interface DocumentCategoryPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface DocumentCategoryListResponse {
    data: DocumentCategory[];
    pagination: DocumentCategoryPagination;
}

export interface DocumentCategory {
    id: string;
    name: string;
    type?: string | null;
    status: string;
    required: boolean;
    expiryRequired: boolean;
    description?: string | null;
    expiryReminderDays?: number | null;
    appliedTo: DocumentCategoryAppliedTo;
    requireApproval: boolean;
    affectsCompliance: boolean;
    criticalDocument: boolean;
    allowedFileTypes: string[];
    maxFileSizeMb?: number | null;
}

export interface CreateDocumentCategoryInput {
    name: string;
    type?: string | null;
    description?: string | null;
    required?: boolean;
    expiryRequired?: boolean;
    expiryReminderDays?: number | null;
    appliedTo?: DocumentCategoryAppliedTo;
    requireApproval?: boolean;
    affectsCompliance?: boolean;
    criticalDocument?: boolean;
    allowedFileTypes?: string[];
    maxFileSizeMb?: number | null;
    status?: string;
}

export interface DocumentCategoryFilterInput {
    search?: string;
    status?: string;
    appliedTo?: DocumentCategoryAppliedTo;
    required?: boolean;
    expiryRequired?: boolean;
}

export interface EmployeeDocumentFilterInput {
    search?: string;
    ownerId?: string;
    categoryId?: string;
    status?: DocumentComplianceStatus;
    approvalState?: DocumentApprovalState;
}

export interface ComplianceDashboardStats {
    fullyCompliantEmployeesCount: number;
    nonCompliantEmployeesCount: number;
    expiringSoonDocumentsCount: number;
    totalCompliancePercentage: number;
}

export interface ComplianceAlert {
    id: string;
    message: string;
    type: string;
    severity: string;
    date: string;
    affectedCount: number;
    documentCategoryName?: string;
}

export interface EmployeeComplianceRow {
    employeeId: string;
    employeeName: string;
    department: string;
    missingDocuments: string[];
    expiringDocuments: string[];
    complianceStatus: string;
    lastReminderDate?: string | null;
}

export interface EmployeeCompliancePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface EmployeeComplianceListResponse {
    data: EmployeeComplianceRow[];
    pagination: EmployeeCompliancePagination;
}
