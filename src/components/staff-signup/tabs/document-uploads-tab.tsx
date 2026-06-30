'use client';

import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DocumentCategory } from '@/features/documents/documents.types';
import { cn } from '@/lib/utils';
import {
    buildAcceptString,
    validateCategoryFile,
} from '../utils/onboarding-document-categories';

export type CategoryUploadState = {
    file: File | null;
    expiryDate: string;
    uploadedDocumentId?: string;
    uploadedFileName?: string;
};

interface DocumentUploadsTabProps {
    categories: DocumentCategory[];
    uploadsByCategory: Record<string, CategoryUploadState>;
    onUploadChange: (categoryId: string, state: CategoryUploadState) => void;
    onFileValidationError?: (categoryId: string, error: string | null) => void;
    isLoadingCategories: boolean;
    isCategoriesError?: boolean;
    onRetryCategories?: () => void;
    validationErrors: Record<string, string>;
}

export function DocumentUploadsTab({
    categories,
    uploadsByCategory,
    onUploadChange,
    onFileValidationError,
    isLoadingCategories,
    isCategoriesError = false,
    onRetryCategories,
    validationErrors,
}: DocumentUploadsTabProps) {
    const { t } = useTranslation(['staffSignup', 'document']);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const sortedCategories = useMemo(
        () =>
            [...categories].sort((a, b) => {
                if (a.required !== b.required) {
                    return a.required ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            }),
        [categories],
    );

    const handleFileChange = (category: DocumentCategory, file: File | undefined) => {
        if (!file) {
            return;
        }

        const validationError = validateCategoryFile(file, category);
        if (validationError) {
            onFileValidationError?.(category.id, validationError);
            return;
        }

        onFileValidationError?.(category.id, null);

        const current = uploadsByCategory[category.id];
        onUploadChange(category.id, {
            file,
            expiryDate: current?.expiryDate ?? '',
            uploadedDocumentId: undefined,
            uploadedFileName: file.name,
        });
    };

    if (isLoadingCategories) {
        return (
            <div className="flex min-h-40 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        );
    }

    if (isCategoriesError) {
        return (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">
                    {t('staffSignup:onboarding.documentUploads.loadError')}
                </p>
                {onRetryCategories ? (
                    <button
                        type="button"
                        onClick={onRetryCategories}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        {t('staffSignup:onboarding.documentUploads.retry')}
                    </button>
                ) : null}
            </div>
        );
    }

    if (sortedCategories.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                {t('staffSignup:onboarding.documentUploads.emptyCategories')}
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                    <FileText className="size-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                    {t('staffSignup:onboarding.documentUploads.sectionTitle')}
                </h3>
            </div>

            <p className="text-sm text-muted-foreground">
                {t('staffSignup:onboarding.documentUploads.sectionHint')}
            </p>

            <div className="flex flex-col gap-4">
                {sortedCategories.map((category) => {
                    const upload = uploadsByCategory[category.id];
                    const hasFile = Boolean(upload?.file || upload?.uploadedDocumentId);
                    const displayName =
                        upload?.file?.name ?? upload?.uploadedFileName ?? null;
                    const error = validationErrors[category.id];

                    return (
                        <div
                            key={category.id}
                            className={cn(
                                'rounded-xl border border-border bg-muted/20 p-4',
                                error && 'border-destructive',
                            )}
                        >
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                    {category.name}
                                </span>
                                {category.required ? (
                                    <Badge variant="secondary" className="text-xs">
                                        {t('staffSignup:onboarding.documentUploads.required')}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                                        {t('staffSignup:onboarding.documentUploads.optional')}
                                    </Badge>
                                )}
                                {hasFile ? (
                                    <CheckCircle2 className="size-4 text-emerald-600" />
                                ) : null}
                            </div>

                            {category.description ? (
                                <p className="mb-3 text-xs text-muted-foreground">
                                    {category.description}
                                </p>
                            ) : null}

                            <div className="space-y-2">
                                <div
                                    className={cn(
                                        'grid gap-x-4 gap-y-2',
                                        category.expiryRequired
                                            ? 'md:grid-cols-2'
                                            : 'grid-cols-1',
                                    )}
                                >
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium leading-5">
                                            {t('staffSignup:onboarding.documentUploads.selectFile')}
                                        </Label>
                                        <input
                                            ref={(node) => {
                                                fileInputRefs.current[category.id] = node;
                                            }}
                                            type="file"
                                            accept={buildAcceptString(category.allowedFileTypes)}
                                            className="hidden"
                                            onChange={(event) =>
                                                handleFileChange(
                                                    category,
                                                    event.target.files?.[0],
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRefs.current[category.id]?.click()
                                            }
                                            className="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 text-sm transition hover:bg-muted/50"
                                        >
                                            <span className="min-w-0 truncate text-muted-foreground">
                                                {displayName ??
                                                    t(
                                                        'staffSignup:onboarding.documentUploads.noFileChosen',
                                                    )}
                                            </span>
                                            <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
                                                <Upload className="size-3.5" />
                                                {t(
                                                    'staffSignup:onboarding.documentUploads.chooseFile',
                                                )}
                                            </span>
                                        </button>
                                    </div>

                                    {category.expiryRequired ? (
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`expiry-${category.id}`}
                                                className="text-sm font-medium leading-5"
                                            >
                                                {t(
                                                    'staffSignup:onboarding.documentUploads.expiryDate',
                                                )}
                                            </Label>
                                            <Input
                                                id={`expiry-${category.id}`}
                                                type="date"
                                                value={upload?.expiryDate ?? ''}
                                                className="h-8 w-full"
                                                onChange={(event) =>
                                                    onUploadChange(category.id, {
                                                        file: upload?.file ?? null,
                                                        expiryDate: event.target.value,
                                                        uploadedDocumentId:
                                                            upload?.uploadedDocumentId,
                                                        uploadedFileName:
                                                            upload?.uploadedFileName,
                                                    })
                                                }
                                            />
                                        </div>
                                    ) : null}
                                </div>

                                <p className="text-[11px] leading-relaxed text-muted-foreground">
                                    {t('staffSignup:onboarding.documentUploads.allowedTypes', {
                                        types: category.allowedFileTypes.join(', '),
                                        size: category.maxFileSizeMb ?? 10,
                                    })}
                                </p>
                            </div>

                            {error ? (
                                <p className="mt-2 text-xs text-destructive">{error}</p>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
