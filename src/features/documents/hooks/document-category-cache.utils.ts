import {
    DocumentCategory,
    DocumentCategoryFilterInput,
    DocumentCategoryListResponse,
    DocumentCategoryStats,
} from '../documents.types';

export const documentCategoryQueryKeys = {
    list: ['documentCategories'] as const,
    stats: ['document-category-stats'] as const,
    paged: (params: {
        page: number;
        size: number;
        filter: DocumentCategoryFilterInput;
    }) => ['document-categories-paged', params] as const,
};

export type DocumentCategoryPagedParams = {
    page: number;
    size: number;
    filter: DocumentCategoryFilterInput;
};

const countCategoryInStats = (category: DocumentCategory) => ({
    total: 1,
    required: category.required ? 1 : 0,
    expiryRequired: category.expiryRequired ? 1 : 0,
    active: category.status === 'active' ? 1 : 0,
});

export const applyStatsDelta = (
    stats: DocumentCategoryStats,
    delta: { total: number; required: number; expiryRequired: number; active: number },
): DocumentCategoryStats => ({
    total: Math.max(0, stats.total + delta.total),
    required: Math.max(0, stats.required + delta.required),
    expiryRequired: Math.max(0, stats.expiryRequired + delta.expiryRequired),
    active: Math.max(0, stats.active + delta.active),
});

const diffCategoryStats = (before: DocumentCategory, after: DocumentCategory) => {
    const previous = countCategoryInStats(before);
    const next = countCategoryInStats(after);
    return {
        total: 0,
        required: next.required - previous.required,
        expiryRequired: next.expiryRequired - previous.expiryRequired,
        active: next.active - previous.active,
    };
};

export const categoryMatchesFilter = (
    category: DocumentCategory,
    filter: DocumentCategoryFilterInput,
): boolean => {
    if (filter.status && category.status !== filter.status) {
        return false;
    }
    if (filter.appliedTo && category.appliedTo !== filter.appliedTo) {
        return false;
    }
    if (filter.required !== undefined && category.required !== filter.required) {
        return false;
    }
    if (filter.expiryRequired !== undefined && category.expiryRequired !== filter.expiryRequired) {
        return false;
    }
    const search = filter.search?.trim().toLowerCase();
    if (search) {
        const haystack = [category.name, category.type ?? '', category.description ?? '']
            .join(' ')
            .toLowerCase();
        if (!haystack.includes(search)) {
            return false;
        }
    }
    return true;
};

export const syncPagedListAfterSave = (
    current: DocumentCategoryListResponse | undefined,
    saved: DocumentCategory,
    mode: 'create' | 'edit',
    params: DocumentCategoryPagedParams,
    previous?: DocumentCategory,
): DocumentCategoryListResponse | undefined => {
    if (!current) {
        return current;
    }

    const matches = categoryMatchesFilter(saved, params.filter);
    const wasVisible = previous ? categoryMatchesFilter(previous, params.filter) : false;
    const existingIndex = current.data.findIndex((entry) => entry.id === saved.id);
    let data = current.data;
    let total = current.metaData.total;

    if (matches) {
        if (existingIndex >= 0) {
            data = data.map((entry) => (entry.id === saved.id ? saved : entry));
        } else if (mode === 'create' && params.page === 1) {
            data = [saved, ...data].slice(0, params.size);
            total += 1;
        }
    } else if (existingIndex >= 0) {
        data = data.filter((entry) => entry.id !== saved.id);
    }

    if (mode === 'edit') {
        if (wasVisible && !matches) {
            total = Math.max(0, total - 1);
        } else if (!wasVisible && matches) {
            total += 1;
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / params.size));

    return {
        data,
        metaData: {
            ...current.metaData,
            total,
            totalPages,
            hasNext: params.page < totalPages,
            hasPrevious: params.page > 1,
        },
    };
};

export const syncPagedListAfterDelete = (
    current: DocumentCategoryListResponse | undefined,
    deleted: DocumentCategory,
    params: DocumentCategoryPagedParams,
): DocumentCategoryListResponse | undefined => {
    if (!current) {
        return current;
    }

    const wasVisible = categoryMatchesFilter(deleted, params.filter);
    if (!wasVisible) {
        return current;
    }

    const total = Math.max(0, current.metaData.total - 1);
    const totalPages = Math.max(1, Math.ceil(total / params.size));

    return {
        data: current.data.filter((entry) => entry.id !== deleted.id),
        metaData: {
            ...current.metaData,
            total,
            totalPages,
            hasNext: params.page < totalPages,
            hasPrevious: params.page > 1,
        },
    };
};

export const syncStatsAfterSave = (
    stats: DocumentCategoryStats | undefined,
    saved: DocumentCategory,
    mode: 'create' | 'edit',
    previous?: DocumentCategory,
): DocumentCategoryStats | undefined => {
    if (!stats) {
        return stats;
    }

    if (mode === 'create') {
        return applyStatsDelta(stats, countCategoryInStats(saved));
    }

    if (previous) {
        return applyStatsDelta(stats, diffCategoryStats(previous, saved));
    }

    return stats;
};

export const syncStatsAfterDelete = (
    stats: DocumentCategoryStats | undefined,
    deleted: DocumentCategory,
): DocumentCategoryStats | undefined => {
    if (!stats) {
        return stats;
    }

    return applyStatsDelta(stats, {
        total: -1,
        required: deleted.required ? -1 : 0,
        expiryRequired: deleted.expiryRequired ? -1 : 0,
        active: deleted.status === 'active' ? -1 : 0,
    });
};
