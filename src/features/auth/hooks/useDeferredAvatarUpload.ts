'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUpdateAvatar } from '@/features/auth/hooks/useAuth';
import { MY_EMPLOYEE_QUERY_KEY } from '@/features/employee/employee.constants';
import { useQueryClient } from '@tanstack/react-query';
import { uploadUserAvatarReference } from '@/features/auth/utils/upload-user-avatar';

type AvatarMutation = 'unchanged' | 'updated' | 'cleared';

export function useDeferredAvatarUpload(initialReference?: string | null) {
    const queryClient = useQueryClient();
    const updateAvatarMutation = useUpdateAvatar();
    const [reference, setReference] = useState<string | null>(initialReference ?? null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [mutation, setMutation] = useState<AvatarMutation>('unchanged');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setReference(initialReference ?? null);
        setPendingFile(null);
        setMutation('unchanged');
    }, [initialReference]);

    const onFileSelect = useCallback((file: File) => {
        setPendingFile(file);
        setMutation('updated');
    }, []);

    const onClear = useCallback(() => {
        setPendingFile(null);
        setMutation('cleared');
    }, []);

    const persistPendingAvatar = useCallback(async () => {
        if (mutation === 'cleared') {
            return null;
        }

        if (!pendingFile) {
            return reference;
        }

        setIsUploading(true);
        try {
            const uploadedReference = await uploadUserAvatarReference(pendingFile);
            await updateAvatarMutation.mutateAsync(uploadedReference);
            setReference(uploadedReference);
            setPendingFile(null);
            setMutation('unchanged');
            await queryClient.invalidateQueries({ queryKey: MY_EMPLOYEE_QUERY_KEY });
            return uploadedReference;
        } finally {
            setIsUploading(false);
        }
    }, [mutation, pendingFile, queryClient, reference, updateAvatarMutation]);

    return {
        reference,
        pendingFile,
        mutation,
        isUploading: isUploading || updateAvatarMutation.isPending,
        onFileSelect,
        onClear,
        persistPendingAvatar,
    };
}
