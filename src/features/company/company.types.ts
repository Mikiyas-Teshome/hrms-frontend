export type CompanyStatus = 'active' | 'suspended' | 'pending' | 'inactive';
export type CompanyTier = 'free' | 'basic' | 'professional' | 'enterprise';

export interface CompanyResponse {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logo?: string | null;
    website?: string | null;
    status: CompanyStatus;
    tier: CompanyTier;
    currentEmployees: number;
    maxEmployees: number;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionStatusResponse {
    status: string;
    expiresAt?: string | null;
    plan?: string | null;
}

export interface CreateCompanyInput {
    address?: string | null;
    adminEmail: string;
    city?: string | null;
    country?: string | null;
    description?: string | null;
    email?: string | null;
    industry?: string | null;
    logoUrl?: string | null;
    name: string;
    phoneNumber?: string | null;
    postalCode?: string | null;
    size?: string | null;
    slug: string;
    state?: string | null;
    tier?: CompanyTier | null;
    website?: string | null;
}

export interface UpdateCompanyInput {
    address?: string | null;
    city?: string | null;
    country?: string | null;
    description?: string | null;
    email?: string | null;
    industry?: string | null;
    logoUrl?: string | null;
    name?: string | null;
    phoneNumber?: string | null;
    postalCode?: string | null;
    size?: string | null;
    slug?: string | null;
    state?: string | null;
    website?: string | null;
}

export interface BrandingInput {
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
}

export interface FirebaseConfigInput {
    firebaseApiKey: string;
    firebaseAppId: string;
    firebaseMessagingSenderId: string;
    firebaseProjectId: string;
    firebaseServerKey?: string | null;
}

export interface SmtpConfigInput {
    fromEmail: string;
    fromName: string;
    host: string;
    password: string;
    port: number;
    secure: boolean;
    username: string;
}
