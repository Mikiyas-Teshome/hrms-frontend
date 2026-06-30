import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createDocumentCategory,
    deleteDocumentCategory,
    fetchDocumentCategories,
    fetchDocumentCategoriesPaged,
    fetchDocumentCategoryStatus,
    updateDocumentCategory,
} from '../documents.actions';
import {
    CreateDocumentCategoryInput,
    DocumentCategory,
    DocumentCategoryStats,
} from '../documents.types';
import {
    DocumentCategoryPagedParams,
    documentCategoryQueryKeys,
    syncPagedListAfterDelete,
    syncPagedListAfterSave,
    syncStatsAfterDelete,
    syncStatsAfterSave,
} from './document-category-cache.utils';

export const useDocumentCategories = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: documentCategoryQueryKeys.list,
        queryFn: () => fetchDocumentCategories(),
        enabled: options?.enabled ?? true,
    });
};

export const useDocumentCategoryStats = () => {
    return useQuery({
        queryKey: documentCategoryQueryKeys.stats,
        queryFn: () => fetchDocumentCategoryStatus(),
    });
};

export const useDocumentCategoriesPaged = (params: DocumentCategoryPagedParams) => {
    return useQuery({
        queryKey: documentCategoryQueryKeys.paged(params),
        queryFn: () =>
            fetchDocumentCategoriesPaged({
                pagination: { page: params.page, size: params.size },
                filter: params.filter,
            }),
        placeholderData: keepPreviousData,
    });
};

const patchListCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    listParams: DocumentCategoryPagedParams,
    updater: (
        current: Awaited<ReturnType<typeof fetchDocumentCategoriesPaged>> | undefined,
    ) => Awaited<ReturnType<typeof fetchDocumentCategoriesPaged>> | undefined,
) => {
    queryClient.setQueryData(documentCategoryQueryKeys.paged(listParams), updater);
};

export const useCreateDocumentCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            input,
        }: {
            input: CreateDocumentCategoryInput;
            listParams: DocumentCategoryPagedParams;
        }) => {
            const result = await createDocumentCategory(input);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (saved, { listParams }) => {
            patchListCache(queryClient, listParams, (current) =>
                syncPagedListAfterSave(current, saved, 'create', listParams),
            );
            queryClient.setQueryData<DocumentCategoryStats>(
                documentCategoryQueryKeys.stats,
                (current) => syncStatsAfterSave(current, saved, 'create'),
            );
            queryClient.invalidateQueries({ queryKey: documentCategoryQueryKeys.list });
        },
    });
};

export const useUpdateDocumentCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            input,
        }: {
            id: string;
            input: Partial<CreateDocumentCategoryInput>;
            listParams: DocumentCategoryPagedParams;
            previous?: DocumentCategory;
        }) => {
            const result = await updateDocumentCategory(id, input);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (saved, { listParams, previous }) => {
            patchListCache(queryClient, listParams, (current) =>
                syncPagedListAfterSave(current, saved, 'edit', listParams, previous),
            );
            queryClient.setQueryData<DocumentCategoryStats>(
                documentCategoryQueryKeys.stats,
                (current) => syncStatsAfterSave(current, saved, 'edit', previous),
            );
            queryClient.invalidateQueries({ queryKey: documentCategoryQueryKeys.list });
        },
    });
};

export const useDeleteDocumentCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
        }: {
            id: string;
            deleted: DocumentCategory;
            listParams: DocumentCategoryPagedParams;
        }) => {
            const result = await deleteDocumentCategory(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: (_data, { deleted, listParams }) => {
            patchListCache(queryClient, listParams, (current) =>
                syncPagedListAfterDelete(current, deleted, listParams),
            );
            queryClient.setQueryData<DocumentCategoryStats>(
                documentCategoryQueryKeys.stats,
                (current) => syncStatsAfterDelete(current, deleted),
            );
            queryClient.invalidateQueries({ queryKey: documentCategoryQueryKeys.list });
        },
    });
};
