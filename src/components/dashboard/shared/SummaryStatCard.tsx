'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon | React.ElementType;
    iconColor?: string;
    iconBgColor?: string;
    borderColor?: string;
    className?: string;
}

const SummaryStatCard: React.FC<SummaryStatCardProps> = ({
    title,
    value,
    icon: Icon,
    iconColor,
    iconBgColor,
    borderColor,
    className,
}) => {
    return (
        <div 
            className={cn(
                "flex-1 min-w-[240px] bg-card border border-border rounded-[14px] px-3 py-4 sm:p-5 flex items-center gap-4 transition-all",
                "shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]",
                className
            )}
        >
            <div
                className={cn(
                    "size-12 rounded-full flex items-center justify-center shrink-0 border border-transparent",
                    borderColor && "border"
                )}
                style={{ 
                    backgroundColor: iconBgColor || 'transparent',
                    color: iconColor || borderColor || 'currentColor',
                    borderColor: borderColor || 'transparent'
                }}
            >
                <Icon className="size-6" />
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
                <span className="text-sm font-medium text-muted-foreground leading-none truncate" title={title}>
                    {title}
                </span>
                <span className="text-[28px] sm:text-[30px] font-bold text-foreground leading-tight">
                    {value}
                </span>
            </div>
        </div>
    );
};

export default SummaryStatCard;
