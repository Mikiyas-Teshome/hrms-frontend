import Image from 'next/image';
import {
    LANDING_DASHBOARD_PREVIEW_DARK_IMAGE,
    LANDING_DASHBOARD_PREVIEW_IMAGE,
} from '@/data/landing';
import { cn } from '@/lib/utils';

interface DashboardPreviewProps {
    alt: string;
    fadeBottom?: boolean;
    className?: string;
}

export function DashboardPreview({
    alt,
    fadeBottom = false,
    className,
}: DashboardPreviewProps) {
    return (
        <div
            className={cn(
                'relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5',
                fadeBottom && 'landing-dashboard-preview border-b-transparent shadow-none',
                className,
            )}
        >
            <Image
                src={LANDING_DASHBOARD_PREVIEW_IMAGE}
                alt={alt}
                width={1850}
                height={925}
                className="h-auto w-full dark:hidden"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <Image
                src={LANDING_DASHBOARD_PREVIEW_DARK_IMAGE}
                alt={alt}
                width={1850}
                height={925}
                className="hidden h-auto w-full dark:block"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
            />
            {fadeBottom ? (
                <div
                    className="landing-dashboard-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 sm:h-52"
                    aria-hidden
                />
            ) : null}
        </div>
    );
}
