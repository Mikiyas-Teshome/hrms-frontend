'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSecureMediaUrl } from '@/features/documents/hooks/useSecureMediaUrl';
import { isStoredMediaReference } from '@/features/documents/media-reference.util';
import { cn } from '@/lib/utils';

type SecureAvatarProps = {
    reference?: string | null;
    alt: string;
    fallback: React.ReactNode;
    className?: string;
    fallbackClassName?: string;
    imageClassName?: string;
};

export function SecureAvatar({
    reference,
    alt,
    fallback,
    className,
    fallbackClassName,
    imageClassName,
}: SecureAvatarProps) {
    const { resolvedUrl } = useSecureMediaUrl(reference);
    const directUrl =
        reference && !isStoredMediaReference(reference) ? reference : undefined;
    const src = resolvedUrl ?? directUrl;

    return (
        <Avatar className={className}>
            {src ? (
                <AvatarImage src={src} alt={alt} className={cn('object-cover', imageClassName)} />
            ) : null}
            <AvatarFallback className={fallbackClassName}>{fallback}</AvatarFallback>
        </Avatar>
    );
}
