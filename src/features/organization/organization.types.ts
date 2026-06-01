import { UserResponse } from '../auth/auth.types';

export type OUType = 'COMPANY' | 'DIVISION' | 'DEPARTMENT' | 'GROUP' | 'SUB_DIVISION';

export interface CompanyProfileType {
    address: string;
    currency: string;
    dunsNumber?: string | null;
    id: string;
    industry?: string | null;
    legalName: string;
    registrationNumber: string;
    taxId: string;
    themeColor?: string | null;
    timezone: string;
    tradeLicenseNumber: string;
}

export interface OrganizationUnitType {
    children: OrganizationUnitType[];
    companyProfile?: CompanyProfileType | null;
    displayLabel?: string | null;
    id: string;
    companyId?: string | null;
    members: UserResponse[];
    name: string;
    parentId?: string | null;
    status: string;
    totalMembers: number;
    employeeCount?: number;
    type: OUType;
}

export interface OrganizationLabelType {
    label: string;
    language: string;
    type: string;
}

export interface AssignUserOuInput {
    ouId: string;
    roleId?: string | null;
    userId: string;
}

export interface CreateOrganizationUnitInput {
    address?: string | null;
    currency?: string | null;
    dunsNumber?: string | null;
    industry?: string | null;
    legalName?: string | null;
    name: string;
    parentId?: string | null;
    registrationNumber?: string | null;
    taxId?: string | null;
    themeColor?: string | null;
    timezone?: string | null;
    tradeLicenseNumber?: string | null;
    type: OUType;
}

export interface UpdateOrganizationUnitInput {
    address?: string | null;
    currency?: string | null;
    dunsNumber?: string | null;
    id: string;
    industry?: string | null;
    legalName?: string | null;
    name?: string | null;
    registrationNumber?: string | null;
    status?: string | null;
    taxId?: string | null;
    themeColor?: string | null;
    timezone?: string | null;
    tradeLicenseNumber?: string | null;
}

export interface NomenclatureInput {
    label: string;
    type: string;
}
