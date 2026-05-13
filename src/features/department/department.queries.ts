export const DEPARTMENT_FIELDS_FRAGMENT = `
  fragment DepartmentFields on DepartmentResponse {
    id
    name
    description
    code
    companyId
    costCenter
    headEmployeeId
    location
    parentDepartmentId
    status
    createdAt
    updatedAt
  }
`;

export const GET_DEPARTMENTS_QUERY = `
  query GetDepartments {
    departments {
      ...DepartmentFields
    }
  }
  ${DEPARTMENT_FIELDS_FRAGMENT}
`;

export const GET_DEPARTMENT_QUERY = `
  query GetDepartment($id: String!) {
    department(id: $id) {
      ...DepartmentFields
    }
  }
  ${DEPARTMENT_FIELDS_FRAGMENT}
`;

export const CREATE_DEPARTMENT_MUTATION = `
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      ...DepartmentFields
    }
  }
  ${DEPARTMENT_FIELDS_FRAGMENT}
`;

export const UPDATE_DEPARTMENT_MUTATION = `
  mutation UpdateDepartment($id: String!, $input: UpdateDepartmentInput!) {
    updateDepartment(id: $id, input: $input) {
      ...DepartmentFields
    }
  }
  ${DEPARTMENT_FIELDS_FRAGMENT}
`;

export const DELETE_DEPARTMENT_MUTATION = `
  mutation DeleteDepartment($id: String!) {
    deleteDepartment(id: $id)
  }
`;
