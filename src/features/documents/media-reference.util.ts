export const DOCUMENT_REFERENCE_PREFIX = 'hrms:document:';
export const ASSET_REFERENCE_PREFIX = 'hrms:asset:';

export type StoredMediaReference =
    | { kind: 'document'; id: string }
    | { kind: 'asset'; id: string }
    | { kind: 'external'; url: string };

export function encodeDocumentReference(documentId: string): string {
    return `${DOCUMENT_REFERENCE_PREFIX}${documentId}`;
}

export function encodeAssetReference(assetId: string): string {
    return `${ASSET_REFERENCE_PREFIX}${assetId}`;
}

export function parseStoredMediaReference(value?: string | null): StoredMediaReference | null {
    const trimmed = value?.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith(DOCUMENT_REFERENCE_PREFIX)) {
        const id = trimmed.slice(DOCUMENT_REFERENCE_PREFIX.length);
        return id ? { kind: 'document', id } : null;
    }

    if (trimmed.startsWith(ASSET_REFERENCE_PREFIX)) {
        const id = trimmed.slice(ASSET_REFERENCE_PREFIX.length);
        return id ? { kind: 'asset', id } : null;
    }

    return { kind: 'external', url: trimmed };
}

export function isStoredMediaReference(value?: string | null): boolean {
    const parsed = parseStoredMediaReference(value);
    return parsed?.kind === 'document' || parsed?.kind === 'asset';
}
