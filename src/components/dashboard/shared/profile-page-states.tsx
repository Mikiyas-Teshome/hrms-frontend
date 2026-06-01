'use client';

import type { ReactNode } from 'react';
import { Loader2, CircleX } from 'lucide-react';

export const PROFILE_PAGE_MIN_HEIGHT_CLASS = 'min-h-[50vh]';

export function ProfilePageLoader() {
    return (
        <div
            className={`flex items-center justify-center w-full ${PROFILE_PAGE_MIN_HEIGHT_CLASS}`}
        >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );
}

export function ProfilePageNotFound({
    message,
    children,
}: {
    message: string;
    children?: ReactNode;
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center w-full gap-4 text-muted-foreground ${PROFILE_PAGE_MIN_HEIGHT_CLASS}`}
        >
            <CircleX className="w-12 h-12 text-destructive/50" />
            <p>{message}</p>
            {children}
        </div>
    );
}
