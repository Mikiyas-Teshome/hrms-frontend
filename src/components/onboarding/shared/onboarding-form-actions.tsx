'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingFormActionsProps {
    onBack?: () => void;
    onContinue?: () => void;
    backLabel: string;
    continueLabel: string;
    continueLabelShort?: string;
    isSubmitting?: boolean;
    continueType?: 'button' | 'submit';
    showBorder?: boolean;
    className?: string;
}

export function OnboardingFormActions({
    onBack,
    onContinue,
    backLabel,
    continueLabel,
    continueLabelShort,
    isSubmitting = false,
    continueType = 'submit',
    showBorder = false,
    className,
}: OnboardingFormActionsProps) {
    return (
        <div
            className={cn(
                'flex min-w-0 items-center justify-between gap-3 pt-8',
                showBorder && 'border-t border-muted',
                className,
            )}
        >
            <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="shrink-0 cursor-pointer flex items-center gap-2 transition-transform hover:-translate-x-1 rtl:hover:translate-x-1 rtl:flex-row-reverse"
            >
                <ArrowLeft className="cursor-pointer size-4 rtl:rotate-180" />
                {backLabel}
            </Button>
            <Button
                type={continueType}
                size="lg"
                onClick={onContinue}
                disabled={isSubmitting}
                className="min-w-0 shrink cursor-pointer px-4 sm:px-8 bg-primary hover:bg-primary/90"
            >
                <span className="sm:hidden">{continueLabelShort ?? continueLabel}</span>
                <span className="hidden sm:inline">{continueLabel}</span>
            </Button>
        </div>
    );
}
