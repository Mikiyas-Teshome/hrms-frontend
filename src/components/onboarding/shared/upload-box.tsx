'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CirclePlus, Loader2, X, ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { uploadLogo } from '@/features/documents/documents.actions';

interface UploadBoxProps {
    onUploadSuccess?: (url: string) => void;
    onUploadError?: (error: string) => void;
    onFileSelect?: (file: File) => void;
    onClear?: () => void;
    initialUrl?: string | null;
    className?: string;
    deferUpload?: boolean;
    isUploading?: boolean;
}

export function UploadBox({
    onUploadSuccess,
    onUploadError,
    onFileSelect,
    onClear,
    initialUrl,
    className,
    deferUpload = false,
    isUploading: isUploadingExternal = false,
}: UploadBoxProps) {
    const { t } = useTranslation('companyProfile');
    const inputRef = useRef<HTMLInputElement>(null);
    const ownedBlobUrlRef = useRef<string | null>(null);

    const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isUploadingInternal, setIsUploadingInternal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isUploading = isUploadingExternal || isUploadingInternal;

    const revokeOwnedBlob = () => {
        if (ownedBlobUrlRef.current) {
            URL.revokeObjectURL(ownedBlobUrlRef.current);
            ownedBlobUrlRef.current = null;
        }
    };

    useEffect(() => {
        revokeOwnedBlob();
        setPreview(initialUrl ?? null);
        if (!initialUrl) {
            setFileName(null);
        }
    }, [initialUrl]);

    useEffect(() => () => revokeOwnedBlob(), []);

    const triggerPicker = () => {
        if (!isUploading) inputRef.current?.click();
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        revokeOwnedBlob();
        setPreview(null);
        setFileName(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
        onClear?.();
    };

    const validateFile = (file: File): string | null => {
        if (!file.type.startsWith('image/')) {
            return 'Only image files (jpg, png, webp) are allowed.';
        }
        if (file.size > 5 * 1024 * 1024) {
            return 'File must be under 5 MB.';
        }
        return null;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            onUploadError?.(validationError);
            return;
        }

        revokeOwnedBlob();
        const objectUrl = URL.createObjectURL(file);
        ownedBlobUrlRef.current = objectUrl;
        setPreview(objectUrl);
        setFileName(file.name);
        setError(null);

        if (deferUpload) {
            onFileSelect?.(file);
            return;
        }

        setIsUploadingInternal(true);

        try {
            const body = new FormData();
            body.append('file', file);

            const result = await uploadLogo(body);

            if (result.error || !result.url) {
                throw new Error(result.error ?? 'Upload failed — no URL returned.');
            }

            onUploadSuccess?.(result.url);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : 'Upload failed. Please try again.';
            setError(msg);
            onUploadError?.(msg);
        } finally {
            setIsUploadingInternal(false);
        }
    };

    return (
        <div className="space-y-1.5">
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />

            <div
                role="button"
                tabIndex={0}
                onClick={triggerPicker}
                onKeyDown={(e) => e.key === 'Enter' && triggerPicker()}
                className={cn(
                    'relative flex min-h-29.5 w-full cursor-pointer flex-col items-center justify-center gap-3',
                    'rounded-xl border border-dashed border-border bg-background',
                    'transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isUploading && 'cursor-wait opacity-70 pointer-events-none',
                    error && 'border-destructive',
                    className,
                )}
            >
                {preview ? (
                    <>
                        <Image
                            src={preview}
                            width={64}
                            height={64}
                            alt=""
                            className="h-16 w-16 rounded-lg object-contain"
                        />
                        <p className="max-w-40 truncate text-center text-[11px] text-muted-foreground">
                            {fileName}
                        </p>

                        {isUploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/80 backdrop-blur-sm">
                                <Loader2 className="size-5 animate-spin text-primary" />
                                <span className="text-xs font-medium text-primary">Uploading…</span>
                            </div>
                        )}

                        {!isUploading && (
                            <button
                                type="button"
                                onClick={clearSelection}
                                className={cn(
                                    'absolute right-2 top-2 flex size-6 items-center justify-center rounded-full',
                                    'bg-muted/80 text-muted-foreground shadow-sm',
                                    'transition hover:bg-destructive hover:text-destructive-foreground',
                                )}
                                aria-label="Remove logo"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </>
                ) : isUploading ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                    <>
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                            <CirclePlus className="size-5 text-muted-foreground/60" />
                        </div>
                        <div className="text-center px-4">
                            <p className="text-xs font-medium text-muted-foreground">
                                {t('fields.logoHint', 'Click to upload your logo')}
                            </p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                                {t(
                                    'fields.logoSubtext',
                                    'The file must be jpg or png and below 5MB',
                                )}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <ImageIcon className="size-3.5 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}
