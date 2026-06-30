export const GET_EMPLOYEE_DOCUMENT_OWNERS_QUERY = `
  query EmployeeDocumentOwners($filter: EmployeeDocumentOwnerFilterInput, $pagination: PaginationInput) {
    employeeDocumentOwners(filter: $filter, pagination: $pagination) {
      data {
        ownerId
        ownerName
        documentCount
        overallCompliance
        pendingApprovalCount
        nearestExpiryDate
      }
      metaData {
        page
        size
        total
        totalPages
        hasNext
        hasPrevious
        timestamp
      }
    }
  }
`;

export const GET_EMPLOYEE_DOCUMENTS_QUERY = `
  query EmployeeDocuments($filter: EmployeeDocumentFilterInput, $pagination: PaginationInput) {
    employeeDocuments(filter: $filter, pagination: $pagination) {
      data {
        id
        ownerId
        ownerName
        categoryId
        categoryName
        documentName
        expiryDate
        compliance
        approvalState
        uploadedBy
      }
      metaData {
        page
        size
        total
        totalPages
        hasNext
        hasPrevious
        timestamp
      }
    }
  }
`;

export const GET_EMPLOYEE_DOCUMENT_STATS_QUERY = `
  query EmployeeDocumentStats {
    employeeDocumentStats {
      compliant
      expired
      missing
      nearExpire
    }
  }
`;

export const GET_DOCUMENT_CATEGORIES_QUERY = `
  query DocumentCategories {
    documentCategories {
      id
      name
      type
      status
      required
      expiryRequired
      description
      expiryReminderDays
      appliedTo
      requireApproval
      affectsCompliance
      criticalDocument
      allowedFileTypes
      maxFileSizeMb
      organizationUnitIds
    }
  }
`;

export const GET_DOCUMENT_CATEGORIES_PAGED_QUERY = `
  query DocumentCategoriesPaginated($filter: DocumentCategoryFilterInput, $pagination: PaginationInput) {
    documentCategoriesPaginated(filter: $filter, pagination: $pagination) {
      data {
        id
        name
        type
        status
        required
        expiryRequired
        description
        expiryReminderDays
        appliedTo
        requireApproval
        affectsCompliance
        criticalDocument
        allowedFileTypes
        maxFileSizeMb
        organizationUnitIds
      }
      metaData {
        page
        size
        total
        totalPages
        hasNext
        hasPrevious
        timestamp
      }
    }
  }
`;

export const GET_DOCUMENT_CATEGORY_STATUS_QUERY = `
  query DocumentCategoryStatus {
    documentCategoryStatus {
      total
      required
      expiryRequired
      active
    }
  }
`;

export const CREATE_DOCUMENT_CATEGORY_MUTATION = `
  mutation CreateDocumentCategory($input: CreateDocumentCategoryInput!) {
    createDocumentCategory(input: $input) {
      id
      name
      type
      status
      required
      expiryRequired
      description
      expiryReminderDays
      appliedTo
      requireApproval
      affectsCompliance
      criticalDocument
      allowedFileTypes
      maxFileSizeMb
      organizationUnitIds
    }
  }
`;

export const UPDATE_DOCUMENT_CATEGORY_MUTATION = `
  mutation UpdateDocumentCategory($id: ID!, $input: UpdateDocumentCategoryInput!) {
    updateDocumentCategory(id: $id, input: $input) {
      id
      name
      type
      status
      required
      expiryRequired
      description
      expiryReminderDays
      appliedTo
      requireApproval
      affectsCompliance
      criticalDocument
      allowedFileTypes
      maxFileSizeMb
      organizationUnitIds
    }
  }
`;

export const DELETE_DOCUMENT_CATEGORY_MUTATION = `
  mutation DeleteDocumentCategory($id: ID!) {
    deleteDocumentCategory(id: $id)
  }
`;

export const GET_DOCUMENT_DOWNLOAD_URL_QUERY = `
  query DocumentDownloadUrl($id: String!) {
    documentDownloadUrl(id: $id)
  }
`;

export const DELETE_DOCUMENT_MUTATION = `
  mutation DeleteDocument($id: String!) {
    deleteDocument(id: $id)
  }
`;

export const UPDATE_EMPLOYEE_DOCUMENT_MUTATION = `
  mutation UpdateEmployeeDocument($id: String!, $input: UpdateEmployeeDocumentInput!) {
    updateEmployeeDocument(id: $id, input: $input) {
      id
      expiryDate
      complianceStatus
      approvalState
    }
  }
`;

export const GET_COMPLIANCE_DASHBOARD_STATS_QUERY = `
  query GetComplianceDashboardStats {
    complianceDashboardStats {
      fullyCompliantEmployeesCount
      nonCompliantEmployeesCount
      expiringSoonDocumentsCount
      totalCompliancePercentage
    }
  }
`;

export const GET_COMPLIANCE_ALERTS_QUERY = `
  query GetComplianceAlerts {
    complianceAlerts {
      id
      message
      type
      severity
      date
      affectedCount
      documentCategoryName
    }
  }
`;

export const GET_EMPLOYEE_COMPLIANCE_LIST_QUERY = `
  query GetEmployeeComplianceList($filter: EmployeeComplianceFilterInput, $pagination: PaginationInput) {
    employeeComplianceList(filter: $filter, pagination: $pagination) {
      data {
        employeeId
        employeeName
        department
        missingDocuments
        expiringDocuments
        complianceStatus
        lastReminderDate
      }
      metaData {
        page
        size
        total
        totalPages
        hasNext
        hasPrevious
        timestamp
      }
    }
  }
`;

export const SEND_COMPLIANCE_REMINDER_MUTATION = `
  mutation SendComplianceReminder($employeeId: String!, $missingDocuments: [String!]!) {
    sendComplianceReminder(employeeId: $employeeId, missingDocuments: $missingDocuments)
  }
`;
