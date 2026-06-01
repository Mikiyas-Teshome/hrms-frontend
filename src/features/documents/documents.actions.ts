'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { cookies } from 'next/headers';
import {
    CreateDocumentCategoryInput,
    DocumentCategoryFilterInput,
    DocumentCategoryListResponse,
    EmployeeDocumentFilterInput,
    EmployeeDocumentListResponse,
    EmployeeDocumentStats,
    DocumentCategoryStats,
    UpdateEmployeeDocumentInput,
    ComplianceDashboardStats,
    ComplianceAlert,
    EmployeeComplianceListResponse,
} from './documents.types';
import {
    CREATE_DOCUMENT_CATEGORY_MUTATION,
    DELETE_DOCUMENT_CATEGORY_MUTATION,
    DELETE_DOCUMENT_MUTATION,
    GET_EMPLOYEE_DOCUMENTS_QUERY,
    GET_EMPLOYEE_DOCUMENT_STATS_QUERY,
    GET_DOCUMENT_CATEGORIES_PAGED_QUERY,
    GET_DOCUMENT_CATEGORY_STATUS_QUERY,
    GET_DOCUMENT_CATEGORIES_QUERY,
    GET_DOCUMENT_DOWNLOAD_URL_QUERY,
    UPDATE_EMPLOYEE_DOCUMENT_MUTATION,
    UPDATE_DOCUMENT_CATEGORY_MUTATION,
    GET_COMPLIANCE_DASHBOARD_STATS_QUERY,
    GET_COMPLIANCE_ALERTS_QUERY,
    GET_EMPLOYEE_COMPLIANCE_LIST_QUERY,
    SEND_COMPLIANCE_REMINDER_MUTATION,
} from './documents.queries';
import { DocumentCategory } from './documents.types';
import { ActionResult, safeAction } from '@/lib/safe-action';

export async function fetchEmployeeDocuments(params?: {
    limit?: number;
    offset?: number;
    filter?: EmployeeDocumentFilterInput;
}): Promise<EmployeeDocumentListResponse> {
    try {
        const data = await gqlRequest<{ employeeDocuments: EmployeeDocumentListResponse }>(
            GraphQLService.DOCUMENT,
            GET_EMPLOYEE_DOCUMENTS_QUERY,
            {
                limit: params?.limit,
                offset: params?.offset,
                filter: params?.filter,
            },
        );
        return data.employeeDocuments;
    } catch (error) {
        console.error('Failed to fetch employee documents:', error);
        return {
            data: [],
            pagination: {
                page: 1,
                limit: params?.limit ?? 10,
                total: 0,
                totalPages: 1,
            },
        };
    }
}

export async function fetchEmployeeDocumentStats(): Promise<EmployeeDocumentStats> {
    try {
        const data = await gqlRequest<{ employeeDocumentStats: EmployeeDocumentStats }>(
            GraphQLService.DOCUMENT,
            GET_EMPLOYEE_DOCUMENT_STATS_QUERY,
        );
        return data.employeeDocumentStats;
    } catch (error) {
        console.error('Failed to fetch employee document stats:', error);
        return {
            compliant: 0,
            expired: 0,
            missing: 0,
            nearExpire: 0,
        };
    }
}

export async function fetchDocumentCategories(): Promise<DocumentCategory[]> {
    try {
        const data = await gqlRequest<{ documentCategories: DocumentCategory[] }>(
            GraphQLService.DOCUMENT,
            GET_DOCUMENT_CATEGORIES_QUERY,
            {},
        );
        return data.documentCategories;
    } catch (error) {
        console.error('Failed to fetch document categories:', error);
        return [];
    }
}

export async function fetchDocumentCategoriesPaged(params?: {
    limit?: number;
    offset?: number;
    filter?: DocumentCategoryFilterInput;
}): Promise<DocumentCategoryListResponse> {
    try {
        const data = await gqlRequest<{ documentCategoriesPaginated: DocumentCategoryListResponse }>(
            GraphQLService.DOCUMENT,
            GET_DOCUMENT_CATEGORIES_PAGED_QUERY,
            {
                limit: params?.limit,
                offset: params?.offset,
                filter: params?.filter,
            },
        );
        return data.documentCategoriesPaginated;
    } catch (error) {
        console.error('Failed to fetch paged document categories:', error);
        return {
            data: [],
            pagination: {
                page: 1,
                limit: params?.limit ?? 10,
                total: 0,
                totalPages: 1,
            },
        };
    }
}

export async function fetchDocumentCategoryStatus(): Promise<DocumentCategoryStats> {
    try {
        const data = await gqlRequest<{ documentCategoryStatus: DocumentCategoryStats }>(
            GraphQLService.DOCUMENT,
            GET_DOCUMENT_CATEGORY_STATUS_QUERY,
        );
        return data.documentCategoryStatus;
    } catch (error) {
        console.error('Failed to fetch document category status:', error);
        return {
            total: 0,
            required: 0,
            expiryRequired: 0,
            active: 0,
        };
    }
}

export async function createDocumentCategory(
    input: CreateDocumentCategoryInput,
): Promise<ActionResult<DocumentCategory>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ createDocumentCategory: DocumentCategory }>(
            GraphQLService.DOCUMENT,
            CREATE_DOCUMENT_CATEGORY_MUTATION,
            { input },
        );
        return data.createDocumentCategory;
    });
}

export async function updateDocumentCategory(
    id: string,
    input: Partial<CreateDocumentCategoryInput>,
): Promise<ActionResult<DocumentCategory>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateDocumentCategory: DocumentCategory }>(
            GraphQLService.DOCUMENT,
            UPDATE_DOCUMENT_CATEGORY_MUTATION,
            { id, input },
        );
        return data.updateDocumentCategory;
    });
}

export async function deleteDocumentCategory(id: string): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ deleteDocumentCategory: boolean }>(
            GraphQLService.DOCUMENT,
            DELETE_DOCUMENT_CATEGORY_MUTATION,
            { id },
        );
        return data.deleteDocumentCategory;
    });
}

export async function fetchDocumentDownloadUrl(id: string): Promise<ActionResult<string>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ documentDownloadUrl: string }>(
            GraphQLService.DOCUMENT,
            GET_DOCUMENT_DOWNLOAD_URL_QUERY,
            { id },
        );
        return data.documentDownloadUrl;
    });
}

export async function deleteEmployeeDocument(id: string): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ deleteDocument: boolean }>(
            GraphQLService.DOCUMENT,
            DELETE_DOCUMENT_MUTATION,
            { id },
        );
        return data.deleteDocument;
    });
}

export async function updateEmployeeDocument(
    id: string,
    input: UpdateEmployeeDocumentInput,
): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        await gqlRequest(
            GraphQLService.DOCUMENT,
            UPDATE_EMPLOYEE_DOCUMENT_MUTATION,
            { id, input },
        );
        return true;
    });
}

export type UploadedDocumentMetadata = {
    id: string;
    fileName?: string;
};

export async function uploadEmployeeDocument(
    formData: FormData,
): Promise<ActionResult<UploadedDocumentMetadata>> {
    return safeAction(async () => {
        const baseUrl = process.env.DOCUMENT_SERVICE_URL;
        if (!baseUrl) {
            throw new Error('DOCUMENT_SERVICE_URL is not defined in environment variables.');
        }
        const normalizedBaseUrl = baseUrl.endsWith('/graphql')
            ? baseUrl.slice(0, -'/graphql'.length)
            : baseUrl;

        const cookieStore = await cookies();
        const token = cookieStore.get('hrms.accessToken')?.value;
        if (!token) {
            throw new Error('Not authenticated. Please log in.');
        }

        const response = await fetch(`${normalizedBaseUrl}/api/documents/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || `Upload failed with status ${response.status}`);
        }

        const json = (await response.json()) as { id?: string; fileName?: string };
        if (!json.id) {
            throw new Error('Upload succeeded but no document id was returned.');
        }

        return { id: json.id, fileName: json.fileName };
    });
}

export async function uploadDocumentAndGetUrl(
    formData: FormData,
): Promise<ActionResult<{ id: string; url: string; fileName?: string }>> {
    return safeAction(async () => {
        const uploadResult = await uploadEmployeeDocument(formData);
        if (!uploadResult.success) {
            throw new Error(uploadResult.error);
        }

        const downloadResult = await fetchDocumentDownloadUrl(uploadResult.data.id);
        if (!downloadResult.success) {
            throw new Error(downloadResult.error);
        }

        return {
            id: uploadResult.data.id,
            url: downloadResult.data,
            fileName: uploadResult.data.fileName,
        };
    });
}

export async function uploadLogo(
    formData: FormData,
): Promise<{ url?: string; error?: string }> {
    try {
        const baseUrl = process.env.DOCUMENT_SERVICE_URL;
        if (!baseUrl) {
            return { error: 'DOCUMENT_SERVICE_URL is not defined in environment variables.' };
        }
        const normalizedBaseUrl = baseUrl.endsWith('/graphql')
            ? baseUrl.slice(0, -'/graphql'.length)
            : baseUrl;

        const cookieStore = await cookies();
        const token = cookieStore.get('hrms.accessToken')?.value;
        if (!token) {
            return { error: 'Not authenticated. Please log in.' };
        }

        const response = await fetch(`${normalizedBaseUrl}/api/documents/upload/asset`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const message = await response.text();
            return { error: message || `Upload failed with status ${response.status}` };
        }

        const json = (await response.json()) as { url?: string };
        const url = json.url;

        if (!url) {
            return { error: 'Upload succeeded but no URL was returned by the server.' };
        }

        return { url };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unexpected upload error.';
        return { error: message };
    }
}

export async function fetchComplianceDashboardStats(): Promise<ComplianceDashboardStats> {
    try {
        const data = await gqlRequest<{ complianceDashboardStats: ComplianceDashboardStats }>(
            GraphQLService.DOCUMENT,
            GET_COMPLIANCE_DASHBOARD_STATS_QUERY,
        );
        return data.complianceDashboardStats;
    } catch (error) {
        console.error('Failed to fetch compliance dashboard stats:', error);
        return {
            fullyCompliantEmployeesCount: 0,
            nonCompliantEmployeesCount: 0,
            expiringSoonDocumentsCount: 0,
            totalCompliancePercentage: 100,
        };
    }
}

export async function fetchComplianceAlerts(): Promise<ComplianceAlert[]> {
    try {
        const data = await gqlRequest<{ complianceAlerts: ComplianceAlert[] }>(
            GraphQLService.DOCUMENT,
            GET_COMPLIANCE_ALERTS_QUERY,
        );
        return data.complianceAlerts;
    } catch (error) {
        console.error('Failed to fetch compliance alerts:', error);
        return [];
    }
}

export async function fetchEmployeeComplianceList(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    complianceStatus?: string;
    department?: string;
}): Promise<EmployeeComplianceListResponse> {
    try {
        const data = await gqlRequest<{ employeeComplianceList: EmployeeComplianceListResponse }>(
            GraphQLService.DOCUMENT,
            GET_EMPLOYEE_COMPLIANCE_LIST_QUERY,
            {
                limit: params?.limit,
                offset: params?.offset,
                search: params?.search,
                complianceStatus: params?.complianceStatus,
                department: params?.department,
            },
        );
        return data.employeeComplianceList;
    } catch (error) {
        console.error('Failed to fetch employee compliance list:', error);
        return {
            data: [],
            pagination: {
                page: 1,
                limit: params?.limit ?? 10,
                total: 0,
                totalPages: 1,
            },
        };
    }
}

export async function sendComplianceReminder(
    employeeId: string,
    missingDocuments: string[],
): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ sendComplianceReminder: boolean }>(
            GraphQLService.DOCUMENT,
            SEND_COMPLIANCE_REMINDER_MUTATION,
            { employeeId, missingDocuments },
        );
        return data.sendComplianceReminder;
    });
}
