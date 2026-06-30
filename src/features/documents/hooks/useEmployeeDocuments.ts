import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
    fetchEmployeeDocumentOwners,
    fetchEmployeeDocuments,
    fetchEmployeeDocumentStats,
} from '../documents.actions';
import {
    EmployeeDocumentFilterInput,
    EmployeeDocumentOwnerFilterInput,
} from '../documents.types';

export const employeeDocumentQueryKeys = {
    stats: ['employee-document-stats'] as const,
    ownersPaged: (params: {
        page: number;
        size: number;
        filter: EmployeeDocumentOwnerFilterInput;
    }) => ['employee-document-owners-paged', params] as const,
    paged: (params: {
        page: number;
        size: number;
        filter: EmployeeDocumentFilterInput;
    }) => ['employee-documents-paged', params] as const,
};

export type EmployeeDocumentPagedParams = {
    page: number;
    size: number;
    filter: EmployeeDocumentFilterInput;
};

export type EmployeeDocumentOwnerPagedParams = {
    page: number;
    size: number;
    filter: EmployeeDocumentOwnerFilterInput;
};

export const useEmployeeDocumentStats = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: employeeDocumentQueryKeys.stats,
        queryFn: () => fetchEmployeeDocumentStats(),
        enabled: options?.enabled ?? true,
    });
};

export const useEmployeeDocumentOwnersPaged = (
    params: EmployeeDocumentOwnerPagedParams,
    options?: { enabled?: boolean },
) => {
    return useQuery({
        queryKey: employeeDocumentQueryKeys.ownersPaged(params),
        queryFn: () =>
            fetchEmployeeDocumentOwners({
                pagination: { page: params.page, size: params.size },
                filter: params.filter,
            }),
        placeholderData: keepPreviousData,
        enabled: options?.enabled ?? true,
    });
};

export const useEmployeeDocumentsPaged = (
    params: EmployeeDocumentPagedParams,
    options?: { enabled?: boolean },
) => {
    return useQuery({
        queryKey: employeeDocumentQueryKeys.paged(params),
        queryFn: () =>
            fetchEmployeeDocuments({
                pagination: { page: params.page, size: params.size },
                filter: params.filter,
            }),
        placeholderData: keepPreviousData,
        enabled: options?.enabled ?? true,
    });
};
