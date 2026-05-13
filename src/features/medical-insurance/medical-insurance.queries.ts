export const MEDICAL_INSURANCE_FIELDS_FRAGMENT = `
  fragment MedicalInsuranceFields on MedicalInsurance {
    id
    employeeId
    dependentId
    providerName
    policyNumber
    planType
    cardId
    coverageAmount
    startDate
    endDate
    status
    createdAt
    updatedAt
  }
`;

export const CREATE_MEDICAL_INSURANCE_MUTATION = `
  mutation CreateMedicalInsurance($input: CreateMedicalInsuranceInput!) {
    createMedicalInsurance(input: $input) {
      ...MedicalInsuranceFields
    }
  }
  ${MEDICAL_INSURANCE_FIELDS_FRAGMENT}
`;

export const REMOVE_MEDICAL_INSURANCE_MUTATION = `
  mutation RemoveMedicalInsurance($id: ID!) {
    removeMedicalInsurance(id: $id) {
      ...MedicalInsuranceFields
    }
  }
  ${MEDICAL_INSURANCE_FIELDS_FRAGMENT}
`;

export const UPDATE_MEDICAL_INSURANCE_MUTATION = `
  mutation UpdateMedicalInsurance($id: ID!, $input: UpdateMedicalInsuranceInput!) {
    updateMedicalInsurance(id: $id, input: $input) {
      ...MedicalInsuranceFields
    }
  }
  ${MEDICAL_INSURANCE_FIELDS_FRAGMENT}
`;

export const GET_MEDICAL_INSURANCES_QUERY = `
  query GetMedicalInsurances($employeeId: ID!) {
    medicalInsurances(employeeId: $employeeId) {
      ...MedicalInsuranceFields
    }
  }
  ${MEDICAL_INSURANCE_FIELDS_FRAGMENT}
`;
