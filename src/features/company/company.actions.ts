'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { revalidatePath } from 'next/cache';
import {
    ACTIVATE_COMPANY_MUTATION,
    CREATE_COMPANY_MUTATION,
    SUSPEND_COMPANY_MUTATION,
    UPDATE_COMPANY_MUTATION,
    UPDATE_COMPANY_BRANDING_MUTATION,
    UPDATE_COMPANY_FIREBASE_MUTATION,
    UPDATE_COMPANY_SMTP_MUTATION,
    GET_COMPANIES_QUERY,
    GET_COMPANY_QUERY,
    GET_COMPANY_BY_SLUG_QUERY,
    GET_COMPANY_SUBSCRIPTION_STATUS_QUERY,
    COMPANY_FIREBASE_WEB_CONFIG_QUERY,
} from './company.queries';
import {
    BrandingInput,
    CompanyFirebaseWebConfig,
    CompanyResponse,
    CreateCompanyInput,
    FirebaseConfigInput,
    SmtpConfigInput,
    SubscriptionStatusResponse,
    UpdateCompanyInput
} from './company.types';

export async function createCompany(input: CreateCompanyInput): Promise<CompanyResponse> {
    const data = await gqlRequest<{ createCompany: CompanyResponse }>(
        GraphQLService.AUTH,
        CREATE_COMPANY_MUTATION,
        { input }
    );
    revalidatePath('/dashboard/companies');
    return data.createCompany;
}

export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<CompanyResponse> {
    const data = await gqlRequest<{ updateCompany: CompanyResponse }>(
        GraphQLService.AUTH,
        UPDATE_COMPANY_MUTATION,
        { id, input }
    );
    revalidatePath(`/dashboard/companies/${id}`);
    revalidatePath('/dashboard/companies');
    return data.updateCompany;
}

export async function activateCompany(id: string): Promise<CompanyResponse> {
    const data = await gqlRequest<{ activateCompany: CompanyResponse }>(
        GraphQLService.AUTH,
        ACTIVATE_COMPANY_MUTATION,
        { id }
    );
    revalidatePath(`/dashboard/companies/${id}`);
    revalidatePath('/dashboard/companies');
    return data.activateCompany;
}

export async function suspendCompany(id: string): Promise<CompanyResponse> {
    const data = await gqlRequest<{ suspendCompany: CompanyResponse }>(
        GraphQLService.AUTH,
        SUSPEND_COMPANY_MUTATION,
        { id }
    );
    revalidatePath(`/dashboard/companies/${id}`);
    revalidatePath('/dashboard/companies');
    return data.suspendCompany;
}

export async function updateCompanyBranding(id: string, input: BrandingInput): Promise<CompanyResponse> {
    const data = await gqlRequest<{ updateCompanyBranding: CompanyResponse }>(
        GraphQLService.AUTH,
        UPDATE_COMPANY_BRANDING_MUTATION,
        { id, input }
    );
    revalidatePath(`/dashboard/companies/${id}/settings`);
    return data.updateCompanyBranding;
}

export async function updateCompanyFirebase(id: string, input: FirebaseConfigInput): Promise<CompanyResponse> {
    const data = await gqlRequest<{ updateCompanyFirebase: CompanyResponse }>(
        GraphQLService.AUTH,
        UPDATE_COMPANY_FIREBASE_MUTATION,
        { id, input }
    );
    revalidatePath(`/dashboard/companies/${id}/settings`);
    return data.updateCompanyFirebase;
}

export async function updateCompanySmtp(id: string, input: SmtpConfigInput): Promise<CompanyResponse> {
    const data = await gqlRequest<{ updateCompanySmtp: CompanyResponse }>(
        GraphQLService.AUTH,
        UPDATE_COMPANY_SMTP_MUTATION,
        { id, input }
    );
    revalidatePath(`/dashboard/companies/${id}/settings`);
    return data.updateCompanySmtp;
}

export async function getCompanies(): Promise<CompanyResponse[]> {
    const data = await gqlRequest<{ companies: CompanyResponse[] }>(
        GraphQLService.AUTH,
        GET_COMPANIES_QUERY
    );
    return data.companies;
}

export async function getCompany(id: string): Promise<CompanyResponse> {
    const data = await gqlRequest<{ company: CompanyResponse }>(
        GraphQLService.AUTH,
        GET_COMPANY_QUERY,
        { id }
    );
    return data.company;
}

export async function getCompanyBySlug(slug: string): Promise<CompanyResponse> {
    const data = await gqlRequest<{ companyBySlug: CompanyResponse }>(
        GraphQLService.AUTH,
        GET_COMPANY_BY_SLUG_QUERY,
        { slug }
    );
    return data.companyBySlug;
}

export async function getCompanySubscriptionStatus(id: string): Promise<SubscriptionStatusResponse> {
    const data = await gqlRequest<{ companySubscriptionStatus: SubscriptionStatusResponse }>(
        GraphQLService.AUTH,
        GET_COMPANY_SUBSCRIPTION_STATUS_QUERY,
        { id }
    );
    return data.companySubscriptionStatus;
}

export async function fetchCompanyFirebaseWebConfig(): Promise<CompanyFirebaseWebConfig | null> {
    try {
        const data = await gqlRequest<{ companyFirebaseWebConfig: CompanyFirebaseWebConfig }>(
            GraphQLService.AUTH,
            COMPANY_FIREBASE_WEB_CONFIG_QUERY,
            {},
        );
        return data.companyFirebaseWebConfig;
    } catch {
        return null;
    }
}
