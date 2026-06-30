import { useMutation, useQuery } from '@tanstack/react-query';
import {
    activateCompany,
    createCompany,
    getCompanies,
    getCompany,
    getCompanyBySlug,
    getCompanySubscriptionStatus,
    suspendCompany,
    updateCompany,
    updateCompanyBranding,
    updateCompanyFirebase,
    updateCompanySmtp
} from '../company.actions';
import {
    BrandingInput,
    CreateCompanyInput,
    FirebaseConfigInput,
    SmtpConfigInput,
    UpdateCompanyInput
} from '../company.types';

export const useCreateCompany = () => {
    return useMutation({
        mutationFn: (input: CreateCompanyInput) => createCompany(input),
    });
};

export const useUpdateCompany = () => {
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateCompanyInput }) => updateCompany(id, input),
    });
};

export const useActivateCompany = () => {
    return useMutation({
        mutationFn: (id: string) => activateCompany(id),
    });
};

export const useSuspendCompany = () => {
    return useMutation({
        mutationFn: (id: string) => suspendCompany(id),
    });
};

export const useUpdateCompanyBranding = () => {
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: BrandingInput }) => updateCompanyBranding(id, input),
    });
};

export const useUpdateCompanyFirebase = () => {
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: FirebaseConfigInput }) => updateCompanyFirebase(id, input),
    });
};

export const useUpdateCompanySmtp = () => {
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: SmtpConfigInput }) =>
            updateCompanySmtp(id, input),
    });
};

export const useCompanies = () => {
    return useQuery({
        queryKey: ['companies'],
        queryFn: () => getCompanies(),
    });
};

export const useCompany = (id: string) => {
    return useQuery({
        queryKey: ['company', id],
        queryFn: () => getCompany(id),
        enabled: !!id,
    });
};

export const useCompanyBySlug = (slug: string) => {
    return useQuery({
        queryKey: ['company', 'slug', slug],
        queryFn: () => getCompanyBySlug(slug),
        enabled: !!slug,
    });
};

export const useCompanySubscriptionStatus = (id: string) => {
    return useQuery({
        queryKey: ['company', id, 'subscription-status'],
        queryFn: () => getCompanySubscriptionStatus(id),
        enabled: !!id,
    });
};
