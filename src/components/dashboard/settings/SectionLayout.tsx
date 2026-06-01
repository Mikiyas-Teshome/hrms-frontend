'use client';

import React from 'react';

interface Props {
    title: string;
    description: string;
    children: React.ReactNode;
}

export function SectionLayout({ title, description, children }: Props) {
    return (
        <div className="flex flex-col gap-6 max-w-2xl">
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
