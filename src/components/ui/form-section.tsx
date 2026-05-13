import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
}

export function FormSection({
    title,
    description,
    icon: Icon,
    children,
    className,
}: FormSectionProps) {
    return (
        <div className={cn('rounded-[12px] border bg-card  space-y-3 sm:space-y-4', className)}>
            <div className="bg-muted/50 flex items-center px-3 sm:px-4 lg:px-6 py-4.5 gap-2">
                {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />}
                <div className="min-w-0">
                    <h3 className="font-medium text-sm sm:text-base leading-tight">{title}</h3>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="px-3 sm:px-4 lg:px-6 py-4.5 space-y-3 sm:space-y-4">{children}</div>
        </div>
    );
}
