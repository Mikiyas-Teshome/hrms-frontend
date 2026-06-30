'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
}

export function SectionLayout({ title, description, children, className }: Props) {
    return (
        <div className={cn('flex flex-col gap-6 max-w-2xl', className)}>
            <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="border-t border-border" />
            <div className="flex flex-col gap-6">
                {children}
            </div>
        </div>
    );
}
