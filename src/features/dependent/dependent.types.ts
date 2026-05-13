export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type DependentRelationship = 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'OTHER';

export interface Dependent {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: Gender | null;
    relationship: DependentRelationship;
    isCoveredByInsurance: boolean;
    isEligibleForTickets: boolean;
    nationalId?: string | null;
    nationality?: string | null;
    passportNumber?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDependentInput {
    employeeId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: Gender;
    relationship: DependentRelationship;
    isCoveredByInsurance?: boolean;
    isEligibleForTickets?: boolean;
    nationalId?: string;
    nationality?: string;
    passportNumber?: string;
}

export interface UpdateDependentInput {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: Gender;
    relationship?: DependentRelationship;
    isCoveredByInsurance?: boolean;
    isEligibleForTickets?: boolean;
    nationalId?: string;
    nationality?: string;
    passportNumber?: string;
}
