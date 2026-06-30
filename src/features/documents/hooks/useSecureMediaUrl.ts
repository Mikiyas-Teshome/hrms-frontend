'use client';

import { useEffect, useState } from 'react';
import { fetchStoredMediaPreview } from '@/features/documents/documents.actions';
import { isStoredMediaReference } from '@/features/documents/media-reference.util';

type SecureMediaCache = {
    reference: string;
    url: string | null;
    error: boolean;
};

export function useSecureMediaUrl(reference?: string | null) {
    const trimmed = reference?.trim() ?? '';
    const needsFetch = Boolean(trimmed) && isStoredMediaReference(trimmed);
    const directUrl = Boolean(trimmed) && !isStoredMediaReference(trimmed) ? trimmed : null;
    const [cache, setCache] = useState<SecureMediaCache | null>(null);

    useEffect(() => {
        if (!needsFetch) {
            return;
        }

        let cancelled = false;

        fetchStoredMediaPreview(trimmed).then((result) => {
            if (cancelled) {
                return;
            }

            setCache({
                reference: trimmed,
                url: result.success ? result.data.dataUrl : null,
                error: !result.success,
            });
        });

        return () => {
            cancelled = true;
        };
    }, [trimmed, needsFetch]);

    if (!trimmed) {
        return { resolvedUrl: null, isLoading: false, error: false };
    }

    if (directUrl) {
        return { resolvedUrl: directUrl, isLoading: false, error: false };
    }

    const isLoading = !cache || cache.reference !== trimmed;
    const error = cache?.reference === trimmed ? cache.error : false;
    const resolvedUrl = cache?.reference === trimmed ? cache.url : null;

    return { resolvedUrl, isLoading, error };
}
