'use client';

import { useState } from 'react';
import { ExternalLink, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openStoredMediaInNewTab } from '@/features/documents/document-file-open.util';
import { parseStoredMediaReference } from '@/features/documents/media-reference.util';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ContractDocumentPreviewButtonProps = {
    documentReference?: string | null;
    documentName: string;
    className?: string;
    variant?: 'card' | 'button';
    previewLabel?: string;
};

export function ContractDocumentPreviewButton({
    documentReference,
    documentName,
    className,
    variant = 'card',
    previewLabel = 'Preview',
}: ContractDocumentPreviewButtonProps) {
    const { toast } = useToast();
    const [isOpening, setIsOpening] = useState(false);
    const parsedReference = parseStoredMediaReference(documentReference);

    const handlePreview = async () => {
        if (!parsedReference) {
            return;
        }

        setIsOpening(true);
        try {
            if (parsedReference.kind === 'external') {
                window.open(parsedReference.url, '_blank', 'noopener,noreferrer');
                return;
            }

            const opened = await openStoredMediaInNewTab(documentReference);
            if (!opened) {
                throw new Error('Unable to open the contract document.');
            }
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: 'Preview failed',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Unable to open the contract document. Please try again.',
            });
        } finally {
            setIsOpening(false);
        }
    };

    if (!parsedReference) {
        return null;
    }

    if (variant === 'button') {
        return (
            <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn('shrink-0', className)}
                disabled={isOpening}
                onClick={handlePreview}
            >
                {isOpening ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {previewLabel}
            </Button>
        );
    }

    return (
        <button
            type="button"
            onClick={handlePreview}
            disabled={isOpening}
            className={cn(
                'flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left no-underline transition-colors hover:bg-muted/40 disabled:opacity-60',
                className,
            )}
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                </div>
                <div className="min-w-0 flex flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">{documentName}</span>
                    <span className="text-xs text-muted-foreground">Contract document</span>
                </div>
            </div>
            {isOpening ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
        </button>
    );
}
