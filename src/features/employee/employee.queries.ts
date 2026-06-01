export const EMPLOYEE_FIELDS_FRAGMENT = `
  fragment EmployeeFields on EmployeeResponse {
    address
    businessEmail
    city
    country
    createdAt
    currency
    dateOfBirth
    departmentId
    email
    emergencyContactRelationship
    employeeNumber
    employmentType
    firstName
    gender
    hireDate
    homeAddress
    homeCity
    homeCountry
    homePhone
    homePostalCode
    homeState
    id
    userId
    activeEmployeeContractId
    jobTitle
    lastName
    managerId
    middleName
    nationalId
    nationality
    passportExpiry
    passportNumber
    personalEmail
    phoneNumber
    postalCode
    previousCompanyId
    previousEmployeeId
    salary
    state
    status
    terminationDate
    transferDate
    updatedAt
    visaExpiry
    visaNumber
    workPermitExpiry
    workPermitNumber
    orgUnit {
      orgUnitId
      orgUnitName
    }
  }
`;

export const CREATE_EMPLOYEE_MUTATION = `
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      ...EmployeeFields
    }
  }
  ${EMPLOYEE_FIELDS_FRAGMENT}
`;

export const UPDATE_MY_EMPLOYEE_PROFILE_MUTATION = `
  mutation UpdateMyEmployeeProfile($input: UpdateMyEmployeeProfileInput!) {
    updateMyEmployeeProfile(input: $input) {
      ...EmployeeFields
    }
  }
  ${EMPLOYEE_FIELDS_FRAGMENT}
`;

export const UPDATE_EMPLOYEE_MUTATION = `
  mutation UpdateEmployee($id: String!, $input: UpdateEmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      ...EmployeeFields
    }
  }
  ${EMPLOYEE_FIELDS_FRAGMENT}
`;

export const DELETE_EMPLOYEE_MUTATION = `
  mutation DeleteEmployee($id: String!) {
    deleteEmployee(id: $id)
  }
`;

export const GET_EMPLOYEE_QUERY = `
  query GetEmployee($id: String!) {
    employee(id: $id) {
      ...EmployeeFields
    }
  }
  ${EMPLOYEE_FIELDS_FRAGMENT}
`;

export const GET_EMPLOYEES_QUERY = `
  query GetEmployees($departmentId: String, $ouId: String, $limit: Float, $page: Float, $status: String) {
    employees(departmentId: $departmentId, ouId: $ouId, limit: $limit, page: $page, status: $status) {
      ...EmployeeFields
    }
  }
  ${EMPLOYEE_FIELDS_FRAGMENT}
`;

export const GET_PAGINATED_EMPLOYEES_QUERY = `
  query GetPaginatedEmployees($pagination: PaginationInput, $filter: PaginatedEmployeesFilterInput) {
    paginatedEmployees(pagination: $pagination, filter: $filter) {
      data {
        ...EmployeeFields
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
  ${EMPLOYEE_FIELDS_FRAGMENT}
`;

export const GET_EMPLOYEE_DIRECTORY_QUERY = `
  query GetEmployeeDirectory {
    employeesDirectory {
      id
      userId
      firstName
      lastName
      departmentId
    }
  }
`;

export const GET_MY_EMPLOYEE_PROFILE_QUERY = `
  query GetMyEmployeeProfile {
    myEmployeeProfile {
      ...EmployeeFields
    }
  }
  ${EMPLOYEE_FIELDS_FRAGMENT}
`;

export const INITIATE_TRANSFER_MUTATION = `
  mutation InitiateTransfer($input: TransferEmployeeInput!) {
    initiateTransfer(input: $input) {
      ...EmployeeFields
    }
  }
  ${EMPLOYEE_FIELDS_FRAGMENT}
`;

export const INVITE_EMPLOYEE_MUTATION = `
  mutation InviteEmployee($input: CreateInvitationInput!) {
    inviteEmployee(input: $input) {
      id
      email
      token
      expiresAt
      createdAt
      companyId
      status
      role
    }
  }
`;

export const INVITE_EMPLOYEES_MUTATION = `
  mutation InviteEmployees($input: BulkInviteEmployeesInput!) {
    inviteEmployees(input: $input) {
      successfulCount
      failedCount
      successfulInvitations {
        id
        email
        token
        expiresAt
        createdAt
        companyId
        status
        role
      }
      failedInvitations {
        email
        reason
        attempts
        rowIndex
      }
    }
  }
`;
export const GET_EMPLOYEE_TRANSFER_HISTORY_QUERY = `
  query GetEmployeeTransferHistory($employeeId: ID!) {
    employeeTransferHistory(employeeId: $employeeId) {
      id
      employeeId
      companyId
      fromDepartmentId
      toDepartmentId
      fromManagerId
      toManagerId
      transferDate
      reason
      processedBy
      createdAt
    }
  }
`;

export const RECORD_TRANSFER_MUTATION = `
  mutation RecordTransfer($input: RecordTransferInput!) {
    recordTransfer(input: $input) {
      id
      employeeId
      companyId
      fromDepartmentId
      toDepartmentId
      fromManagerId
      toManagerId
      transferDate
      reason
      processedBy
      createdAt
    }
  }
`;

export const UPDATE_EMPLOYEE_STATUS_MUTATION = `
  mutation UpdateEmployeeStatus($id: String!, $input: UpdateEmployeeStatusInput!) {
    updateEmployeeStatus(id: $id, input: $input) {
      id
      firstName
      lastName
      status
    }
  }
`;
