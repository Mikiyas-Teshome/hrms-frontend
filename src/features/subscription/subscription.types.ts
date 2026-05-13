import { CompanyTier } from '../company/company.types';

export interface PlanType {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    currency: string;
    tier: CompanyTier;
    features?: Record<string, any> | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlanInput {
    currency?: string;
    description?: string | null;
    features?: Record<string, any> | null;
    name: string;
    price: number;
    tier?: CompanyTier;
}

export interface UpdatePlanInput {
    id: string;
    currency?: string | null;
    description?: string | null;
    features?: Record<string, any> | null;
    isActive?: boolean | null;
    name?: string | null;
    price?: number | null;
    tier?: CompanyTier | null;
}
