'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSecureMediaUrl } from '@/features/documents/hooks/useSecureMediaUrl';

interface ProfileAvatarUploadProps {
    initialUrl?: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
    onUploadError?: (error: string) => void;
    isUploading?: boolean;
    className?: string;
}

export function ProfileAvatarUpload({
    initialUrl,
    onFileSelect,
    onClear,
    onUploadError,
    isUploading = false,
    className,
}: ProfileAvatarUploadProps) {
    const { t } = useTranslation('staffSignup');
    const inputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectionBaseUrl, setSelectionBaseUrl] = useState<string | null>(initialUrl ?? null);
    const [error, setError] = useState<string | null>(null);

    const normalizedInitialUrl = initialUrl ?? null;
    const { resolvedUrl: secureInitialUrl } = useSecureMediaUrl(normalizedInitialUrl);
    const isSelectionStale =
        selectedFile !== null && selectionBaseUrl !== normalizedInitialUrl;
    const effectiveFile = isSelectionStale ? null : selectedFile;

    const objectUrl = useMemo(
        () => (effectiveFile ? URL.createObjectURL(effectiveFile) : null),
        [effectiveFile],
    );

    const preview = objectUrl ?? secureInitialUrl;
    const hasPreview = Boolean(preview);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    const validateFile = (file: File): string | null => {
        if (!file.type.startsWith('image/')) {
            return t('onboarding.avatar.invalidType', 'Only image files (JPG, PNG, WebP) are allowed.');
        }
        if (file.size > 5 * 1024 * 1024) {
            return t('onboarding.avatar.tooLarge', 'File must be under 5 MB.');
        }
        return null;
    };

    const openPicker = () => {
        if (!isUploading) {
            inputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            onUploadError?.(validationError);
            return;
        }

        setSelectionBaseUrl(normalizedInitialUrl);
        setSelectedFile(file);
        setError(null);
        onFileSelect(file);
    };

    const handleClear = () => {
        setSelectionBaseUrl(normalizedInitialUrl);
        setSelectedFile(null);
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onClear();
    };

    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="relative size-24 shrink-0">
                <div
                    className={cn(
                        'relative flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted/40',
                        error && 'border-destructive',
                    )}
                >
                    {hasPreview && preview ? (
                        <Image
                            src={preview}
                            alt={t('onboarding.avatar.label', 'Profile photo')}
                            fill
                            unoptimized
                            sizes="96px"
                            className="object-cover"
                        />
                    ) : (
                        <User className="size-10 text-muted-foreground/50" strokeWidth={1.5} />
                    )}

                    {isUploading ? (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/75 backdrop-blur-[1px]">
                            <Loader2 className="size-6 animate-spin text-primary" />
                        </div>
                    ) : null}
                </div>

                {!isUploading ? (
                    <button
                        type="button"
                        onClick={openPicker}
                        className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
                        aria-label={t('onboarding.avatar.upload', 'Upload photo')}
                    >
                        <Camera className="size-4" />
                    </button>
                ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openPicker}
                        disabled={isUploading}
                    >
                        {hasPreview
                            ? t('onboarding.avatar.change', 'Change photo')
                            : t('onboarding.avatar.upload', 'Upload photo')}
                    </Button>
                    {hasPreview && !isUploading ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-muted-foreground"
                        >
                            <X className="mr-1 size-3.5" />
                            {t('onboarding.avatar.remove', 'Remove')}
                        </Button>
                    ) : null}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {t('onboarding.avatar.hint')}
                </p>
                {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>
        </div>
    );
}
