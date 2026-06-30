const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const normalizeGraphqlServiceUrl = (value: string) => {
    const trimmed = trimTrailingSlash(value);
    return trimmed.endsWith('/graphql') ? trimmed.slice(0, -'/graphql'.length) : trimmed;
};

export function getDocumentApiBaseUrl(): string {
    const fileApiBaseUrl = process.env.DOCUMENT_FILE_API_BASE_URL?.trim();
    if (fileApiBaseUrl) {
        return normalizeGraphqlServiceUrl(fileApiBaseUrl);
    }

    const documentServiceUrl = process.env.DOCUMENT_SERVICE_URL?.trim();
    if (!documentServiceUrl) {
        throw new Error(
            'DOCUMENT_FILE_API_BASE_URL or DOCUMENT_SERVICE_URL must be defined in environment variables.',
        );
    }

    return normalizeGraphqlServiceUrl(documentServiceUrl);
}

export function getDocumentFileApiUrl(documentId: string): string {
    return `${getDocumentApiBaseUrl()}/api/documents/${documentId}/file`;
}

export function getDocumentUploadApiUrl(): string {
    return `${getDocumentApiBaseUrl()}/api/documents/upload`;
}

export function getDocumentReplaceFileApiUrl(documentId: string): string {
    return `${getDocumentApiBaseUrl()}/api/documents/${documentId}/replace`;
}

export function getDocumentAssetUploadApiUrl(): string {
    return `${getDocumentApiBaseUrl()}/api/documents/upload/asset`;
}

export function getDocumentAssetFileApiUrl(assetId: string): string {
    return `${getDocumentApiBaseUrl()}/api/documents/assets/${assetId}/file`;
}
