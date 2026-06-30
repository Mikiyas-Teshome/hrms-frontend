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

export interface EmployeeDocumentPaginatedMetaData {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    timestamp?: string;
}

export interface EmployeeDocumentListResponse {
    data: EmployeeDocumentRow[];
    metaData: EmployeeDocumentPaginatedMetaData;
}

export enum EmployeeDocumentSortBy {
    OWNER_ID = 'OWNER_ID',
    CATEGORY_NAME = 'CATEGORY_NAME',
    DOCUMENT_NAME = 'DOCUMENT_NAME',
    EXPIRY_DATE = 'EXPIRY_DATE',
    APPROVAL_STATE = 'APPROVAL_STATE',
    UPLOADED_BY = 'UPLOADED_BY',
    CREATED_AT = 'CREATED_AT',
}

export enum EmployeeDocumentSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export interface UpdateEmployeeDocumentInput {
    description?: string;
    categoryId?: string;
    ownerId?: string;
    expiryDate?: string;
    status?: DocumentComplianceStatus;
    approvalState?: DocumentApprovalState;
    rejectionReason?: string;
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

export interface DocumentCategoryPaginationInput {
    page?: number;
    size?: number;
}

export interface DocumentCategoryPaginatedMetaData {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    timestamp?: string;
}

export interface DocumentCategoryListResponse {
    data: DocumentCategory[];
    metaData: DocumentCategoryPaginatedMetaData;
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
    organizationUnitIds?: string[];
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
    organizationUnitIds?: string[];
}

export enum DocumentCategorySortBy {
    NAME = 'NAME',
    TYPE = 'TYPE',
    REQUIRED = 'REQUIRED',
    EXPIRY_REQUIRED = 'EXPIRY_REQUIRED',
    APPLIED_TO = 'APPLIED_TO',
    STATUS = 'STATUS',
}

export enum DocumentCategorySortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export interface DocumentCategoryFilterInput {
    search?: string;
    status?: string;
    appliedTo?: DocumentCategoryAppliedTo;
    required?: boolean;
    expiryRequired?: boolean;
    sortBy?: DocumentCategorySortBy;
    sortOrder?: DocumentCategorySortOrder;
}

export interface EmployeeDocumentFilterInput {
    search?: string;
    ownerId?: string;
    categoryId?: string;
    status?: DocumentComplianceStatus;
    approvalState?: DocumentApprovalState;
    sortBy?: EmployeeDocumentSortBy;
    sortOrder?: EmployeeDocumentSortOrder;
}

export interface EmployeeDocumentOwnerRow {
    ownerId: string;
    ownerName: string;
    documentCount: number;
    overallCompliance: DocumentComplianceStatus;
    pendingApprovalCount: number;
    nearestExpiryDate?: string | null;
}

export interface EmployeeDocumentOwnerListResponse {
    data: EmployeeDocumentOwnerRow[];
    metaData: EmployeeDocumentPaginatedMetaData;
}

export enum EmployeeDocumentOwnerSortBy {
    OWNER_NAME = 'OWNER_NAME',
    DOCUMENT_COUNT = 'DOCUMENT_COUNT',
    OVERALL_COMPLIANCE = 'OVERALL_COMPLIANCE',
    PENDING_APPROVAL_COUNT = 'PENDING_APPROVAL_COUNT',
    NEAREST_EXPIRY = 'NEAREST_EXPIRY',
}

export interface EmployeeDocumentOwnerFilterInput {
    search?: string;
    ownerId?: string;
    categoryId?: string;
    status?: DocumentComplianceStatus;
    approvalState?: DocumentApprovalState;
    sortBy?: EmployeeDocumentOwnerSortBy;
    sortOrder?: EmployeeDocumentSortOrder;
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

export enum EmployeeComplianceSortBy {
    EMPLOYEE_NAME = 'EMPLOYEE_NAME',
    DEPARTMENT = 'DEPARTMENT',
    MISSING_DOCUMENT = 'MISSING_DOCUMENT',
    EXPIRING_DOCUMENT = 'EXPIRING_DOCUMENT',
    COMPLIANCE_STATUS = 'COMPLIANCE_STATUS',
    LAST_REMINDER = 'LAST_REMINDER',
}

export interface EmployeeComplianceFilterInput {
    search?: string;
    complianceStatus?: string;
    department?: string;
    missingCategoryName?: string;
    hasExpiringDocuments?: boolean;
    noUploadedDocuments?: boolean;
    sortBy?: EmployeeComplianceSortBy;
    sortOrder?: EmployeeDocumentSortOrder;
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

export interface EmployeeComplianceListResponse {
    data: EmployeeComplianceRow[];
    metaData: EmployeeDocumentPaginatedMetaData;
}
