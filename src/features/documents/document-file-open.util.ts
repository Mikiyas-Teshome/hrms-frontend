'use client';

import {
    fetchDocumentFilePreview,
    fetchStoredMediaPreview,
} from '@/features/documents/documents.actions';

function dataUrlToBlobUrl(dataUrl: string): string {
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) {
        throw new Error('Invalid data URL.');
    }

    const header = dataUrl.slice(0, commaIndex);
    const base64 = dataUrl.slice(commaIndex + 1);
    const mimeMatch = header.match(/^data:([^;,]+)/);
    const mime = mimeMatch?.[1] ?? 'application/octet-stream';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export function openDataUrlInNewTab(dataUrl: string): void {
    const blobUrl = dataUrlToBlobUrl(dataUrl);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

export async function openStoredMediaInNewTab(reference?: string | null): Promise<boolean> {
    const result = await fetchStoredMediaPreview(reference);
    if (!result.success) {
        return false;
    }
    openDataUrlInNewTab(result.data.dataUrl);
    return true;
}

export async function openEmployeeDocumentFile(documentId: string): Promise<boolean> {
    const result = await fetchDocumentFilePreview(documentId);
    if (!result.success) {
        return false;
    }
    openDataUrlInNewTab(result.data.dataUrl);
    return true;
}

export async function downloadEmployeeDocumentFile(
    documentId: string,
    fileName: string,
): Promise<boolean> {
    const result = await fetchDocumentFilePreview(documentId);
    if (!result.success) {
        return false;
    }
    const blobUrl = dataUrlToBlobUrl(result.data.dataUrl);
    const link = window.document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.rel = 'noopener noreferrer';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    return true;
}
